import { createStore } from "./store";
import type { Booking, Player, Session } from "./types";

export const favoritesStore = createStore<string[]>("bakante:favorites", []);
export const cartStore = createStore<Session[]>("bakante:cart", []);
export const bookingsStore = createStore<Booking[]>("bakante:bookings", []);
export const playerStore = createStore<Player>("bakante:player", { name: "", mobile: "", email: "" });

export const sameSession = (a: Session, b: Session) =>
  a.venueId === b.venueId && a.unitId === b.unitId && a.date === b.date && a.hour === b.hour;

export const toggleFavorite = (id: string) =>
  favoritesStore.update((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

export const toggleSession = (session: Session) =>
  cartStore.update((cart) => (cart.some((s) => sameSession(s, session)) ? cart.filter((s) => !sameSession(s, session)) : [...cart, session]));

export const removeSession = (session: Session) => cartStore.update((cart) => cart.filter((s) => !sameSession(s, session)));
export const clearCart = () => cartStore.set([]);

export const addBooking = (booking: Booking) => bookingsStore.update((list) => [booking, ...list]);
export const cancelBooking = (ref: string) =>
  bookingsStore.update((list) => list.map((b) => (b.ref === ref ? { ...b, status: "cancelled" } : b)));

// Slots held by this visitor's own confirmed bookings count as taken too.
export const isBookedByMe = (bookings: Booking[], session: Session) =>
  bookings.some((b) => b.status === "confirmed" && b.sessions.some((s) => sameSession(s, session)));
