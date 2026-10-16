const pad = (n: number) => String(n).padStart(2, "0");

// Local-date keys, YYYY-MM-DD. Everything books in the venue's own day, never UTC.
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function nextDays(count: number, from = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    return dateKey(d);
  });
}

export const isWeekend = (key: string) => [0, 6].includes(parseKey(key).getDay());

export function formatHour(h: number): string {
  const suffix = h >= 12 && h < 24 ? "PM" : "AM";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}:00 ${suffix}`;
}

export const formatSlot = (h: number) => `${formatHour(h)} – ${formatHour(h + 1)}`;

const weekday = new Intl.DateTimeFormat("en-PH", { weekday: "short" });
const dayNum = new Intl.DateTimeFormat("en-PH", { day: "numeric" });
const monthShort = new Intl.DateTimeFormat("en-PH", { month: "short" });
const longDate = new Intl.DateTimeFormat("en-PH", { weekday: "long", day: "numeric", month: "long" });
const fullDate = new Intl.DateTimeFormat("en-PH", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export const formatDay = (key: string) => ({ weekday: weekday.format(parseKey(key)), day: dayNum.format(parseKey(key)), month: monthShort.format(parseKey(key)) });
export const formatLongDate = (key: string) => longDate.format(parseKey(key));
export const formatFullDate = (key: string) => fullDate.format(parseKey(key));

export const formatPaidAt = (ms: number) =>
  new Intl.DateTimeFormat("en-PH", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(ms);

// Sort sessions chronologically: by date, then hour.
export const sessionOrder = (a: { date: string; hour: number }, b: { date: string; hour: number }) =>
  a.date === b.date ? a.hour - b.hour : a.date < b.date ? -1 : 1;
