import type { Sport } from "@/lib/types";

// Top-down court markings, to scale, drawn in paint-white on the court surface.
// Used in place of photography: every sport's court is instantly recognisable.
const DRAWINGS: Record<Sport, { viewBox: string; body: React.ReactNode }> = {
  badminton: {
    viewBox: "-5 -5 144 71",
    body: (
      <>
        <rect x="0" y="0" width="134" height="61" />
        <path d="M0 4.6H134M0 56.4H134M7.6 0V61M126.4 0V61M47.2 0V61M86.8 0V61M0 30.5H47.2M86.8 30.5H134" />
        <path d="M67 -3V64" strokeWidth="2.2" strokeDasharray="2 1.6" />
      </>
    ),
  },
  pickleball: {
    viewBox: "-3 -3 50 26",
    body: (
      <>
        <rect x="0" y="0" width="44" height="20" strokeWidth="0.7" />
        <path d="M15 0V20M29 0V20M0 10H15M29 10H44" strokeWidth="0.7" />
        <path d="M22 -1.5V21.5" strokeWidth="1" strokeDasharray="0.9 0.7" />
      </>
    ),
  },
  basketball: {
    viewBox: "-5 -5 160 150",
    body: (
      <>
        <rect x="0" y="0" width="150" height="140" />
        <rect x="50.5" y="82" width="49" height="58" />
        <circle cx="75" cy="82" r="18" />
        <path d="M66 128H84" strokeWidth="2.6" />
        <circle cx="75" cy="124.25" r="2.4" />
        <path d="M9 140V110.1A67.5 67.5 0 0 1 141 110.1V140" />
        <path d="M57 0A18 18 0 0 0 93 0" />
      </>
    ),
  },
  volleyball: {
    viewBox: "-5 -5 190 100",
    body: (
      <>
        <rect x="0" y="0" width="180" height="90" />
        <path d="M60 0V90M120 0V90" />
        <path d="M90 -3V93" strokeWidth="2.6" strokeDasharray="2.4 1.8" />
      </>
    ),
  },
};

interface CourtDiagramProps {
  sport: Sport;
  className?: string;
  title?: string;
}

export default function CourtDiagram({ sport, className = "", title }: CourtDiagramProps) {
  const { viewBox, body } = DRAWINGS[sport];
  return (
    <svg
      viewBox={viewBox}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="var(--court-paint)"
      strokeWidth="1.4"
      strokeLinecap="round"
      preserveAspectRatio="xMidYMid meet"
    >
      {body}
    </svg>
  );
}
