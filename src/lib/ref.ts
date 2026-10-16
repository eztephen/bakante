// No 0/O or 1/I, so a reference can be read out over the phone without confusion.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRef(): string {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return "BK-" + Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export const makeTransactionId = () => "txn_demo_" + Math.random().toString(36).slice(2, 10);
