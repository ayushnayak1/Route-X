import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { getBookings, StoredBooking } from "@/lib/bookings";
import { useEffect, useState } from "react";

export default function Profile() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<StoredBooking[]>([]);

  useEffect(() => {
    if (user) setBookings(getBookings(user.id));
    else setBookings(getBookings("guest"));
  }, [user]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-2">
              <div><span className="text-muted-foreground">Name:</span> {user.name}</div>
              <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
              <div><span className="text-muted-foreground">Role:</span> {user.role}</div>
            </div>
          ) : (
            <p className="text-muted-foreground">You’re browsing as guest. Login to sync your bookings across devices.</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Your bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length ? (
              <div className="grid gap-3">
                {bookings.map((b) => (
                  <div key={b.id} className="grid grid-cols-2 md:grid-cols-6 items-center gap-2 rounded border p-3">
                    <div className="col-span-2 md:col-span-2">
                      <div className="font-medium">{b.vehicle.route.from} → {b.vehicle.route.to}</div>
                      <div className="text-xs text-muted-foreground">Driver: {b.vehicle.driver}</div>
                    </div>
                    <div className="hidden md:block text-sm">Seats: {b.seats}</div>
                    <div className="hidden md:block text-sm">Total: ₹{b.totalINR}</div>
                    <div className="hidden md:block text-sm">When: {new Date(b.createdAt).toLocaleString()}</div>
                    <div className="text-right md:text-left text-sm">ETA: {b.vehicle.etaMins} min</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
