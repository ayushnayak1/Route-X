import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Vehicle } from "@/components/map/GoogleMap";
import { toast } from "sonner";
import { addBooking } from "@/lib/bookings";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { PaymentSheet } from "@/components/payments/PaymentSheet";

export function BookingDialog({ open, onOpenChange, vehicle }: { open: boolean; onOpenChange: (v: boolean) => void; vehicle: Vehicle | null }) {
  const [seats, setSeats] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { user } = useAuth();

  const [payOpen, setPayOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any | null>(null);

  function submit() {
    if (!vehicle) return;
    if (!name || !phone) {
      toast.error("Please fill your details");
      return;
    }
    const total = seats * vehicle.fareINR;
    const booking = {
      id: crypto.randomUUID(),
      vehicle: {
        id: vehicle.id,
        driver: vehicle.driver,
        route: vehicle.route,
        etaMins: vehicle.etaMins,
        fareINR: vehicle.fareINR,
        seatsAvailable: vehicle.seatsAvailable,
        distanceKm: (vehicle as any).distanceKm,
      },
      seats,
      totalINR: total,
      createdAt: Date.now(),
    };
    setPendingBooking(booking);
    setPayOpen(true);
  }

  function onPaymentResult(ok: boolean, paymentId?: string) {
    if (!ok || !pendingBooking) {
      toast.error("Payment failed");
      return;
    }
    const uid = user?.id ?? "guest";
    addBooking(uid, pendingBooking);
    toast.success(`Booked ${pendingBooking.seats} seat(s) · ₹${pendingBooking.totalINR}`);
    if (!user) {
      toast.info("Tip: Login to see your bookings in Profile");
    }
    setPendingBooking(null);
    onOpenChange(false);
  }

  const { t } = useI18n();

  const [midpointLabel, setMidpointLabel] = useState<string | null>(null);
  const [midLoading, setMidLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!vehicle) { setMidpointLabel(null); return; }
      const from = vehicle.route.from?.trim();
      const to = vehicle.route.to?.trim();
      if (!from || !to) { setMidpointLabel(null); return; }
      setMidLoading(true);
      try {
        const geocode = async (q: string) => {
          const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&addressdetails=1&countrycodes=in`);
          const j = await r.json();
          if (!Array.isArray(j) || j.length === 0) return null;
          return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
        };
        const a = await geocode(from);
        const b = await geocode(to);
        if (!a || !b) { if (!cancelled) setMidpointLabel(null); return; }
        const mid = { lat: (a.lat + b.lat) / 2, lng: (a.lng + b.lng) / 2 };
        const rev = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${mid.lat}&lon=${mid.lng}`);
        const rj = await rev.json();
        const name = rj?.name || rj?.address?.suburb || rj?.address?.village || rj?.address?.town || rj?.address?.city || rj?.display_name;
        if (!cancelled) setMidpointLabel(name ? String(name) : null);
      } catch {
        if (!cancelled) setMidpointLabel(null);
      } finally {
        if (!cancelled) setMidLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [vehicle?.route.from, vehicle?.route.to]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("booking_title")}</DialogTitle>
          <DialogDescription>
            {vehicle ? `${vehicle.route.from} → ${vehicle.route.to} · ETA ${vehicle.etaMins} min · ₹${vehicle.fareINR}` : t("dialog_desc")}
          </DialogDescription>
        </DialogHeader>

        {vehicle && (
          <div className="mb-2 rounded-md border bg-muted/40 p-2 text-xs">
            <div className="font-medium">Current approx. location</div>
            <div className="text-muted-foreground">{midLoading ? "Locating..." : (midpointLabel ? `Near ${midpointLabel}` : "—")}</div>
          </div>
        )}

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">{t("full_name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("full_name")} />
            </div>
            <div>
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seats">{t("seats")}</Label>
              <Input id="seats" type="number" min={1} max={10} value={seats} onChange={(e) => setSeats(parseInt(e.target.value || "1"))} />
            </div>
            <div>
              <Label>{t("payable")}</Label>
              <div className="h-10 rounded-md border px-3 py-2 text-sm flex items-center">₹{vehicle ? seats * vehicle.fareINR : 0}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button onClick={submit}>{t("confirm_booking")}</Button>
        </DialogFooter>
      </DialogContent>

      <PaymentSheet open={payOpen} onOpenChange={setPayOpen} amount={pendingBooking ? pendingBooking.totalINR : (vehicle ? seats * vehicle.fareINR : 0)} onResult={onPaymentResult} />
    </Dialog>
  );
}
