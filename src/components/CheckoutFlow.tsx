"use client";

import Link from "next/link";
import { useState } from "react";
import { unitOf, venueById } from "@/data/courts";
import { formatFullDate, formatHour, sessionOrder } from "@/lib/dates";
import { mockProvider, type ChargeRequest } from "@/lib/payment";
import { formatPeso, priceSessions, totalOf } from "@/lib/pricing";
import { makeRef } from "@/lib/ref";
import { useHydrated, useStore } from "@/lib/store";
import { addBooking, cartStore, clearCart, playerStore, removeSession } from "@/lib/stores";
import type { Booking, Player } from "@/lib/types";
import PaymentForm from "./PaymentForm";
import BookingPass from "./BookingPass";

type Step = "review" | "details" | "payment" | "done";
const STEPS: { id: Step; label: string }[] = [
  { id: "review", label: "Sessions" },
  { id: "details", label: "Your details" },
  { id: "payment", label: "Payment" },
  { id: "done", label: "Confirmed" },
];

export default function CheckoutFlow() {
  const hydrated = useHydrated();
  const cart = useStore(cartStore);
  const savedPlayer = useStore(playerStore);
  const [step, setStep] = useState<Step>("review");
  const [player, setPlayer] = useState<Player | null>(null);
  const [reference] = useState(makeRef);
  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  if (!hydrated) return <div className="min-h-[40vh]" aria-busy="true" />;

  const priced = priceSessions([...cart].sort(sessionOrder), { venue: venueById, unit: unitOf });
  const total = totalOf(priced);
  const current = player ?? savedPlayer;

  if (step !== "done" && priced.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-10 text-center">
        <h2 className="font-display text-[1.8rem] font-bold">Nothing to check out yet</h2>
        <p className="mt-2 text-ink-soft">Pick a court and tap the hours you want to play.</p>
        <Link href="/" className="btn btn-court mt-6">
          Find a court
        </Link>
      </div>
    );
  }

  const pay = async (req: Omit<ChargeRequest, "amount" | "reference">) => {
    setBusy(true);
    setPayError(null);
    const result = await mockProvider.charge({ ...req, amount: total, reference });
    setBusy(false);
    if (!result.ok) return setPayError(result.reason);
    const confirmed: Booking = {
      ref: reference,
      sessions: priced.map(({ venueId, unitId, date, hour }) => ({ venueId, unitId, date, hour })),
      total,
      method: req.method,
      methodDetail: result.methodDetail,
      transactionId: result.transactionId,
      paidAt: result.paidAt,
      player: current,
      status: "confirmed",
    };
    addBooking(confirmed);
    clearCart();
    setBooking(confirmed);
    setStep("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="min-w-0">
        <ol className="mb-6 flex flex-wrap gap-x-5 gap-y-1 text-[0.85rem]" aria-label="Checkout progress">
          {STEPS.map((s, i) => (
            <li key={s.id} aria-current={s.id === step ? "step" : undefined} className={`flex items-center gap-1.5 ${i <= stepIndex ? "text-ink" : "text-ink-faint"}`}>
              <span className={`grid size-5 place-items-center rounded-full font-mono text-[0.7rem] ${i < stepIndex ? "bg-court text-white" : i === stepIndex ? "bg-tangerine text-on-tangerine" : "border border-line"}`}>
                {i < stepIndex ? "✓" : i + 1}
              </span>
              {s.label}
            </li>
          ))}
        </ol>

        {step === "review" && (
          <section className="flex flex-col gap-4" aria-labelledby="review-h">
            <h2 id="review-h" className="font-display text-[2rem] leading-none font-extrabold uppercase">
              Your sessions
            </h2>
            <ul className="divide-y divide-line-soft rounded-xl border border-line bg-surface">
              {priced.map((s) => (
                <li key={`${s.venueId}-${s.unitId}-${s.date}-${s.hour}`} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {s.venue.name} <span className="text-ink-faint">·</span> {s.unit.name}
                    </div>
                    <div className="text-[0.88rem] text-ink-soft">
                      {formatFullDate(s.date)} · {formatHour(s.hour)} – {formatHour(s.hour + 1)}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="font-mono tabular-nums">{formatPeso(s.price)}</span>
                    <button type="button" onClick={() => removeSession(s)} className="text-[0.82rem] text-ink-faint hover:text-danger">
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/" className="text-[0.9rem] text-court underline-offset-2 hover:underline">
                + Add more sessions
              </Link>
              <button type="button" className="btn btn-primary" onClick={() => setStep("details")}>
                Continue
              </button>
            </div>
          </section>
        )}

        {step === "details" && (
          <DetailsForm
            initial={current}
            onBack={() => setStep("review")}
            onNext={(p) => {
              setPlayer(p);
              playerStore.set(p);
              setStep("payment");
            }}
          />
        )}

        {step === "payment" && (
          <section className="flex flex-col gap-4" aria-labelledby="pay-h">
            <h2 id="pay-h" className="font-display text-[2rem] leading-none font-extrabold uppercase">
              Payment
            </h2>
            <PaymentForm amount={total} reference={reference} busy={busy} error={payError} onPay={pay} />
            <button type="button" className="self-start text-[0.9rem] text-ink-soft hover:text-ink" onClick={() => setStep("details")} disabled={busy}>
              ← Back
            </button>
          </section>
        )}

        {step === "done" && booking && (
          <section className="flex flex-col gap-5" aria-labelledby="done-h">
            <div className="flex items-center gap-4">
              <svg className="pop-in size-14 shrink-0" viewBox="0 0 56 56" aria-hidden="true">
                <circle cx="28" cy="28" r="26" fill="var(--court-wash)" stroke="var(--court)" strokeWidth="2" />
                <path d="M17 29l8 8 15-17" fill="none" stroke="var(--court)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="check-draw" />
              </svg>
              <div>
                <h2 id="done-h" className="font-display text-[2rem] leading-none font-extrabold uppercase">
                  You&rsquo;re booked
                </h2>
                <p className="mt-1 text-ink-soft">Confirmation sent to {booking.player.email}. See you on court.</p>
              </div>
            </div>
            <BookingPass booking={booking} />
            <div className="flex flex-wrap gap-3">
              <Link href="/bookings" className="btn btn-court">
                My bookings
              </Link>
              <Link href="/" className="btn btn-ghost">
                Book another court
              </Link>
            </div>
          </section>
        )}
      </div>

      {step !== "done" && (
        <aside className="rounded-xl border border-line bg-surface p-5 lg:sticky lg:top-24" aria-label="Order summary">
          <h3 className="label-caps mb-3">Summary</h3>
          <dl className="flex flex-col gap-1.5 text-[0.9rem]">
            <div className="flex justify-between">
              <dt className="text-ink-soft">
                {priced.length} session{priced.length === 1 ? "" : "s"}
              </dt>
              <dd className="font-mono tabular-nums">{formatPeso(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Booking fee</dt>
              <dd className="font-mono tabular-nums">{formatPeso(0)}</dd>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-medium">Total</dt>
              <dd className="font-display text-[1.7rem] leading-none font-bold tabular-nums">{formatPeso(total)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[0.78rem] text-ink-faint">Free cancellation up to 24 hours before the first session.</p>
        </aside>
      )}

      {busy && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-paper/80 backdrop-blur-sm" role="status" aria-live="assertive">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-line bg-surface px-8 py-7 shadow-[var(--shadow)]">
            <span className="spinner" />
            <span className="font-display text-[1.3rem] font-bold">Confirming with the venue…</span>
            <span className="text-[0.85rem] text-ink-soft">Don&rsquo;t close this page.</span>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailsForm({ initial, onBack, onNext }: { initial: Player; onBack: () => void; onNext: (p: Player) => void }) {
  const [form, setForm] = useState<Player>(initial);
  const [touched, setTouched] = useState(false);
  const errors = {
    name: form.name.trim().length >= 2 ? "" : "We need a name for the booking.",
    mobile: /^(09\d{9}|639\d{9})$/.test(form.mobile.replace(/\D/g, "")) ? "" : "An 11-digit PH mobile, so the venue can reach you.",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "" : "Where should the confirmation go?",
  };
  const valid = !Object.values(errors).some(Boolean);
  const show = (m: string) => (touched && m ? m : "");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (valid) onNext({ ...form, name: form.name.trim(), email: form.email.trim() });
      }}
    >
      <h2 className="font-display text-[2rem] leading-none font-extrabold uppercase">Your details</h2>
      <label className="flex flex-col gap-1">
        <span className="label-caps">Name</span>
        <input autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" aria-invalid={!!show(errors.name)} />
        {show(errors.name) && <span className="field-error">{errors.name}</span>}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="label-caps">Mobile</span>
          <input inputMode="tel" autoComplete="tel-national" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="0917 123 4567" className="field" aria-invalid={!!show(errors.mobile)} />
          {show(errors.mobile) && <span className="field-error">{errors.mobile}</span>}
        </label>
        <label className="flex flex-col gap-1">
          <span className="label-caps">Email</span>
          <input type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" aria-invalid={!!show(errors.email)} />
          {show(errors.email) && <span className="field-error">{errors.email}</span>}
        </label>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="text-[0.9rem] text-ink-soft hover:text-ink" onClick={onBack}>
          ← Back
        </button>
        <button type="submit" className="btn btn-primary">
          Continue to payment
        </button>
      </div>
    </form>
  );
}
