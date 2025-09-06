import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type Vehicle = {
  id: string;
  position: { lat: number; lng: number };
  driver: string;
  route: { from: string; to: string };
  etaMins: number;
  fareINR: number;
  seatsAvailable: number;
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

function staticMapUrl(center: { lat: number; lng: number }, compact: boolean) {
  const size = compact ? { w: 800, h: 300 } : { w: 1200, h: 500 };
  const zoom = compact ? 13 : 14;
  // OpenStreetMap static map service (no key). Marker at center.
  const base = "https://staticmap.openstreetmap.de/staticmap.php";
  const params = new URLSearchParams({
    center: `${center.lat},${center.lng}`,
    zoom: String(zoom),
    size: `${size.w}x${size.h}`,
    markers: `${center.lat},${center.lng},lightblue1`,
    maptype: "mapnik",
  });
  return `${base}?${params.toString()}`;
}

export function GoogleMap({ className, compact = false }: { className?: string; compact?: boolean; onSelectVehicle?: (v: Vehicle) => void }) {
  const fallback = { lat: 22.9734, lng: 78.6569 }; // India centroid
  const geo = useGeolocation();
  const center = geo ?? fallback;
  const url = useMemo(() => staticMapUrl(center, compact), [center.lat, center.lng, compact]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className, compact ? "h-56" : "h-[420px]")}> 
      <img src={url} alt="Map preview around your location" className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/0 via-background/0 to-background/0 dark:bg-black/20" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center">
          <span className="relative block h-3 w-3 -translate-y-1 rounded-full bg-primary shadow ring-4 ring-primary/30" />
          <span className="mt-2 rounded bg-background/70 px-2 py-0.5 text-xs text-foreground backdrop-blur">You</span>
        </div>
      </div>
    </div>
  );
}
