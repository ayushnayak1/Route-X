export type StoredBooking = {
  id: string;
  vehicle: {
    id: string;
    driver: string;
    route: { from: string; to: string };
    etaMins: number;
    fareINR: number;
    seatsAvailable: number;
    distanceKm?: number;
  };
  seats: number;
  totalINR: number;
  createdAt: number;
};

function key(userId: string) {
  return `routex-bookings:${userId}`;
}

export function getBookings(userId: string): StoredBooking[] {
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return [];
    return JSON.parse(raw) as StoredBooking[];
  } catch {
    return [];
  }
}

export function addBooking(userId: string, booking: StoredBooking) {
  const list = getBookings(userId);
  list.unshift(booking);
  localStorage.setItem(key(userId), JSON.stringify(list));
}
