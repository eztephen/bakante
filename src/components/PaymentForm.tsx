"use client";

import { useState } from "react";
import type { PaymentMethod } from "@/lib/types";
import {
  DEMO_OTP,
  TEST_CARDS,
  expiryValid,
  formatCardNumber,
  formatExpiry,
  formatMobile,
  luhnValid,
  mobileValid,
  type ChargeRequest,
} from "@/lib/payment";
import { formatPeso } from "@/lib/pricing";

const METHODS: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: "gcash", label: "GCash", hint: "Most popular" },
  { id: "maya", label: "Maya", hint: "Wallet or card" },
  { id: "card", label: "Card", hint: "Visa · Mastercard" },
];

interface PaymentFormProps {
  amount: number;
  reference: string;
  busy: boolean;
  error: string | null;
  onPay: (request: Omit<ChargeRequest, "amount" | "reference">) => void;
}

export default function PaymentForm({ amount, reference, busy, error, onPay }: PaymentFormProps) {
  const [method, setMethod] = useState<PaymentMethod>("gcash");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [touched, setTouched] = useState(false);

  const cardErrors = {
    number: luhnValid(card.number) ? "" : "Enter a valid card number.",
    name: card.name.trim() ? "" : "Name as printed on the card.",
    expiry: expiryValid(card.expiry) ? "" : "Use MM/YY, in the future.",
    cvc: /^\d{3,4}$/.test(card.cvc) ? "" : "3 or 4 digits.",
  };
  const mobileError = mobileValid(mobile) ? "" : "Enter an 11-digit PH mobile, e.g. 0917 123 4567.";
  const otpError = /^\d{6}$/.test(otp) ? "" : "Enter the 6-digit code.";

  const valid =
    method === "card" ? !Object.values(cardErrors).some(Boolean) : method === "gcash" ? !mobileError && otpSent && !otpError : !mobileError;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    if (method === "card") onPay({ method, card });
    else if (method === "gcash") onPay({ method, gcash: { mobile, otp } });
    else onPay({ method, maya: { mobile } });
  };

  const show = (msg: string) => (touched && msg ? msg : "");

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" aria-busy={busy}>
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Payment method">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={method === m.id}
            onClick={() => {
              setMethod(m.id);
              setTouched(false);
            }}
            className={`flex flex-col items-start rounded-lg border-[1.5px] px-3 py-2.5 text-left transition-colors ${
              method === m.id ? "border-court bg-court-wash" : "border-line hover:border-ink-faint"
            }`}
          >
            <span className="font-display text-[1.2rem] leading-none font-bold">{m.label}</span>
            <span className="text-[0.74rem] text-ink-soft">{m.hint}</span>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-tangerine/60 bg-tangerine-wash px-3.5 py-2.5 text-[0.82rem] text-ink">
        <b className="font-semibold">Demo payment.</b>{" "}
        {method === "card" && (
          <>
            Use <code className="font-mono">{TEST_CARDS.success}</code> to succeed, <code className="font-mono">{TEST_CARDS.declined}</code> to see a decline. Any future expiry and CVC.
          </>
        )}
        {method === "gcash" && (
          <>
            Any PH mobile number works. The one-time code is <code className="font-mono">{DEMO_OTP}</code>; any other code fails.
          </>
        )}
        {method === "maya" && <>Any PH mobile number works — Maya approves instantly in this demo.</>}
      </div>

      {method === "card" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="label-caps">Card number</span>
            <input
              inputMode="numeric"
              autoComplete="cc-number"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
              placeholder="4242 4242 4242 4242"
              className="field font-mono"
              aria-invalid={!!show(cardErrors.number)}
            />
            {show(cardErrors.number) && <span className="field-error">{cardErrors.number}</span>}
          </label>
          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="label-caps">Name on card</span>
            <input autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className="field" aria-invalid={!!show(cardErrors.name)} />
            {show(cardErrors.name) && <span className="field-error">{cardErrors.name}</span>}
          </label>
          <label className="flex flex-col gap-1">
            <span className="label-caps">Expiry</span>
            <input inputMode="numeric" autoComplete="cc-exp" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} placeholder="MM/YY" className="field font-mono" aria-invalid={!!show(cardErrors.expiry)} />
            {show(cardErrors.expiry) && <span className="field-error">{cardErrors.expiry}</span>}
          </label>
          <label className="flex flex-col gap-1">
            <span className="label-caps">CVC</span>
            <input inputMode="numeric" autoComplete="cc-csc" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="123" className="field font-mono" aria-invalid={!!show(cardErrors.cvc)} />
            {show(cardErrors.cvc) && <span className="field-error">{cardErrors.cvc}</span>}
          </label>
        </div>
      )}

      {method !== "card" && (
        <div className="grid gap-3">
          <label className="flex flex-col gap-1">
            <span className="label-caps">{method === "gcash" ? "GCash" : "Maya"} mobile number</span>
            <input
              inputMode="tel"
              autoComplete="tel-national"
              value={mobile}
              onChange={(e) => {
                setMobile(formatMobile(e.target.value));
                setOtpSent(false);
                setOtp("");
              }}
              placeholder="0917 123 4567"
              className="field font-mono"
              aria-invalid={!!show(mobileError)}
            />
            {show(mobileError) && <span className="field-error">{mobileError}</span>}
          </label>
          {method === "gcash" &&
            (otpSent ? (
              <label className="flex flex-col gap-1">
                <span className="label-caps">One-time code sent to {mobile}</span>
                <input inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6 digits" className="field font-mono tracking-[0.3em]" aria-invalid={!!show(otpError)} />
                {show(otpError) && <span className="field-error">{otpError}</span>}
              </label>
            ) : (
              <button
                type="button"
                className="btn btn-ghost self-start"
                disabled={!mobileValid(mobile)}
                onClick={() => {
                  setOtpSent(true);
                  setTouched(false);
                }}
              >
                Send one-time code
              </button>
            ))}
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg border border-danger bg-danger-wash px-3.5 py-3 text-[0.9rem] text-danger">
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary w-full text-[1.15rem]" disabled={busy || (method === "gcash" && !otpSent)}>
        {busy ? "Processing…" : `Pay ${formatPeso(amount)}`}
      </button>
      <p className="text-center text-[0.76rem] text-ink-faint">
        Reference {reference}. In a real launch this form is served by PayMongo or Stripe — card details never touch our servers.
      </p>
    </form>
  );
}
