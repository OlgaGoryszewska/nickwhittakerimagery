"use client";

import { useSyncExternalStore } from "react";
import type { Photo } from "@/app/lib/catalog";

const STORAGE_KEY = "nwi-recently-viewed";
const MAX_ITEMS = 12;
const EMPTY: Photo[] = [];

// Same module-level + useSyncExternalStore pattern as CartContext — a plain
// useState+useEffect pair would risk a hydration mismatch between the
// server's empty history and whatever was in the browser's localStorage.
let viewed: Photo[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
  } catch {
    // Storage may be unavailable (private mode, quota) — history still works in-memory.
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  if (!hydrated) {
    hydrated = true;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) viewed = JSON.parse(raw);
    } catch {
      // Ignore malformed/inaccessible storage — start from empty history.
    }
  }
  return viewed;
}

function getServerSnapshot() {
  return EMPTY;
}

export function recordPhotoView(photo: Photo) {
  viewed = [photo, ...viewed.filter((p) => p.src !== photo.src)].slice(0, MAX_ITEMS);
  persist();
  notify();
}

export function useRecentlyViewed(): Photo[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
