"use client";

import { useState } from "react";
import { SITE } from "@/config/site";
import { SPORT_LABEL, sportsAt } from "@/data/courts";
import type { Sport, Venue } from "@/lib/types";
import { dateKey, formatDay, formatHour, formatLongDate, nextDays } from "@/lib/dates";
import { isPast, isPrebooked, slotHours } from "@/lib/availability";
import { isPeak, formatPeso, sessionPrice, PEAK_START } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { bookingsStore, cartStore, isBookedByMe, sameSession, toggleSession } from "@/lib/stores";
import { useNow } from "@/lib/useNow";
import SportIcon from "./SportIcon";
import CartSummary from "./CartSummary";

export default function BookingPanel({ venue }: { venue: Venue }) {
  const now = useNow();
  const sports = sportsAt(venue);
  const [sport, setSport] = useState<Sport>(sports[0]);
  const units = venue.units.filter((u) => u.sport === sport);
  const [unitId, setUnitId] = useState(units[0].id);
  const unit = units.find((u) => u.id === unitId) ?? units[0];
  const [date, setDate] = useState<string | null>(null);
  const cart = useStore(cartStore);
  const bookings = useStore(bookingsStore);

  const pickSport = (s: Sport) => {
    setSport(s);
    setUnitId(venue.units.find((u) => u.sport === s)!.id);
  };

  if (!now) {
    return (
      <div className="rounded-xl border border-line bg-surface p-6" aria-busy="true" aria-label="Loading availability">
        <div className="h-5 w-40 rounded bg-line-soft" />
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="h-14 rounded-lg bg-line-soft" />
          ))}
        </div>
      </div>
    );
  }

  const today = dateKey(now);
  const days = nextDays(SITE.daysBookable, now);
  const selectedDate = date ?? today;
  const hours = slotHours(venue);
  const mine = cart.filter((s) => s.venueId === venue.id);
  const countOn = (d: string) => mine.filter((s) => s.date === d).length;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex min-w-0 flex-col gap-6 rounded-xl border border-line bg-surface p-4 sm:p-6">
        {sports.length > 1 && (
          <div>
            <span className="label-caps mb-2">Sport</span>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Sport">
              {sports.map((s) => (
                <button key={s} type="button" className="chip" aria-pressed={sport === s} onClick={() => pickSport(s)}>
                  <SportIcon sport={s} className="size-3.5" />
                  {SPORT_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="label-caps mb-2">Court</span>
          <div className="scroll-x" role="group" aria-label="Court">
            {units.map((u) => (
              <button key={u.id} type="button" className="chip" aria-pressed={u.id === unit.id} onClick={() => setUnitId(u.id)}>
                {u.name}
                <span className="text-[0.72rem] opacity-70">{u.surface}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <span className="label-caps">Date</span>
            <span className="text-[0.8rem] text-ink-faint">Next {SITE.daysBookable} days</span>
          </div>
          <div className="scroll-x" role="group" aria-label="Date">
            {days.map((d) => {
              const f = formatDay(d);
              const picked = d === selectedDate;
              const n = countOn(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={picked}
                  onClick={() => setDate(d)}
                  className={`relative flex w-[4.4rem] flex-col items-center rounded-lg border py-2 transition-colors ${
                    picked ? "border-court bg-court text-white" : "border-line bg-surface hover:border-court"
                  }`}
                >
                  <span className="text-[0.7rem] uppercase opacity-80">{d === today ? "Today" : f.weekday}</span>
                  <span className="font-display text-[1.5rem] leading-none font-bold">{f.day}</span>
                  <span className="text-[0.7rem] opacity-80">{f.month}</span>
                  {n > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-tangerine font-mono text-[0.68rem] font-semibold text-on-tangerine" aria-label={`${n} selected`}>
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-[1.4rem] leading-none font-bold">
              {unit.name} · {formatLongDate(selectedDate)}
            </h3>
            <span className="text-[0.8rem] text-ink-faint">Tap the hours you want — pick as many as you like, on as many days as you like.</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {hours.map((hour) => {
              const session = { venueId: venue.id, unitId: unit.id, date: selectedDate, hour };
              const past = isPast(selectedDate, hour, now, today);
              const taken = !past && (isPrebooked(venue.id, unit.id, selectedDate, hour) || isBookedByMe(bookings, session));
              const selected = cart.some((s) => sameSession(s, session));
              const price = sessionPrice(venue, unit, selectedDate, hour);
              return (
                <button
                  key={hour}
                  type="button"
                  disabled={past || taken}
                  aria-pressed={selected}
                  onClick={() => toggleSession(session)}
                  className={`slot ${taken ? "slot-taken" : ""} ${past ? "slot-past" : ""}`}
                  aria-label={`${formatHour(hour)}, ${past ? "past" : taken ? "taken" : formatPeso(price)}`}
                >
                  <span className="slot-time">{formatHour(hour)}</span>
                  <span className="slot-price">{past ? "Past" : taken ? "Taken" : `${formatPeso(price)}${isPeak(selectedDate, hour) ? " · peak" : ""}`}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[0.8rem] text-ink-faint">
            Peak rate (+20%) applies from {formatHour(PEAK_START)} and all day on weekends. Striped slots are already booked.
          </p>
        </div>
      </div>

      <CartSummary currentVenueId={venue.id} />
    </div>
  );
}
