import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { GoogleMap, Vehicle } from "@/components/map/GoogleMap";
import { BookingDialog } from "@/components/booking/BookingDialog";
import { MapPin, Bus, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useI18n } from "@/context/I18nContext";

export default function Index() {
  const [mapOpen, setMapOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [liveVehicles, setLiveVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [queryCity, setQueryCity] = useState<string | undefined>(undefined);
  const displayCityName = queryCity;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  useEffect(() => {
    if (user?.role === "driver") {
      navigate("/driver", { replace: true });
    }
  }, [user?.role, navigate]);

  return (
    <div className="min-h-[calc(100dvh-56px)] bg-gradient-to-b from-background to-muted/30">
      <section className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
        <motion.div className="flex flex-col justify-center gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
          <Badge variant="secondary" className="w-fit">{t("hero_badge")}</Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("hero_title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("hero_desc")}
          </p>
          <div className="flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={() => setMapOpen(true)}>
                {t("open_map")} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" onClick={() => {
                if (user) navigate("/profile");
                else { toast.info(t("login_signup")); navigate("/auth"); }
              }}>{t("my_bookings")}</Button>
            </motion.div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Bus className="h-4 w-4 text-primary"/> {t("focused_buses")}</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary"/> {t("driver_gps")}</div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}>
        <Card className="p-2 shadow-lg">
          <CardContent className="relative p-3">
            <form
              className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center"
              onSubmit={(e)=>{ e.preventDefault(); const q = searchTerm.trim(); setQueryCity(q || undefined); }}
            >
              <Input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder={t("search_placeholder")} />
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
              <Button size="sm" onClick={() => setMapOpen(true)}>{t("enlarge_map")}</Button>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold">{t("live_status_in")} {displayCityName ?? "your area"}</h3>
            <span className="text-sm text-muted-foreground">{liveVehicles.length} {t("buses")}</span>
          </div>
          <div className="grid gap-2 max-h-80 overflow-auto">
            {liveVehicles.map((v, i) => (
              <motion.div key={v.id} className="grid grid-cols-2 md:grid-cols-6 items-center gap-2 rounded border p-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.03 }}>
                <div className="col-span-2 md:col-span-2">
                  <div className="font-medium">{v.route.from} → {v.route.to}</div>
                  <div className="text-xs text-muted-foreground">Driver: {v.driver}</div>
                </div>
                <div className="hidden md:block text-sm">ETA: {v.etaMins} min</div>
                <div className="hidden md:block text-sm">Seats: {v.seatsAvailable}</div>
                <div className="hidden md:block text-sm">Fare: ₹{v.fareINR}</div>
                <div className="hidden md:block text-sm">Dist: {v.distanceKm} km</div>
                <div className="text-right md:text-left">
                  <Button size="sm" onClick={() => { setSelected(v); setBookingOpen(true); }}>{t("book")}</Button>
                </div>
              </motion.div>
            ))}
            {liveVehicles.length === 0 && (
              <div className="text-sm text-muted-foreground">{t("no_buses")}</div>
            )}
          </div>
        </Card>
      </section>

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-5xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{t("dialog_title")}</DialogTitle>
            <DialogDescription>{t("dialog_desc")}</DialogDescription>
          </DialogHeader>
          <div className="p-4 pt-2">
            <GoogleMap className="rounded-lg" cityName={displayCityName} onSelectVehicle={(v) => { setSelected(v); setBookingOpen(true); }} onVehiclesChange={setLiveVehicles} />
          </div>
        </DialogContent>
      </Dialog>

      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} vehicle={selected} />
    </div>
  );
}
