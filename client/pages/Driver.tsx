import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { GoogleMap } from "@/components/map/GoogleMap";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { MapPin, Route, CheckCircle2, Loader2 } from "lucide-react";

export default function Driver() {
  const { user } = useAuth();
  const { t } = useI18n();
  const uid = user?.id ?? "guest";

  const availKey = useMemo(() => `routex-driver-${uid}-availability`, [uid]);
  const routeKey = useMemo(() => `routex-driver-${uid}-route`, [uid]);
  const updatesKey = useMemo(() => `routex-driver-${uid}-updates`, [uid]);

  const [available, setAvailable] = useState<boolean>(() => {
    const raw = localStorage.getItem(availKey);
    return raw ? raw === "1" : false;
  });
  const [fromCity, setFromCity] = useState<string>(() => {
    const raw = localStorage.getItem(routeKey);
    try { return raw ? JSON.parse(raw).from ?? "" : ""; } catch { return ""; }
  });
  const [toCity, setToCity] = useState<string>(() => {
    const raw = localStorage.getItem(routeKey);
    try { return raw ? JSON.parse(raw).to ?? "" : ""; } catch { return ""; }
  });
  const [updates, setUpdates] = useState<Array<{ id: string; text: string; at: number }>>(() => {
    const raw = localStorage.getItem(updatesKey);
    try { return raw ? JSON.parse(raw) : []; } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(availKey, available ? "1" : "0"); }, [available, availKey]);
  useEffect(() => { localStorage.setItem(routeKey, JSON.stringify({ from: fromCity, to: toCity })); }, [fromCity, toCity, routeKey]);
  useEffect(() => { localStorage.setItem(updatesKey, JSON.stringify(updates)); }, [updates, updatesKey]);

  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  function refreshLocation() {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setLoc({ lat: p.coords.latitude, lng: p.coords.longitude }); setLocLoading(false); },
      () => { setLoc(null); setLocLoading(false); },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }
  useEffect(() => { refreshLocation(); }, []);

  const [newUpdate, setNewUpdate] = useState("");
  function addUpdate() {
    const txt = newUpdate.trim(); if (!txt) return;
    setUpdates((prev) => [{ id: String(Date.now()), text: txt, at: Date.now() }, ...prev].slice(0, 20));
    setNewUpdate("");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t("available_for_duty")}</span>
              <Badge variant={available ? "default" : "secondary"}>{available ? t("on_duty") : t("off_duty")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">{t("toggle_to_set_availability")}</div>
              <Switch checked={available} onCheckedChange={setAvailable} aria-label={t("available_for_duty")} />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><RouteIcon className="h-4 w-4"/> {t("your_route")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label htmlFor="fromCity">{t("from")}</Label>
                <Input id="fromCity" value={fromCity} onChange={(e)=>setFromCity(e.target.value)} placeholder="City A" />
              </div>
              <div>
                <Label htmlFor="toCity">{t("to")}</Label>
                <Input id="toCity" value={toCity} onChange={(e)=>setToCity(e.target.value)} placeholder="City B" />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={()=>{ /* persisted by effect */ }} disabled={!fromCity || !toCity}>
                  <CheckCircle2 className="mr-2 h-4 w-4"/> {t("set_route")}
                </Button>
              </div>
            </div>
            {(fromCity || toCity) && (
              <div className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium">{t("route")}: </span>
                {fromCity || "-"} 
                <span className="mx-1">→</span>
                {toCity || "-"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {t("current_location")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm">
              {loc ? (
                <span>Lat: {loc.lat.toFixed(5)}, Lng: {loc.lng.toFixed(5)}</span>
              ) : (
                <span className="text-muted-foreground">{t("location_unavailable")}</span>
              )}
            </div>
            <Button size="sm" onClick={refreshLocation} disabled={locLoading}>
              {locLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MapPin className="mr-2 h-4 w-4"/>}
              {t("refresh_location")}
            </Button>
          </div>
          <div className="mt-3">
            <GoogleMap className="rounded-lg" cityName={fromCity || undefined} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("status_updates")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <Textarea value={newUpdate} onChange={(e)=>setNewUpdate(e.target.value)} placeholder={t("add_update_placeholder")} />
            <div className="flex justify-end">
              <Button onClick={addUpdate} disabled={!newUpdate.trim()}>{t("add_update")}</Button>
            </div>
            <div className="grid gap-2">
              {updates.length === 0 && (
                <div className="text-sm text-muted-foreground">{t("no_updates_yet")}</div>
              )}
              {updates.map(u => (
                <div key={u.id} className="rounded border p-2 text-sm flex items-center justify-between">
                  <div className="whitespace-pre-wrap">{u.text}</div>
                  <div className="text-xs text-muted-foreground">{new Date(u.at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
