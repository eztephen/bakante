export type Sport = "badminton" | "pickleball" | "basketball" | "volleyball";

// One bookable court inside a venue. A venue can have several, for different sports.
export type Unit = { id: string; name: string; sport: Sport; surface: string };

export type Venue = {
  id: string;
  slug: string;
  name: string;
  area: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  indoor: boolean;
  open: number; // first bookable hour, 24h
  close: number; // closing hour, 24h — last slot starts an hour before
  rating: number;
  reviews: number;
  rates: Partial<Record<Sport, number>>; // pesos per hour, off-peak
  units: Unit[];
  amenities: string[];
  blurb: string;
};

// One hour on one court. `date` is a local YYYY-MM-DD key.
export type Session = { venueId: string; unitId: string; date: string; hour: number };

export type PaymentMethod = "card" | "gcash" | "maya";

export type Player = { name: string; mobile: string; email: string };

export type Booking = {
  ref: string;
  sessions: Session[];
  total: number;
  method: PaymentMethod;
  methodDetail: string; // "Visa ending 4242", "GCash 0917 ··· 658"
  transactionId: string;
  paidAt: number;
  player: Player;
  status: "confirmed" | "cancelled";
};
