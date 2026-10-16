import type { Sport } from "@/lib/types";

const GLYPHS: Record<Sport, React.ReactNode> = {
  badminton: (
    <>
      <circle cx="7" cy="17" r="3" />
      <path d="M9.2 14.8 13 3M9.2 14.8 17 4M9.2 14.8 20 8M13 3l7 5" />
    </>
  ),
  pickleball: (
    <>
      <rect x="3.5" y="2.5" width="11" height="13.5" rx="5.5" />
      <path d="M9 16v5.5" />
      <circle cx="18.5" cy="18" r="3" />
    </>
  ),
  basketball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18M6.2 5.8c3 3 3 9.4 0 12.4M17.8 5.8c-3 3-3 9.4 0 12.4" />
    </>
  ),
  volleyball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c-1.5 5 1 9.5 9 9.5M3.2 10.5c5 2 9.5-1 10-7.5M11.5 21c-1-5 3-9 9.3-8" />
    </>
  ),
};

export default function SportIcon({ sport, className = "size-4" }: { sport: Sport; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {GLYPHS[sport]}
    </svg>
  );
}
