"use client";

import Link from "next/link";
import { unitOf, venueById } from "@/data/courts";
import { formatFullDate, formatHour, sessionOrder } from "@/lib/dates";
import { formatPeso, priceSessions, totalOf } from "@/lib/pricing";
import { useStore, useHydrated } from "@/lib/store";
import { cartStore, clearCart, removeSession } from "@/lib/stores";

// Sticky on desktop, a fixed bar on phones. Shows every selected session, not just this venue's.
export default function CartSummary({ currentVenueId }: { currentVenueId?: string }) {
  const hydrated = useHydrated();
  const cart = useStore(cartStore);
  const priced = priceSessions([...cart].sort(sessionOrder), { venue: venueById, unit: unitOf });
  const total = totalOf(priced);
  const count = priced.length;

  if (!hydrated) return null;

  return (
    <>
      <aside className="hidden flex-col gap-3 rounded-xl border border-line bg-surface p-5 lg:sticky lg:top-24 lg:flex" aria-label="Your sessions">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-[1.3rem] leading-none font-bold">Your sessions</h3>
          {count > 0 && (
            <button type="button" onClick={clearCart} className="text-[0.8rem] text-ink-faint underline-offset-2 hover:text-danger hover:underline">
              Clear
            </button>
          )}
        </div>
        {count === 0 ? (
          <p className="text-[0.9rem] text-ink-soft">Nothing selected yet. Tap an hour on the left.</p>
        ) : (
          <ul className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {priced.map((s) => (
              <li key={`${s.venueId}-${s.unitId}-${s.date}-${s.hour}`} className="flex items-start justify-between gap-2 border-b border-line-soft pb-2 text-[0.88rem] last:border-b-0">
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {s.venueId === currentVenueId ? s.unit.name : `${s.venue.name} · ${s.unit.name}`}
                  </div>
                  <div className="text-ink-soft">
                    {formatFullDate(s.date)} · {formatHour(s.hour)}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-[0.82rem] tabular-nums">{formatPeso(s.price)}</span>
                  <button type="button" onClick={() => removeSession(s)} aria-label="Remove session" className="text-ink-faint hover:text-danger">
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-[0.85rem] text-ink-soft">
            {count} session{count === 1 ? "" : "s"}
          </span>
          <span className="font-display text-[1.6rem] leading-none font-bold tabular-nums">{formatPeso(total)}</span>
        </div>
        <Link href="/checkout" aria-disabled={count === 0} className={`btn btn-primary w-full ${count === 0 ? "pointer-events-none opacity-50" : ""}`}>
          Continue to checkout
        </Link>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden" role="region" aria-label="Your sessions">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display text-[1.4rem] leading-none font-bold tabular-nums">{formatPeso(total)}</div>
            <div className="truncate text-[0.8rem] text-ink-soft">
              {count === 0 ? "Tap an hour to start" : `${count} session${count === 1 ? "" : "s"} selected`}
            </div>
          </div>
          <Link href="/checkout" aria-disabled={count === 0} className={`btn btn-primary ${count === 0 ? "pointer-events-none opacity-50" : ""}`}>
            Checkout
          </Link>
        </div>
      </div>
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </>
  );
}
