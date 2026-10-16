"use client";

import { useSyncExternalStore } from "react";

// A tiny localStorage-backed store that React can subscribe to. The server
// snapshot is always `initial`, so static HTML never contains browser state and
// hydration is clean; the real data appears on the client's first re-render.
export function createStore<T>(key: string, initial: T) {
  const listeners = new Set<() => void>();
  let raw: string | null = null;
  let cache: T = initial;

  const read = (): T => {
    if (typeof window === "undefined") return initial;
    try {
      const current = window.localStorage.getItem(key);
      if (current !== raw) {
        raw = current;
        cache = current ? (JSON.parse(current) as T) : initial;
      }
    } catch {
      // private mode or blocked storage — fall through with whatever we have
    }
    return cache;
  };

  const write = (next: T) => {
    cache = next;
    try {
      raw = JSON.stringify(next);
      window.localStorage.setItem(key, raw);
    } catch {
      // storage unavailable: keep it in memory for this page
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => e.key === key && listener();
    window.addEventListener("storage", onStorage); // another tab changed it
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  return {
    subscribe,
    get: read,
    getServer: () => initial,
    set: write,
    update: (fn: (current: T) => T) => write(fn(read())),
  };
}

export type Store<T> = ReturnType<typeof createStore<T>>;

export const useStore = <T,>(store: Store<T>) => useSyncExternalStore(store.subscribe, store.get, store.getServer);

// True once React is running in the browser; false in static HTML.
const noop = () => () => {};
export const useHydrated = () => useSyncExternalStore(noop, () => true, () => false);
