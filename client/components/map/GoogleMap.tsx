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

export function GoogleMap({ className, compact = false, center, cityName, onSelectVehicle }: { className?: string; compact?: boolean; center?: { lat: number; lng: number }; cityName?: string; onSelectVehicle?: (v: Vehicle) => void }) {
  const geo = useGeolocation();
  const effectiveCenter = center ?? geo ?? { lat: 22.9734, lng: 78.6569 };
  const src = useMemo(() => buildEmbedSrc({ cityQuery: cityName, center: cityName ? undefined : effectiveCenter, zoom: compact ? 12 : 13 }), [cityName, effectiveCenter.lat, effectiveCenter.lng, compact]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([
    { id: "bus-001", driver: "Rakesh Kumar", route: { from: "Prayagraj", to: "Mirzapur" }, etaMins: 12, fareINR: 35, seatsAvailable: 8, xPct: 22, yPct: 38 },
    { id: "bus-002", driver: "Anita Devi", route: { from: "Kanpur", to: "Unnao" }, etaMins: 18, fareINR: 28, seatsAvailable: 3, xPct: 62, yPct: 54 },
    { id: "bus-003", driver: "Sanjay Patel", route: { from: "Indore", to: "Dewas" }, etaMins: 7, fareINR: 22, seatsAvailable: 15, xPct: 44, yPct: 20 },
  ]);
  const [active, setActive] = useState<Vehicle | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => ({
          ...v,
          xPct: Math.min(95, Math.max(5, v.xPct + (Math.random() - 0.5) * 1.5)),
          yPct: Math.min(90, Math.max(5, v.yPct + (Math.random() - 0.5) * 1.5)),
          etaMins: Math.max(1, v.etaMins + Math.round((Math.random() - 0.5) * 2)),
          seatsAvailable: Math.max(0, v.seatsAvailable + Math.round((Math.random() - 0.5) * 2)),
        })),
      );
    }, 5000);
    return () => clearInterval(t);
  }, []);

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
              <div className="mt-1 text-xs">ETA: <Badge variant="secondary">{active.etaMins} min</Badge> · Fare: ₹{active.fareINR} · Seats: {active.seatsAvailable}</div>
            </div>
            <Button size="sm" onClick={() => onSelectVehicle?.(active)}>Book</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
