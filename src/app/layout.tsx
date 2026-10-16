import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Rubik, Azeret_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

// The optical-size axis keeps the condensed forms crisp from slot labels up to hero size.
const shoulders = Big_Shoulders({ variable: "--font-shoulders", subsets: ["latin"], axes: ["opsz"] });
const rubik = Rubik({ variable: "--font-rubik", subsets: ["latin"] });
const azeret = Azeret_Mono({ variable: "--font-azeret", subsets: ["latin"] });

// On Vercel the production URL is provided automatically; set SITE_URL for any other host.
const siteUrl =
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  openGraph: { type: "website", siteName: SITE.name, title: `${SITE.name} — ${SITE.tagline}`, description: SITE.description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2f6b4f" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1613" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${shoulders.variable} ${rubik.variable} ${azeret.variable} flex min-h-dvh flex-col antialiased`}>
        <a href="#main" className="sr-only z-[100] rounded bg-tangerine px-4 py-2 font-semibold text-on-tangerine focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
          Skip to content
        </a>
        <p className="no-print bg-court-deep px-4 py-2 text-center text-[0.8rem] text-[#CFE6DA]">
          Live demo — bookings and payments are simulated and saved only in this browser. No real money moves.
        </p>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
