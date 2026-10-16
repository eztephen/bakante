"use client";

import Link from "next/link";
import { useState } from "react";
import { dateKey } from "@/lib/dates";
import { useHydrated, useStore } from "@/lib/store";
import { bookingsStore, cancelBooking } from "@/lib/stores";
import { useNow } from "@/lib/useNow";
import type { Booking } from "@/lib/types";
import BookingPass from "./BookingPass";

const firstDate = (b: Booking) => [...b.sessions].sort((a, c) => (a.date < c.date ? -1 : 1))[0]?.date ?? "";

export default function BookingsList() {
  const hydrated = useHydrated();
  const now = useNow();
  const bookings = useStore(bookingsStore);
  const [confirming, setConfirming] = useState<string | null>(null);

  if (!hydrated || !now) return <div className="min-h-[30vh]" aria-busy="true" />;

  const today = dateKey(now);
  const upcoming = bookings.filter((b) => b.status === "confirmed" && firstDate(b) >= today).sort((a, b) => (firstDate(a) < firstDate(b) ? -1 : 1));
  const past = bookings.filter((b) => !upcoming.includes(b));

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-10 text-center">
        <h2 className="font-display text-[1.8rem] font-bold">No bookings yet</h2>
        <p className="mt-2 text-ink-soft">Your court passes will show up here after you book.</p>
        <Link href="/" className="btn btn-court mt-6">
          Find a court
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <BookingGroup title="Upcoming" items={upcoming} today={today} confirming={confirming} setConfirming={setConfirming} />
      <BookingGroup title="Past & cancelled" items={past} today={today} confirming={confirming} setConfirming={setConfirming} />
    </div>
  );
}

interface BookingGroupProps {
  title: string;
  items: Booking[];
  today: string;
  confirming: string | null;
  setConfirming: (ref: string | null) => void;
}

function BookingGroup({ title, items, today, confirming, setConfirming }: BookingGroupProps) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-4" aria-label={title}>
      <h2 className="court-rule pt-3 font-display text-[1.6rem] leading-none font-extrabold uppercase">{title}</h2>
      {items.map((b) => (
        <div key={b.ref} className="flex flex-col gap-2">
          <BookingPass booking={b} compact={b.status === "cancelled"} />
          {b.status === "confirmed" &&
            firstDate(b) >= today &&
            (confirming === b.ref ? (
              <div className="flex flex-wrap items-center gap-3 text-[0.9rem]" role="group" aria-label="Confirm cancellation">
                <span>Cancel this booking? The slots go back on sale.</span>
                <button
                  type="button"
                  className="btn btn-sm bg-danger text-white"
                  onClick={() => {
                    cancelBooking(b.ref);
                    setConfirming(null);
                  }}
                >
                  Yes, cancel
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(null)}>
                  Keep it
                </button>
              </div>
            ) : (
              <button type="button" className="self-start text-[0.85rem] text-ink-faint underline-offset-2 hover:text-danger hover:underline" onClick={() => setConfirming(b.ref)}>
                Cancel booking
              </button>
            ))}
        </div>
      ))}
    </section>
  );
}
