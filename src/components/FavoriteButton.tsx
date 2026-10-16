"use client";

import { useStore } from "@/lib/store";
import { favoritesStore, toggleFavorite } from "@/lib/stores";

export default function FavoriteButton({ venueId, name, className = "" }: { venueId: string; name: string; className?: string }) {
  const favorites = useStore(favoritesStore);
  const on = favorites.includes(venueId);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(venueId)}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
      className={`grid size-10 place-items-center rounded-full border border-line bg-surface/90 backdrop-blur transition-transform hover:scale-105 active:scale-95 ${className}`}
    >
      <svg className={`size-5 transition-colors ${on ? "fill-tangerine stroke-tangerine" : "fill-none stroke-ink-soft"}`} viewBox="0 0 24 24" strokeWidth="1.8" aria-hidden="true">
        <path d="M12 20.5s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
