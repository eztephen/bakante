import { SITE } from "@/config/site";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="no-print mt-16 border-t border-line py-8 text-[0.85rem] text-ink-faint">
      <div className="site-wrap flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {YEAR} {SITE.name}. A fictional booking app — a product sample by{" "}
          <a href="https://eztephen.vercel.app" className="underline underline-offset-2 transition-colors hover:text-ink">
            Eztephen Bacuño
          </a>
          .
        </span>
        <span>{SITE.meaning}</span>
      </div>
    </footer>
  );
}
