"use client";

import { useCallback, useEffect, useState } from "react";

// ponytail: shortlist lives in localStorage, keyed by profile id (works for both
// creators and restaurants). Move to a saved_profiles table when shortlists need
// to sync across devices / users. Replaces the old garnish:saved-creators key.
const KEY = "garnish:saved";
const EVENT = "garnish:saved-change";

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable (private mode) — keep the in-memory state only
  }
  // `storage` only fires in other tabs; this syncs components in the same tab.
  window.dispatchEvent(new Event(EVENT));
}

/** Subscribe to the saved set; re-renders on change in this or any other tab. */
export function useSaved() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const next = new Set(read());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    write([...next]);
  }, []);

  return { ids, has: (id: string) => ids.includes(id), toggle };
}
