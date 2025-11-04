import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Bus, MapPin } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

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

function MidpointLabel({ from, to }: { from: string; to: string }) {
  const [label, setLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    async function run() {
      const a = from?.trim(); const b = to?.trim();
      if (!a || !b) { setLabel(null); return; }
      setLoading(true);
      try {
        const geocode = async (q: string) => {
          const r = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&addressdetails=1&countrycodes=in`);
          const j = await r.json();
          if (!Array.isArray(j) || j.length === 0) return null;
          return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
        };
        const p1 = await geocode(a);
        const p2 = await geocode(b);
        if (!p1 || !p2) { if (!cancelled) setLabel(null); return; }
        const mid = { lat: (p1.lat + p2.lat) / 2, lng: (p1.lng + p2.lng) / 2 };
        const rev = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${mid.lat}&lon=${mid.lng}`);
        const rj = await rev.json();
        const name = rj?.name || rj?.address?.suburb || rj?.address?.village || rj?.address?.town || rj?.address?.city || rj?.display_name;
        if (!cancelled) setLabel(name ? String(name) : null);
      } catch {
        if (!cancelled) setLabel(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [from, to]);
  return (
    <div className="mt-1 text-xs">
      <span className="text-muted-foreground">{loading ? "Locating..." : label ? `Near ${label}` : ""}</span>
    </div>
  );
}

export function GoogleMap({ className, compact = false, center, cityName, onSelectVehicle, onVehiclesChange, }: { className?: string; compact?: boolean; center?: { lat: number; lng: number }; cityName?: string; onSelectVehicle?: (v: Vehicle) => void; onVehiclesChange?: (vs: Vehicle[]) => void }) {
  const { t } = useI18n();
  const geo = useGeolocation();
  const effectiveCenter = center ?? geo ?? { lat: 22.9734, lng: 78.6569 };
  const src = useMemo(() => buildEmbedSrc({ cityQuery: cityName, center: cityName ? undefined : effectiveCenter, zoom: compact ? 12 : 13 }), [cityName, effectiveCenter.lat, effectiveCenter.lng, compact]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dynamicNearby, setDynamicNearby] = useState<string[]>([]);

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

async function fetchNearbyPlaces(label?: string): Promise<string[]> {
  const q = (label ?? "").trim();
  if (!q) return [];
  try {
    // 1) Geocode city to lat/lon via Nominatim
    const cityRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&addressdetails=1&countrycodes=in`);
    const cityJson = await cityRes.json();
    if (!Array.isArray(cityJson) || cityJson.length === 0) return [];
    const { lat, lon } = cityJson[0];
    const latNum = parseFloat(lat); const lonNum = parseFloat(lon);
    // 2) Overpass API: towns/villages within 50km
    const overpassQuery = `[
      out:json][timeout:10];
      (
        node["place"~"city|town|village|hamlet"](around:50000,${latNum},${lonNum});
      );
      out tags 20;`;
    const overRes = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain; charset=UTF-8" },
      body: overpassQuery,
    });
    const overJson = await overRes.json();
    const names: string[] = Array.isArray(overJson?.elements)
      ? overJson.elements
          .map((el: any) => el?.tags?.name)
          .filter((n: any) => typeof n === "string")
      : [];
    // unique, exclude the base name itself
    const uniq = Array.from(new Set(names)).filter((n) => n.toLowerCase() !== q.toLowerCase()).slice(0, 12);
    return uniq;
  } catch {
    return [];
  }
}

function fallbackNearby(base: string) {
  const dirs = ["North","South","East","West","North-East","North-West","South-East","South-West"];
  const labels: string[] = [];
  for (let i = 0; i < 12; i++) {
    const dir = dirs[i % dirs.length];
    const km = Math.max(2, Math.round(Math.random() * 48));
    labels.push(`${base} ${dir} · ${km}km`);
  }
  return labels;
}

function genVehicles(label: string | undefined, places: string[]) {
  const names = ["Rakesh Kumar","Anita Devi","Sanjay Patel","Sunita Yadav","Mohd. Imran","Pooja Singh","Vivek Sharma","Kiran Verma","Rajesh Gupta","Suresh Chavan","Neha Dubey","Asha Devi","Deepak Kumar","Alok Tiwari","Priya Patel","Gopal Das","Arun Rao","Meena Kumari"];
  const norm = normalizeCity(label);
  const fromBase = label ?? "Your City";
  const nearbyStatic = NEARBY_BY_CITY[norm] ?? [];
  const nearby = places.length ? places : nearbyStatic;
  const pool = nearby.length ? nearby : fallbackNearby(fromBase);
  const count = 18;
  const hasCityName = !!label && label.trim().length > 0;
  const list: Vehicle[] = Array.from({ length: count }).map((_, i) => {
    const driver = names[i % names.length];
    const to = pool[i % pool.length];
    const eta = hasCityName ? Math.max(2, Math.round(5 + Math.random() * 40)) : 0;
    const fare = hasCityName ? Math.round(10 + Math.random() * 60) : 0;
    const seats = hasCityName ? Math.round(Math.random() * 40) : 0;
    const distanceKm = hasCityName ? Math.round(2 + Math.random() * 48) : 0;
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
    let cancelled = false;
    (async () => {
      const places = await fetchNearbyPlaces(cityName);
      if (!cancelled) setDynamicNearby(places);
    })();
    return () => { cancelled = true; };
  }, [cityName]);

  useEffect(() => {
    const initial = genVehicles(cityName, dynamicNearby);
    setVehicles(initial);
    if (onVehiclesChange) {
      requestAnimationFrame(() => onVehiclesChange(initial));
    }
  }, [cityName, dynamicNearby]);

  useEffect(() => {
    const t = setInterval(() => {
      setVehicles((prev) => {
        if (prev.length === 0) return prev;
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
        <motion.button
          key={v.id}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${v.xPct}%`, top: `${v.yPct}%` }}
          whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.98 }}
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
        </motion.button>
      ))}

      {/* User pin indicator when using geolocation */}
      {!cityName && geo && (
        <div className="absolute left-2 top-2 flex items-center gap-2 rounded bg-background/85 px-2 py-1 text-xs shadow backdrop-blur">
          <MapPin className="h-3.5 w-3.5 text-primary" /> {t("using_location")}
        </div>
      )}

      {/* Details panel */}
      {active && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="absolute bottom-3 left-3 right-3 sm:left-3 sm:right-auto">
          <Card className="max-w-sm bg-background/95 p-3 shadow-lg backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold">{active.route.from} → {active.route.to}</div>
                <div className="text-xs text-muted-foreground">Driver: {active.driver}</div>
                <div className="mt-1 text-xs">ETA: <Badge variant="secondary">{active.etaMins} min</Badge> · Fare: ₹{active.fareINR} · Seats: {active.seatsAvailable} · Distance: {active.distanceKm} km</div>
                <MidpointLabel from={active.route.from} to={active.route.to} />
              </div>
              <Button size="sm" onClick={() => onSelectVehicle?.(active)}>{t("book")}</Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
