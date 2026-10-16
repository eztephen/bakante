import type { Session, Unit, Venue } from "./types";
import { isWeekend } from "./dates";

export const PEAK_START = 17; // 5pm onwards costs more, as do weekends
export const PEAK_MULTIPLIER = 1.2;

export const isPeak = (date: string, hour: number) => hour >= PEAK_START || isWeekend(date);

export function sessionPrice(venue: Venue, unit: Unit, date: string, hour: number): number {
  const base = venue.rates[unit.sport] ?? 0;
  return Math.round(isPeak(date, hour) ? base * PEAK_MULTIPLIER : base);
}

export const fromRate = (venue: Venue) => Math.min(...Object.values(venue.rates));

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 });
export const formatPeso = (amount: number) => peso.format(amount);

export type PricedSession = Session & { price: number; venue: Venue; unit: Unit };

export function priceSessions(
  sessions: Session[],
  lookup: { venue: (id: string) => Venue | undefined; unit: (venue: Venue, id: string) => Unit | undefined },
): PricedSession[] {
  return sessions.flatMap((s) => {
    const venue = lookup.venue(s.venueId);
    const unit = venue && lookup.unit(venue, s.unitId);
    return venue && unit ? [{ ...s, venue, unit, price: sessionPrice(venue, unit, s.date, s.hour) }] : [];
  });
}

export const totalOf = (priced: { price: number }[]) => priced.reduce((sum, s) => sum + s.price, 0);
