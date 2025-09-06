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

export function BookingDialog({ open, onOpenChange, vehicle }: { open: boolean; onOpenChange: (v: boolean) => void; vehicle: Vehicle | null }) {
  const [seats, setSeats] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  function submit() {
    if (!vehicle) return;
    if (!name || !phone) {
      toast.error("Please fill your details");
      return;
    }
    toast.success(`Booked ${seats} seat(s) on ${vehicle.route.from} → ${vehicle.route.to}`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book your seat</DialogTitle>
          <DialogDescription>
            {vehicle ? `${vehicle.route.from} → ${vehicle.route.to} · ETA ${vehicle.etaMins} min · ₹${vehicle.fareINR}` : "Select a bus on the map"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="seats">Seats</Label>
              <Input id="seats" type="number" min={1} max={10} value={seats} onChange={(e) => setSeats(parseInt(e.target.value || "1"))} />
            </div>
            <div>
              <Label>Payable</Label>
              <div className="h-10 rounded-md border px-3 py-2 text-sm flex items-center">₹{vehicle ? seats * vehicle.fareINR : 0}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Confirm booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
