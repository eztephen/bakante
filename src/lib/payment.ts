import type { PaymentMethod } from "./types";

// ─── The provider boundary ───────────────────────────────────────────────────
// Everything the checkout knows about payments goes through this interface.
// The demo ships MockProvider; a real launch swaps in PayMongo (cards, GCash and
// Maya in the Philippines) or Stripe without touching the UI.

export type ChargeRequest = {
  method: PaymentMethod;
  amount: number; // pesos
  reference: string;
  card?: { number: string; name: string; expiry: string; cvc: string };
  gcash?: { mobile: string; otp: string };
  maya?: { mobile: string };
};

export type ChargeResult =
  | { ok: true; transactionId: string; methodDetail: string; paidAt: number }
  | { ok: false; reason: string };

export interface PaymentProvider {
  charge(request: ChargeRequest): Promise<ChargeResult>;
}

// ─── Test data shown in the demo UI ──────────────────────────────────────────
export const TEST_CARDS = {
  success: "4242 4242 4242 4242",
  declined: "4000 0000 0000 0002",
  insufficient: "4000 0000 0000 9995",
};
export const DEMO_OTP = "123456";

// ─── Validation ──────────────────────────────────────────────────────────────
export const digitsOnly = (s: string) => s.replace(/\D/g, "");

export function luhnValid(number: string): boolean {
  const digits = digitsOnly(number);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

export const formatCardNumber = (raw: string) => digitsOnly(raw).slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");

export function formatExpiry(raw: string): string {
  const d = digitsOnly(raw).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

export function expiryValid(expiry: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export const cardBrand = (number: string) => {
  const d = digitsOnly(number);
  if (d.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return "Mastercard";
  if (/^3[47]/.test(d)) return "Amex";
  return "Card";
};

// PH mobiles: 09XX XXX XXXX or +639XX XXX XXXX
export const mobileValid = (mobile: string) => /^(09\d{9}|639\d{9})$/.test(digitsOnly(mobile));
export const formatMobile = (raw: string) => {
  const d = digitsOnly(raw).replace(/^63/, "0").slice(0, 11);
  return d.replace(/(\d{4})(\d{3})(\d{0,4})/, (_, a, b, c) => (c ? `${a} ${b} ${c}` : b ? `${a} ${b}` : a));
};
export const maskMobile = (mobile: string) => {
  const d = digitsOnly(mobile).replace(/^63/, "0");
  return `${d.slice(0, 4)} ··· ${d.slice(-3)}`;
};

// ─── Mock provider ───────────────────────────────────────────────────────────
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const mockProvider: PaymentProvider = {
  async charge(req) {
    await wait(1400 + Math.random() * 900); // feel like a real gateway round-trip
    const txn = "txn_demo_" + Math.random().toString(36).slice(2, 10);
    const paidAt = Date.now();

    if (req.method === "card") {
      const number = digitsOnly(req.card?.number ?? "");
      if (number === digitsOnly(TEST_CARDS.declined)) return { ok: false, reason: "Your card was declined. Try another card or pay with GCash." };
      if (number === digitsOnly(TEST_CARDS.insufficient)) return { ok: false, reason: "Insufficient funds on this card." };
      if (!luhnValid(number)) return { ok: false, reason: "That card number isn't valid." };
      return { ok: true, transactionId: txn, methodDetail: `${cardBrand(number)} ending ${number.slice(-4)}`, paidAt };
    }
    if (req.method === "gcash") {
      if (req.gcash?.otp !== DEMO_OTP) return { ok: false, reason: "That code didn't match. Check the SMS and try again." };
      return { ok: true, transactionId: txn, methodDetail: `GCash ${maskMobile(req.gcash.mobile)}`, paidAt };
    }
    return { ok: true, transactionId: txn, methodDetail: `Maya ${maskMobile(req.maya?.mobile ?? "")}`, paidAt };
  },
};
