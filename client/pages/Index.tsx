import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GoogleMap, Vehicle } from "@/components/map/GoogleMap";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { MapPin, Bus, ArrowRight } from "lucide-react";

export default function Index() {
  const [mapOpen, setMapOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-gradient-to-b from-background to-muted/30">
      <section className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
        <div className="flex flex-col justify-center gap-6">
          <Badge variant="secondary" className="w-fit">Live in Tier 2/3 India</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Track & book public buses with Route-X
          </h1>
          <p className="text-muted-foreground text-lg">
            Real-time bus locations, ETA, driver details, fare estimate and seat availability for daily commuters in towns and rural India.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setMapOpen(true)}>
              Open Live Map <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline">Download App</Button>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Bus className="h-4 w-4 text-primary"/> Focused on public buses</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/> Driver GPS powered</div>
          </div>
        </div>
        <Card className="p-2 shadow-lg">
          <CardContent className="relative p-0">
            <GoogleMap compact className="rounded-lg" onSelectVehicle={(v) => { setSelected(v); setBookingOpen(true); }} />
            <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-border"/>
            <div className="absolute bottom-3 right-3">
              <Button size="sm" onClick={() => setMapOpen(true)}>Enlarge map</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[{title:"Live tracking",desc:"Tap any bus to see ETA, driver name, route and seats."},{title:"One-tap booking",desc:"Reserve your seats and pay on-board or online."},{title:"Driver mode",desc:"Drivers share live GPS and availability for their shifts."}].map((f)=> (
            <Card key={f.title} className="p-6">
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-5xl p-0">
          <div className="p-4 pb-0">
            <h3 className="text-lg font-semibold">Live Map</h3>
            <p className="text-sm text-muted-foreground">Tap a vehicle to view details and book.</p>
          </div>
          <div className="p-4 pt-2">
            <GoogleMap className="rounded-lg" onSelectVehicle={(v) => { setSelected(v); setBookingOpen(true); }} />
          </div>
        </DialogContent>
      </Dialog>

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} vehicle={selected} />
    </div>
  );
}
