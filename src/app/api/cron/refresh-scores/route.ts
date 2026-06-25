import { NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { syncCreatorScore } from "@/app/actions/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STALE_AFTER_DAYS = 7;
const BATCH_LIMIT = 50;

/** Authorize via `Authorization: Bearer <CRON_SECRET>` (Vercel Cron) or `x-cron-secret`. */
function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return request.headers.get("x-cron-secret") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const staleBefore = new Date(
    Date.now() - STALE_AFTER_DAYS * 86_400_000
  ).toISOString();

  const { data, error } = await supabase
    .from("creator_profiles")
    .select("id")
    .or(`ugc_scored_at.is.null,ugc_scored_at.lt.${staleBefore}`)
    .limit(BATCH_LIMIT);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const ids: string[] = (data ?? []).map((r: { id: string }) => r.id);
  const results = await Promise.allSettled(
    ids.map((id: string) => syncCreatorScore(id))
  );
  const refreshed = results.filter((r) => r.status === "fulfilled").length;

  return Response.json({
    requested: ids.length,
    refreshed,
    failed: ids.length - refreshed,
  });
}
