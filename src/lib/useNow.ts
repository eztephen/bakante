"use client";

import { useSyncExternalStore } from "react";

// The current time, to the minute, and null in static HTML — so the server never
// claims which slots are in the past.
const subscribe = (cb: () => void) => {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
};
const minuteNow = () => Math.floor(Date.now() / 60_000);

export function useNow(): Date | null {
  const minute = useSyncExternalStore(subscribe, minuteNow, () => null);
  return minute === null ? null : new Date(minute * 60_000);
}
