import type { Metadata } from "next";
import BookingsList from "@/components/BookingsList";

export const metadata: Metadata = { title: "My bookings" };

export default function BookingsPage() {
  return (
    <main id="main" className="site-wrap py-8">
      <h1 className="mb-6 font-display text-[clamp(2.2rem,6vw,3.4rem)] leading-none font-extrabold uppercase">My bookings</h1>
      <BookingsList />
    </main>
  );
}
