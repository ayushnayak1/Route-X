import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bus, MapPin } from "lucide-react";

export type Vehicle = {
  id: string;
  driver: string;
  route: { from: string; to: string };
  etaMins: number;
  fareINR: number;
  seatsAvailable: number;
  distanceKm: number;
  xPct: number; // absolute overlay position (% from left)
  yPct: number; // absolute overlay position (% from top)
};

function useGeolocation() {
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setPos(null),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);
  return pos;
}

function buildEmbedSrc({ cityQuery, center, zoom = 12 }: { cityQuery?: string; center?: { lat: number; lng: number }; zoom?: number }) {
  const q = cityQuery ? encodeURIComponent(cityQuery) : center ? `${center.lat},${center.lng}` : encodeURIComponent("India");
  const params = new URLSearchParams({ q, hl: "en", z: String(zoom), output: "embed" });
  return `https://www.google.com/maps?${params.toString()}`;
}

export function GoogleMap({ className, compact = false, center, cityName, onSelectVehicle, onVehiclesChange, }: { className?: string; compact?: boolean; center?: { lat: number; lng: number }; cityName?: string; onSelectVehicle?: (v: Vehicle) => void; onVehiclesChange?: (vs: Vehicle[]) => void }) {
  const geo = useGeolocation();
  const effectiveCenter = center ?? geo ?? { lat: 22.9734, lng: 78.6569 };
  const src = useMemo(() => buildEmbedSrc({ cityQuery: cityName, center: cityName ? undefined : effectiveCenter, zoom: compact ? 12 : 13 }), [cityName, effectiveCenter.lat, effectiveCenter.lng, compact]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const NEARBY_BY_CITY: Record<string, string[]> = {
  kanpur: ["Unnao","Bithoor","Kalyanpur","Rania","Akbarpur","Mandhana","Chakeri","Panki","Rooma","Shivrajpur"],
  prayagraj: ["Naini","Jhunsi","Phaphamau","Kaushambi","Karchana","Handia","Shankargarh","Mau Aima","Soraon","Kunda"],
  indore: ["Rau","Mhow","Sanwer","Pithampur","Dewas","Betma","Hatod","Manglia","Manpur","Gopalpura"],
  patna: ["Hajipur","Danapur","Bihta","Phulwari Sharif","Khagaul","Fatuha","Barh","Maner","Masaurhi","Bakhtiyarpur"],
  jaipur: ["Sanganer","Amer","Chomu","Bagru","Dudu","Jobner","Bassi","Kalwar","Vatika","Jamwa Ramgarh"],
  bhopal: ["Mandideep","Sehore","Obedullaganj","Kolar","Bairagarh","Berasia","Huzur","Bilkhiria","Sanchi","Itarsi"],
  nagpur: ["Kamptee","Hingna","Butibori","Umred","Katol","Savner","Khapri","Parsioni","Sindi","Mauda"],
  banda: ["Atarra","Baberu","Naraini","Tindwari","Chitrakoot","Mahoba","Kurara","Kamasin","Pailani","Mataundh"],
  basti: ["Harraiya","Rudhauli","Khalilabad","Munderwa","Gaur","Tinich","Bhanpur","Walterganj","Gosainganj","Sahjanwa"],
  darava: ["Nearby 1","Nearby 2","Nearby 3","Nearby 4","Nearby 5","Nearby 6","Nearby 7","Nearby 8","Nearby 9","Nearby 10"],
};

function normalizeCity(label?: string) {
  return (label ?? "").toLowerCase().trim();
}

function genVehicles(label: string | undefined) {
  const names = ["Rakesh Kumar","Anita Devi","Sanjay Patel","Sunita Yadav","Mohd. Imran","Pooja Singh","Vivek Sharma","Kiran Verma","Rajesh Gupta","Suresh Chavan","Neha Dubey","Asha Devi","Deepak Kumar","Alok Tiwari","Priya Patel","Gopal Das","Arun Rao","Meena Kumari"];
  const norm = normalizeCity(label);
  const fromBase = label ?? "Your City";
  const nearby = NEARBY_BY_CITY[norm] ?? [];
  const fallback = nearby.length ? nearby : ["Central Market","Old Town","Industrial Area","West End","New Colony","East Gate","South Park","North Square","Airport Road","River View"];
  const count = 18;
  const list: Vehicle[] = Array.from({ length: count }).map((_, i) => {
    const driver = names[i % names.length];
    const to = fallback[i % fallback.length];
    const eta = Math.max(2, Math.round(5 + Math.random() * 40));
    const fare = Math.round(10 + Math.random() * 60);
    const seats = Math.round(Math.random() * 40);
    const distanceKm = Math.round(2 + Math.random() * 48); // within 50km
    return {
      id: `bus-${i + 1}`,
      driver,
      route: { from: fromBase, to },
      etaMins: eta,
      fareINR: fare,
      seatsAvailable: seats,
      distanceKm,
      xPct: 8 + Math.random() * 84,
      yPct: 10 + Math.random() * 78,
    };
  });
  return list;
}
  const [active, setActive] = useState<Vehicle | null>(null);

  useEffect(() => {
    const initial = genVehicles(cityName);
    setVehicles(initial);
    if (onVehiclesChange) {
      // ensure parent state update doesn't happen during render
      // schedule asynchronously
      requestAnimationFrame(() => onVehiclesChange(initial));
    }
  }, [cityName, center?.lat, center?.lng]);

  useEffect(() => {
    const t = setInterval(() => {
      setVehicles((prev) => {
        const next = prev.map((v) => ({
          ...v,
          xPct: Math.min(95, Math.max(5, v.xPct + (Math.random() - 0.5) * 1.5)),
          yPct: Math.min(90, Math.max(5, v.yPct + (Math.random() - 0.5) * 1.5)),
          etaMins: Math.max(1, v.etaMins + Math.round((Math.random() - 0.5) * 2)),
          seatsAvailable: Math.max(0, v.seatsAvailable + Math.round((Math.random() - 0.5) * 2)),
        }));
        if (onVehiclesChange) requestAnimationFrame(() => onVehiclesChange(next));
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [onVehiclesChange]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className, compact ? "h-56" : "h-[420px]")}> 
      <iframe
        title={`Google Map - ${cityName ?? "your location"}`}
        src={src}
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        aria-label={`Map of ${cityName ?? "your area"}`}
      />

      {/* Overlay markers */}
      {vehicles.map((v) => (
        <button
          key={v.id}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${v.xPct}%`, top: `${v.yPct}%` }}
          onClick={() => {
            setActive(v);
            onSelectVehicle?.(v);
          }}
          aria-label={`${v.route.from} to ${v.route.to} · ETA ${v.etaMins} min`}
        >
          <span className="absolute -inset-2 rounded-full bg-primary/20 blur-sm opacity-0 group-hover:opacity-100 transition" />
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-primary/20">
            <Bus className="h-3.5 w-3.5" />
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-background/80 px-1.5 py-0.5 text-[10px] text-foreground shadow backdrop-blur">
              {v.etaMins}m · {v.seatsAvailable}
            </span>
          </span>
        </button>
      ))}

      {/* User pin indicator when using geolocation */}
      {!cityName && geo && (
        <div className="absolute left-2 top-2 flex items-center gap-2 rounded bg-background/85 px-2 py-1 text-xs shadow backdrop-blur">
          <MapPin className="h-3.5 w-3.5 text-primary" /> Using your location
        </div>
      )}

      {/* Details panel */}
      {active && (
        <Card className="absolute bottom-3 left-3 right-3 max-w-sm bg-background/95 p-3 shadow-lg backdrop-blur sm:left-3 sm:right-auto">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold">{active.route.from} → {active.route.to}</div>
              <div className="text-xs text-muted-foreground">Driver: {active.driver}</div>
              <div className="mt-1 text-xs">ETA: <Badge variant="secondary">{active.etaMins} min</Badge> · Fare: ₹{active.fareINR} · Seats: {active.seatsAvailable} · Distance: {active.distanceKm} km</div>
            </div>
            <Button size="sm" onClick={() => onSelectVehicle?.(active)}>Book</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
