import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GoogleMap, Vehicle } from "@/components/map/GoogleMap";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { MapPin, Bus, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Index() {
  const [mapOpen, setMapOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [liveVehicles, setLiveVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [queryCity, setQueryCity] = useState<string | undefined>(undefined);
  const displayCityName = queryCity;

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
          <CardContent className="relative p-3">
            <form
              className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center"
              onSubmit={(e)=>{ e.preventDefault(); const q = searchTerm.trim(); setQueryCity(q || undefined); }}
            >
              <Input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Search city (e.g., Banda)" />
              <Button type="submit" variant="secondary">Search</Button>
            </form>
            <GoogleMap
              compact
              className="rounded-lg"
              cityName={displayCityName}
              onSelectVehicle={(v) => { setSelected(v); setBookingOpen(true); }}
              onVehiclesChange={setLiveVehicles}
            />
            <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-border"/>
            <div className="absolute bottom-3 right-3">
              <Button size="sm" onClick={() => setMapOpen(true)}>Enlarge map</Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live status in {displayCityName ?? "your area"}</h3>
            <span className="text-sm text-muted-foreground">{liveVehicles.length} buses</span>
          </div>
          <div className="grid gap-2 max-h-80 overflow-auto">
            {liveVehicles.map((v) => (
              <div key={v.id} className="grid grid-cols-2 md:grid-cols-6 items-center gap-2 rounded border p-2">
                <div className="col-span-2 md:col-span-2">
                  <div className="font-medium">{v.route.from} → {v.route.to}</div>
                  <div className="text-xs text-muted-foreground">Driver: {v.driver}</div>
                </div>
                <div className="hidden md:block text-sm">ETA: {v.etaMins} min</div>
                <div className="hidden md:block text-sm">Seats: {v.seatsAvailable}</div>
                <div className="hidden md:block text-sm">Fare: ₹{v.fareINR}</div>
                <div className="hidden md:block text-sm">Dist: {v.distanceKm} km</div>
                <div className="text-right md:text-left">
                  <Button size="sm" onClick={() => { setSelected(v); setBookingOpen(true); }}>Book</Button>
                </div>
              </div>
            ))}
            {liveVehicles.length === 0 && (
              <div className="text-sm text-muted-foreground">No buses visible yet. Try selecting a city.</div>
            )}
          </div>
        </Card>
      </section>

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-5xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Live Map</DialogTitle>
            <DialogDescription>Tap a vehicle to view details and book.</DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-2">
            <GoogleMap className="rounded-lg" cityName={displayCityName} center={selectedCenter} onSelectVehicle={(v) => { setSelected(v); setBookingOpen(true); }} onVehiclesChange={setLiveVehicles} />
          </div>
        </DialogContent>
      </Dialog>

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} vehicle={selected} />
    </div>
  );
}
