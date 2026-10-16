import type { Venue } from "./types";

// FNV-1a: cheap, deterministic, and the same on every visit — so the demo's
// "already booked" slots don't shuffle each time the page loads.
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Roughly a third of daytime slots and over half of evening slots are taken by other players.
export function isPrebooked(venueId: string, unitId: string, date: string, hour: number): boolean {
  const roll = hash(`${venueId}|${unitId}|${date}|${hour}`) % 100;
  return roll < (hour >= 17 ? 55 : 30);
}

export const slotHours = (venue: Venue) => Array.from({ length: venue.close - venue.open }, (_, i) => venue.open + i);

// A slot is bookable until the hour has started.
export const isPast = (date: string, hour: number, now: Date, todayKey: string) =>
  date < todayKey || (date === todayKey && hour <= now.getHours());
