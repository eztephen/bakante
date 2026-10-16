import type { Booking } from "@/lib/types";
import { unitOf, venueById } from "@/data/courts";
import { formatFullDate, formatHour, formatPaidAt, sessionOrder } from "@/lib/dates";
import { formatPeso, priceSessions } from "@/lib/pricing";

// A deterministic 7×7 pattern from the reference, so each pass looks distinct.
function pattern(ref: string): boolean[] {
  let h = 2166136261;
  for (let i = 0; i < ref.length; i++) h = Math.imul(h ^ ref.charCodeAt(i), 16777619);
  return Array.from({ length: 49 }, (_, i) => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return i < 7 || i % 7 === 0 || i % 7 === 6 || i >= 42 ? true : (h >>> 0) % 3 !== 0;
  });
}

export default function BookingPass({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const priced = priceSessions([...booking.sessions].sort(sessionOrder), { venue: venueById, unit: unitOf });
  const venues = [...new Set(priced.map((s) => s.venue.name))];
  const cancelled = booking.status === "cancelled";
  const cells = pattern(booking.ref);

  return (
    <article className={`overflow-hidden rounded-xl border bg-surface ${cancelled ? "border-line opacity-70" : "border-court"}`} aria-label={`Booking ${booking.ref}`}>
      <div className={`flex items-center justify-between gap-4 px-5 py-3 ${cancelled ? "bg-line-soft text-ink-soft" : "bg-court text-white"}`}>
        <div>
          <span className="block text-[0.68rem] tracking-[0.14em] uppercase opacity-80">{cancelled ? "Cancelled" : "Court pass"}</span>
          <span className="font-mono text-[1.35rem] font-semibold tracking-[0.08em]">{booking.ref}</span>
        </div>
        {!cancelled && (
          <div className="grid shrink-0 grid-cols-7 gap-[2px]" aria-hidden="true">
            {cells.map((on, i) => (
              <span key={i} className={`size-[5px] rounded-[1px] ${on ? "bg-white" : "bg-white/15"}`} />
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3 px-5 py-4">
        <div className="font-display text-[1.3rem] leading-tight font-bold">{venues.join(" · ")}</div>
        <ul className="flex flex-col gap-1.5 text-[0.9rem]">
          {priced.map((s) => (
            <li key={`${s.venueId}-${s.unitId}-${s.date}-${s.hour}`} className="flex justify-between gap-3">
              <span className="text-ink-soft">
                {formatFullDate(s.date)} · {formatHour(s.hour)} · {venues.length > 1 ? `${s.venue.name} · ` : ""}
                {s.unit.name}
              </span>
              <span className="font-mono tabular-nums">{formatPeso(s.price)}</span>
            </li>
          ))}
        </ul>
        {!compact && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line-soft pt-3 text-[0.85rem] sm:grid-cols-4">
            <div>
              <dt className="label-caps">Paid</dt>
              <dd className="font-display text-[1.3rem] leading-none font-bold">{formatPeso(booking.total)}</dd>
            </div>
            <div>
              <dt className="label-caps">Via</dt>
              <dd>{booking.methodDetail}</dd>
            </div>
            <div>
              <dt className="label-caps">On</dt>
              <dd>{formatPaidAt(booking.paidAt)}</dd>
            </div>
            <div>
              <dt className="label-caps">Player</dt>
              <dd>{booking.player.name}</dd>
            </div>
          </dl>
        )}
        {!cancelled && !compact && <p className="text-[0.78rem] text-ink-faint">Show this screen at the front desk. Demo pass — not a real reservation.</p>}
      </div>
    </article>
  );
}
