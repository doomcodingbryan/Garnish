import { devFixtures, devUser, type DevRole } from "@/lib/dev";

type Row = Record<string, unknown>;
type Result = { data: unknown; error: { message: string } | null; count: number | null };

/**
 * Minimal chainable, awaitable stand-in for a Supabase PostgREST query builder.
 * Applies the filters the app actually uses (eq/gte/lte/in/order/range) against
 * in-memory fixtures and treats writes as successful no-ops. Anything it does
 * not model degrades to "return the rows as-is" rather than throwing.
 */
class MockQuery implements PromiseLike<Result> {
  private op: "select" | "write" = "select";
  private writePayload: Row | Row[] | null = null;
  private eqs: [string, unknown][] = [];
  private gtes: [string, number][] = [];
  private ltes: [string, number][] = [];
  private ins: [string, unknown[]][] = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private limitN: number | null = null;
  private isSingle = false;

  constructor(private rows: Row[]) {}

  select() {
    return this;
  }
  insert(payload: Row | Row[]) {
    this.op = "write";
    this.writePayload = payload;
    return this;
  }
  update(payload: Row) {
    this.op = "write";
    this.writePayload = payload;
    return this;
  }
  upsert(payload: Row | Row[]) {
    this.op = "write";
    this.writePayload = payload;
    return this;
  }
  delete() {
    this.op = "write";
    this.writePayload = null;
    return this;
  }

  eq(col: string, val: unknown) {
    this.eqs.push([col, val]);
    return this;
  }
  gte(col: string, val: number) {
    this.gtes.push([col, val]);
    return this;
  }
  lte(col: string, val: number) {
    this.ltes.push([col, val]);
    return this;
  }
  in(col: string, vals: unknown[]) {
    this.ins.push([col, vals]);
    return this;
  }
  // Filters the app uses but the mock ignores (returns rows unfiltered).
  neq() { return this; }
  gt() { return this; }
  lt() { return this; }
  like() { return this; }
  ilike() { return this; }
  or() { return this; }
  overlaps() { return this; }
  contains() { return this; }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }
  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  single() {
    this.isSingle = true;
    return this;
  }
  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  private compute(): Result {
    if (this.op === "write") {
      const payload = Array.isArray(this.writePayload)
        ? this.writePayload[0]
        : this.writePayload;
      const data = payload
        ? { id: (payload.id as string) ?? `dev-${Date.now()}`, ...payload }
        : null;
      return { data: this.isSingle ? data : data ? [data] : [], error: null, count: null };
    }

    let rows = [...this.rows];
    for (const [c, v] of this.eqs) rows = rows.filter((r) => r[c] === v);
    for (const [c, v] of this.gtes)
      rows = rows.filter((r) => r[c] != null && (r[c] as number) >= v);
    for (const [c, v] of this.ltes)
      rows = rows.filter((r) => r[c] != null && (r[c] as number) <= v);
    for (const [c, vals] of this.ins) rows = rows.filter((r) => vals.includes(r[c]));

    if (this.orderCol) {
      const col = this.orderCol;
      rows.sort((a, b) => {
        const av = a[col];
        const bv = b[col];
        if (av == null && bv == null) return 0;
        if (av == null) return 1; // nulls last
        if (bv == null) return -1;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return this.orderAsc ? cmp : -cmp;
      });
    }

    if (this.rangeFrom != null) {
      rows = rows.slice(this.rangeFrom, (this.rangeTo ?? rows.length - 1) + 1);
    } else if (this.limitN != null) {
      rows = rows.slice(0, this.limitN);
    }

    if (this.isSingle) {
      return { data: rows[0] ?? null, error: null, count: null };
    }
    return { data: rows, error: null, count: rows.length };
  }

  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    try {
      return Promise.resolve(this.compute()).then(onfulfilled, onrejected);
    } catch (e) {
      return Promise.reject(e).then(onfulfilled, onrejected);
    }
  }
}

/**
 * In-memory mock of the Supabase client used when DEV_AUTH_BYPASS is on.
 * Returns a fake authenticated user for `role` and serves fixture rows.
 */
export function createMockClient(role: DevRole) {
  const fixtures = devFixtures();
  const u = devUser(role);
  const authUser = { ...u, app_metadata: {}, user_metadata: {}, aud: "authenticated" };

  return {
    auth: {
      getUser: async () => ({ data: { user: authUser }, error: null }),
      getSession: async () => ({
        data: { session: { user: authUser } },
        error: null,
      }),
      signInWithPassword: async () => ({ data: { user: authUser }, error: null }),
      signUp: async () => ({ data: { user: authUser, session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from(table: string) {
      return new MockQuery(fixtures[table] ?? []);
    },
    rpc: async () => ({ data: null, error: null }),
  };
}
