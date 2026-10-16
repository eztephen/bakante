# Bakante

Book a court to play. Badminton, pickleball, basketball and volleyball venues across Cavite and the south of Metro Manila — pick your dates and times, pay, and show the pass at the desk.

*Bakante* (ba-KAN-te) is Filipino for "vacant" — what the front desk says when there's a slot.

**Live:** https://bakante.vercel.app

This is a **product sample**: everything works end to end in the browser, but bookings and payments are simulated and saved only on the visitor's device.

Next.js 16, React 19, Tailwind CSS v4, TypeScript. No other dependencies.

## Getting started

Requires Node.js >= 20.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Trying the demo

1. **Find a court.** Filter by sport, search by town, or tap **Use my location** to sort by distance (falls back to Carmona, Cavite if you decline). Tap the heart to favourite a venue.
2. **Pick times.** Open a venue, choose the court, then tap hours on any of the next 14 days — as many as you like, across days and even across venues. Striped slots are already taken; evenings and weekends are peak rate.
3. **Check out.** Review sessions, enter your details, then pay with **GCash**, **Maya** or **card**:
   - GCash: any PH mobile; the one-time code is `123456`.
   - Card: `4242 4242 4242 4242` succeeds, `4000 0000 0000 0002` declines, `4000 0000 0000 9995` has insufficient funds. Any future expiry.
4. **Your pass.** The confirmation shows a court pass with a reference. It's on **My bookings**, where you can also cancel — which puts the slots back on sale.

## What's real and what's simulated

| Real | Simulated |
|------|-----------|
| Availability rules, peak pricing, past-slot handling | Which slots other people have booked (deterministic per court and date) |
| Card validation (Luhn, expiry), PH mobile validation | The payment gateway — see `src/lib/payment.ts` |
| Distance sorting from the device's location | Email confirmations |
| Favourites, cart and bookings surviving a refresh | A shared database — data lives in this browser only |

## Making it real

The payment UI talks to one interface, `PaymentProvider` in `src/lib/payment.ts`. Replace `mockProvider` with a [PayMongo](https://www.paymongo.com/) integration — it covers cards, GCash and Maya in the Philippines — or Stripe, and the checkout doesn't change. Everything in `src/lib/stores.ts` (favourites, cart, bookings) is the surface a real backend would take over.

## Changing the venues

`src/data/courts.ts` holds every venue: location, hours, rates per sport, bookable courts and amenities. Add one and it appears everywhere, with a court diagram drawn for its sport.

## Deploy

Push to a Git host and import the repo on [Vercel](https://vercel.com/new). On Vercel the link-preview image resolves automatically; elsewhere set `SITE_URL`.
