import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SPORT_LABEL, VENUES, sportsAt, venueBySlug } from "@/data/courts";
import { formatHour } from "@/lib/dates";
import { formatPeso } from "@/lib/pricing";
import type { Sport } from "@/lib/types";
import CourtDiagram from "@/components/CourtDiagram";
import SportIcon from "@/components/SportIcon";
import FavoriteButton from "@/components/FavoriteButton";
import BookingPanel from "@/components/BookingPanel";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return VENUES.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const venue = venueBySlug((await params).slug);
  return venue ? { title: venue.name, description: venue.blurb } : {};
}

export default async function CourtPage({ params }: Params) {
  const venue = venueBySlug((await params).slug);
  if (!venue) notFound();
  const sports = sportsAt(venue);

  return (
    <main id="main" className="site-wrap py-6 sm:py-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-[0.85rem] text-ink-soft">
        <Link href="/" className="hover:text-ink">
          Courts
        </Link>
        <span className="mx-2 text-ink-faint">/</span>
        <span>{venue.name}</span>
      </nav>

      <header className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:gap-10">
        <div className="relative overflow-hidden rounded-xl bg-court-surface">
          <CourtDiagram sport={sports[0]} title={`${SPORT_LABEL[sports[0]]} court markings`} className="aspect-[16/10] w-full p-5" />
          <FavoriteButton venueId={venue.id} name={venue.name} className="absolute top-3 right-3" />
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <span className="label-caps">
              {venue.area}, {venue.city} · {venue.indoor ? "Indoor" : "Outdoor"}
            </span>
            <h1 className="mt-1 font-display text-[clamp(2.2rem,6vw,3.6rem)] leading-[0.95] font-extrabold tracking-[-0.01em] text-balance">{venue.name}</h1>
            <p className="mt-2 text-[0.95rem] text-ink-soft">
              <span className="text-tangerine">★</span> {venue.rating.toFixed(1)} · {venue.reviews} reviews · {venue.address}
            </p>
          </div>
          <p className="max-w-[60ch] text-ink-soft">{venue.blurb}</p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[0.9rem] sm:grid-cols-3">
            <div>
              <dt className="label-caps">Hours</dt>
              <dd className="font-medium">
                {formatHour(venue.open)} – {formatHour(venue.close)}
              </dd>
            </div>
            {(Object.entries(venue.rates) as [Sport, number][]).map(([sport, rate]) => (
              <div key={sport}>
                <dt className="label-caps flex items-center gap-1">
                  <SportIcon sport={sport} className="size-3" /> {SPORT_LABEL[sport]}
                </dt>
                <dd className="font-medium">
                  {formatPeso(rate)}/hr <span className="font-normal text-ink-faint">off-peak</span>
                </dd>
              </div>
            ))}
          </dl>
          <ul className="flex flex-wrap gap-1.5" aria-label="Amenities">
            {venue.amenities.map((a) => (
              <li key={a} className="rounded-full border border-line px-2.5 py-1 text-[0.8rem] text-ink-soft">
                {a}
              </li>
            ))}
          </ul>
        </div>
      </header>

      <section className="mt-10" aria-labelledby="book-heading">
        <div className="court-rule mb-5 pt-3">
          <h2 id="book-heading" className="font-display text-[2rem] leading-none font-extrabold uppercase">
            Book a court
          </h2>
        </div>
        <BookingPanel venue={venue} />
      </section>
    </main>
  );
}
