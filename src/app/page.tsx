import { SITE } from "@/config/site";
import { SPORTS, VENUES } from "@/data/courts";
import CourtDiagram from "@/components/CourtDiagram";
import CourtExplorer from "@/components/CourtExplorer";
import SportIcon from "@/components/SportIcon";

export default function Home() {
  return (
    <main id="main">
      <section className="relative overflow-hidden bg-court-surface text-court-paint">
        <CourtDiagram sport="badminton" className="pointer-events-none absolute -top-10 -right-24 h-[140%] w-auto opacity-30 lg:-right-10" />
        <div className="site-wrap relative flex flex-col gap-6 py-14 sm:py-20 lg:py-24">
          <span className="label-caps rise text-court-paint/80" style={{ "--d": "0ms" } as React.CSSProperties}>
            {SITE.region}
          </span>
          <h1 className="rise max-w-[12ch] font-display text-[clamp(3rem,10vw,7rem)] leading-[0.9] font-extrabold tracking-[-0.02em] uppercase text-balance" style={{ "--d": "80ms" } as React.CSSProperties}>
            Find a free court. <span className="text-tangerine">Book it</span> in a minute.
          </h1>
          <p className="rise max-w-[48ch] text-[1.08rem] text-court-paint/90" style={{ "--d": "160ms" } as React.CSSProperties}>
            {SITE.meaning} Pick your dates and times across {VENUES.length} venues, pay online, and show the pass at the desk.
          </p>
          <ul className="rise flex flex-wrap gap-2" style={{ "--d": "240ms" } as React.CSSProperties} aria-label="Sports available">
            {SPORTS.map((s) => (
              <li key={s.id} className="inline-flex items-center gap-1.5 rounded-full border border-court-paint/30 bg-court-deep/30 px-3 py-1.5 text-[0.88rem] backdrop-blur">
                <SportIcon sport={s.id} className="size-4" />
                {s.label}
                <span className="text-court-paint/60">· {s.players}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <CourtExplorer venues={VENUES} />
    </main>
  );
}
