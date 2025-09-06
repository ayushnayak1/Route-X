/* global google */
import { useEffect, useRef, useState } from "react";
import { lightMapStyle, darkMapStyle } from "./mapStyles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    __routexGoogleInit?: () => void;
    google?: typeof google;
  }
}

export type Vehicle = {
  id: string;
  position: { lat: number; lng: number };
  driver: string;
  route: { from: string; to: string };
  etaMins: number;
  fareINR: number;
  seatsAvailable: number;
};

export function loadGoogleMaps(apiKey?: string) {
  if (window.google) return Promise.resolve();
  if (!apiKey) return Promise.reject(new Error("Missing Google Maps API key"));
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });
}

function busIcon(color: string): any {
  // Simple bus shape using path
  // @ts-ignore google may not be typed here
  return {
    path: "M20 8H4C2.9 8 2 8.9 2 10v6c0 1.1.9 2 2 2v2h2v-2h8v2h2v-2c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zm-1 7H5v-4h14v4zM6.5 6h11C19 6 20 5 20 3.5S19 1 17.5 1h-11C5 1 4 2 4 3.5S5 6 6.5 6z",
    fillColor: color,
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 0.7,
    anchor: new (window as any).google.maps.Point(12, 12),
  } as any;
}

export function GoogleMap({
  className,
  onSelectVehicle,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
  onSelectVehicle?: (v: Vehicle) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>();
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([ // sample Tier 2/3 cities
    { id: "bus-001", position: { lat: 25.447, lng: 81.843 }, driver: "Rakesh Kumar", route: { from: "Prayagraj", to: "Mirzapur" }, etaMins: 12, fareINR: 35, seatsAvailable: 8 },
    { id: "bus-002", position: { lat: 26.4499, lng: 80.3319 }, driver: "Anita Devi", route: { from: "Kanpur", to: "Unnao" }, etaMins: 18, fareINR: 28, seatsAvailable: 3 },
    { id: "bus-003", position: { lat: 22.7196, lng: 75.8577 }, driver: "Sanjay Patel", route: { from: "Indore", to: "Dewas" }, etaMins: 7, fareINR: 22, seatsAvailable: 15 },
  ]);

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    loadGoogleMaps(key)
      .then(() => initMap())
      .catch(() => setError("Google Maps API key missing. Set VITE_GOOGLE_MAPS_API_KEY to enable the live map."));
  }, []);

  useEffect(() => {
    const handler = () => applyThemeToMap();
    window.addEventListener("routex-theme-change", handler);
    return () => window.removeEventListener("routex-theme-change", handler);
  }, []);

  function initMap() {
    if (!ref.current || !window.google) return;
    mapRef.current = new google.maps.Map(ref.current, {
      center: { lat: 25.5, lng: 81.8 },
      zoom: compact ? 5 : 6,
      disableDefaultUI: compact,
      styles: isDark() ? darkMapStyle : lightMapStyle,
    });

    // Add markers
    vehicles.forEach((v) => createMarker(v));

    // Simulate live updates (jitter)
    const interval = setInterval(() => {
      setVehicles((prev) => {
        const updated = prev.map((v) => ({
          ...v,
          position: {
            lat: v.position.lat + (Math.random() - 0.5) * 0.01,
            lng: v.position.lng + (Math.random() - 0.5) * 0.01,
          },
          etaMins: Math.max(1, v.etaMins + Math.round((Math.random() - 0.5) * 3)),
          seatsAvailable: Math.max(0, v.seatsAvailable + Math.round((Math.random() - 0.5) * 2)),
        }));
        if (mapRef.current) {
          updated.forEach((nv) => updateMarker(nv));
        }
        return updated;
      });
    }, 5000);

    return () => clearInterval(interval);
  }

  const markers = useRef(new Map<string, any>());
  const infoWindows = useRef(new Map<string, any>());

  function createMarker(v: Vehicle) {
    if (!mapRef.current || !window.google) return;
    const marker = new (window as any).google.maps.Marker({
      position: v.position,
      map: mapRef.current,
      icon: busIcon(getComputedStyle(document.documentElement).getPropertyValue("--primary") ? `hsl(${getComputedStyle(document.documentElement).getPropertyValue("--primary")})` : "#2563eb"),
    });
    markers.current.set(v.id, marker);

    const iw = new google.maps.InfoWindow({
      content: renderInfoWindow(v),
    });
    infoWindows.current.set(v.id, iw);

    marker.addListener("click", () => {
      infoWindows.current.forEach((w) => w.close());
      iw.setContent(renderInfoWindow(v));
      iw.open({ map: mapRef.current!, anchor: marker });
      onSelectVehicle?.(v);
    });
  }

  function renderInfoWindow(v: Vehicle) {
    const div = document.createElement("div");
    div.className = "text-sm";
    div.innerHTML = `
      <div style="font-weight:700;margin-bottom:4px">${v.route.from} → ${v.route.to}</div>
      <div>Driver: <strong>${v.driver}</strong></div>
      <div>ETA: <strong>${v.etaMins} min</strong></div>
      <div>Fare: <strong>₹${v.fareINR}</strong> · Seats: <strong>${v.seatsAvailable}</strong></div>
      <div style="margin-top:8px"><button id="book-${v.id}" style="background:#4f46e5;color:white;padding:6px 10px;border-radius:6px;border:none;cursor:pointer">Book</button></div>
    `;
    setTimeout(() => {
      const btn = div.querySelector<HTMLButtonElement>(`#book-${v.id}`);
      btn?.addEventListener("click", () => onSelectVehicle?.(v));
    }, 0);
    return div;
  }

  function updateMarker(v: Vehicle) {
    const m = markers.current.get(v.id);
    if (!m) return;
    m.setPosition(v.position);
  }

  function applyThemeToMap() {
    if (!mapRef.current) return;
    mapRef.current.setOptions({ styles: isDark() ? darkMapStyle : lightMapStyle });
    // also recolor icons
    const color = getComputedStyle(document.documentElement).getPropertyValue("--primary");
    markers.current.forEach((m) => m.setIcon(busIcon(`hsl(${color})`)));
  }

  function isDark() {
    return document.documentElement.classList.contains("dark");
  }

  return (
    <div className={cn("relative", className)}>
      <div ref={ref} className={cn("h-full w-full rounded-lg", compact ? "h-56" : "h-[420px]")} />
      {error && (
        <Card className="absolute inset-0 flex items-center justify-center bg-background/80 p-6 text-center">
          <div>
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">This will also theme-match with Dark mode.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
