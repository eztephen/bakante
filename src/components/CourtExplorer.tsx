"use client";

import { useState } from "react";
import { SITE } from "@/config/site";
import { SPORTS, sportsAt } from "@/data/courts";
import type { Sport, Venue } from "@/lib/types";
import { distanceKm, type Point } from "@/lib/geo";
import { fromRate } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { favoritesStore } from "@/lib/stores";
import CourtCard from "./CourtCard";
import SportIcon from "./SportIcon";

type Location = Point & { label: string; source: "default" | "device" };
type Sort = "nearest" | "rating" | "price";

const SORTS: { id: Sort; label: string }[] = [
  { id: "nearest", label: "Nearest" },
  { id: "rating", label: "Top rated" },
  { id: "price", label: "Cheapest" },
];

export default function CourtExplorer({ venues }: { venues: Venue[] }) {
  const [sport, setSport] = useState<Sport | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("nearest");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [location, setLocation] = useState<Location>({ ...SITE.defaultLocation, source: "default" });
  const [locating, setLocating] = useState(false);
  const [geoNote, setGeoNote] = useState<string | null>(null);
  const favorites = useStore(favoritesStore);

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) return setGeoNote("Your browser can't share a location — sorting from Carmona instead.");
    setLocating(true);
    setGeoNote(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude, label: "your location", source: "device" });
        setSort("nearest");
        setLocating(false);
      },
      () => {
        setGeoNote("Location was blocked — sorting from Carmona, Cavite instead.");
        setLocating(false);
      },
      { timeout: 8000, maximumAge: 60_000 },
    );
  };

  const q = query.trim().toLowerCase();
  const results = venues
    .map((v) => ({ venue: v, km: distanceKm(location, v) }))
    .filter(({ venue }) => sport === "all" || sportsAt(venue).includes(sport))
    .filter(({ venue }) => !favoritesOnly || favorites.includes(venue.id))
    .filter(({ venue }) => !q || [venue.name, venue.area, venue.city, venue.address].some((s) => s.toLowerCase().includes(q)))
    .sort((a, b) =>
      sort === "nearest" ? a.km - b.km : sort === "rating" ? b.venue.rating - a.venue.rating : fromRate(a.venue) - fromRate(b.venue),
    );

  return (
    <section id="courts" className="site-wrap scroll-mt-24 py-10" aria-label="Find a court">
      <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sport">
          <button type="button" className="chip" aria-pressed={sport === "all"} onClick={() => setSport("all")}>
            All sports
          </button>
          {SPORTS.map((s) => (
            <button key={s.id} type="button" className="chip" aria-pressed={sport === s.id} onClick={() => setSport(s.id)}>
              <SportIcon sport={s.id} className="size-3.5" />
              {s.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <label className="flex min-w-0 flex-col gap-1">
            <span className="label-caps">Search</span>
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Venue, town or street" className="field" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="label-caps">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-col gap-1">
            <span className="label-caps">Distance from</span>
            <button type="button" onClick={useMyLocation} disabled={locating} className="btn btn-ghost btn-sm h-[2.9rem] normal-case tracking-normal">
              <svg className="size-4 text-court" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
                <circle cx="12" cy="12" r="8" />
              </svg>
              {locating ? "Locating…" : location.source === "device" ? "Using your location" : "Use my location"}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[0.85rem] text-ink-soft">
          <span aria-live="polite">
            {results.length} court{results.length === 1 ? "" : "s"} · distances from <b className="font-medium text-ink">{location.label}</b>
            {geoNote && <span className="ml-2 text-tangerine">{geoNote}</span>}
          </span>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input type="checkbox" checked={favoritesOnly} onChange={(e) => setFavoritesOnly(e.target.checked)} className="size-4 accent-[var(--tangerine)]" />
            Favourites only {favorites.length > 0 && <span className="text-ink-faint">({favorites.length})</span>}
          </label>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-line p-10 text-center text-ink-soft">
          {favoritesOnly ? "No favourites yet — tap the heart on a court to keep it here." : "Nothing matches that. Try another sport or clear the search."}
        </p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ venue, km }, i) => (
            <CourtCard key={venue.id} venue={venue} distanceKm={km} highlight={sport === "all" ? undefined : sport} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
