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
import { useState } from "react";
import { Vehicle } from "@/components/map/GoogleMap";
import { toast } from "sonner";
import { addBooking } from "@/lib/bookings";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";

export function BookingDialog({ open, onOpenChange, vehicle }: { open: boolean; onOpenChange: (v: boolean) => void; vehicle: Vehicle | null }) {
  const [seats, setSeats] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { user } = useAuth();

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
    const uid = user?.id ?? "guest";
    addBooking(uid, booking);
    toast.success(`Booked ${seats} seat(s) · ₹${total}`);
    if (!user) {
      toast.info("Tip: Login to see your bookings in Profile");
    }
    onOpenChange(false);
  }

  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("booking_title")}</DialogTitle>
          <DialogDescription>
            {vehicle ? `${vehicle.route.from} → ${vehicle.route.to} · ETA ${vehicle.etaMins} min · ₹${vehicle.fareINR}` : t("dialog_desc")}
          </DialogDescription>
        </DialogHeader>

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
    </Dialog>
  );
}
