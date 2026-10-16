import Link from "next/link";
import type { Sport, Venue } from "@/lib/types";
import { SPORT_LABEL, sportsAt } from "@/data/courts";
import { formatPeso, fromRate } from "@/lib/pricing";
import { formatDistance } from "@/lib/geo";
import CourtDiagram from "./CourtDiagram";
import SportIcon from "./SportIcon";
import FavoriteButton from "./FavoriteButton";

interface CourtCardProps {
  venue: Venue;
  distanceKm: number;
  highlight?: Sport; // which court to draw when a sport filter is active
  index: number;
}

export default function CourtCard({ venue, distanceKm, highlight, index }: CourtCardProps) {
  const sports = sportsAt(venue);
  const shown = highlight && sports.includes(highlight) ? highlight : sports[0];
  return (
    <article className="rise relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-[var(--shadow)]" style={{ "--d": `${Math.min(index, 8) * 60}ms` } as React.CSSProperties}>
      <Link href={`/courts/${venue.slug}`} className="group flex min-w-0 flex-col">
        <div className="relative aspect-[16/9] overflow-hidden bg-court-surface">
          <CourtDiagram sport={shown} className="absolute inset-0 size-full p-4 transition-transform duration-500 group-hover:scale-[1.04]" />
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-paper/90 px-2.5 py-1 text-[0.78rem] font-medium backdrop-blur">
            <SportIcon sport={shown} className="size-3.5" />
            {SPORT_LABEL[shown]} · {venue.indoor ? "Indoor" : "Outdoor"}
          </span>
        </div>
        <div className="flex flex-col gap-2 px-4 pt-3.5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-[1.45rem] leading-none font-bold tracking-[-0.01em] group-hover:text-court">{venue.name}</h3>
            <span className="shrink-0 font-mono text-[0.78rem] text-ink-faint tabular-nums">{formatDistance(distanceKm)}</span>
          </div>
          <p className="text-[0.88rem] text-ink-soft">
            {venue.area}, {venue.city}
            <span className="mx-1.5 text-ink-faint">·</span>
            <span className="text-tangerine">★</span> {venue.rating.toFixed(1)} <span className="text-ink-faint">({venue.reviews})</span>
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <ul className="flex flex-wrap gap-1.5" aria-label="Sports">
              {sports.map((s) => (
                <li key={s} className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[0.74rem] text-ink-soft">
                  <SportIcon sport={s} className="size-3" />
                  {SPORT_LABEL[s]}
                </li>
              ))}
            </ul>
            <span className="font-display text-[1.25rem] leading-none font-bold tabular-nums">
              <span className="font-sans text-[0.72rem] font-normal text-ink-faint">from </span>
              {formatPeso(fromRate(venue))}
              <span className="font-sans text-[0.72rem] font-normal text-ink-faint">/hr</span>
            </span>
          </div>
        </div>
      </Link>
      <FavoriteButton venueId={venue.id} name={venue.name} className="absolute top-3 right-3" />
    </article>
  );
}
