"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/config/site";
import { useStore } from "@/lib/store";
import { cartStore } from "@/lib/stores";
import Mark from "./Mark";

// On phones the logo stands in for "Courts" and long labels get short forms, so the bar fits a 320px screen.
const NAV = [
  { href: "/", label: "Courts", short: null },
  { href: "/bookings", label: "My bookings", short: "Bookings" },
];

export default function SiteHeader() {
  const cart = useStore(cartStore);
  const pathname = usePathname();

  return (
    <header className="no-print sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-lg">
      <div className="site-wrap flex items-center justify-between gap-2 py-2.5 sm:gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark className="size-8" />
          <span className="font-display text-[1.45rem] font-extrabold tracking-[-0.02em] uppercase">{SITE.name}</span>
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          {NAV.map((link) => {
            const active = link.href === "/" ? pathname === "/" || pathname.startsWith("/courts") : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-md px-2 py-2 text-[0.92rem] font-medium transition-colors sm:px-3 ${link.short === null ? "hidden sm:inline-block" : ""} ${active ? "text-court" : "text-ink-soft hover:text-ink"}`}
              >
                {link.short ? (
                  <>
                    <span className="hidden sm:inline">{link.label}</span>
                    <span className="sm:hidden">{link.short}</span>
                  </>
                ) : (
                  link.label
                )}
              </Link>
            );
          })}
          <Link
            href="/checkout"
            className={`btn btn-sm ml-1 ${cart.length ? "btn-primary" : "btn-ghost"}`}
            aria-label={cart.length ? `Checkout, ${cart.length} session${cart.length === 1 ? "" : "s"} selected` : "Checkout"}
          >
            <span className="hidden sm:inline">Checkout</span>
            <span className="sm:hidden" aria-hidden="true">Cart</span>
            {cart.length > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-on-tangerine/15 px-1.5 font-mono text-[0.72rem] tabular-nums">{cart.length}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
