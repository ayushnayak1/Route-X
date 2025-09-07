import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { getBookings, StoredBooking } from "@/lib/bookings";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LanguageSelect } from "@/components/core/LanguageSelect";
import { useI18n } from "@/context/I18nContext";
import { motion } from "framer-motion";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState<StoredBooking[]>([]);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [photo, setPhoto] = useState<string | undefined>(user?.photoUrl);

  useEffect(() => {
    if (user) {
      setBookings(getBookings(user.id));
      setName(user.name);
      setEmail(user.email);
      setPhoto(user.photoUrl);
    } else {
      setBookings(getBookings("guest"));
    }
  }, [user]);

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPhoto(url);
    };
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    if (!user) {
      toast.error("Please login to save profile");
      return;
    }
    updateUser({ name, email, photoUrl: photo });
    toast.success("Profile updated");
  }

  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile")}</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="grid gap-6 md:grid-cols-3">
              <motion.div className="flex flex-col items-center gap-3" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 250, damping: 20 }}>
                <motion.div whileHover={{ scale: 1.03 }}>
                  <Avatar className="h-24 w-24">
                    {photo && <AvatarImage src={photo} alt={name} />}
                    <AvatarFallback>{name.slice(0,2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </motion.div>
                <Input type="file" accept="image/*" onChange={onPhotoChange} />
              </motion.div>
              <div className="md:col-span-2 grid gap-4">
                <div>
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input id="name" value={name} onChange={(e)=>setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>{t("role")}</Label>
                  <div className="mt-1">
                    <Badge>{user?.role ? t(user.role) : "-"}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label>{t("language")}</Label>
                  <LanguageSelect />
                </div>
                <div>
                  <Button onClick={saveProfile}>{t("save_changes")}</Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("guest_msg")}</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("your_bookings")}</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length ? (
              <div className="grid gap-3">
                {bookings.map((b) => (
                  <div key={b.id} className="grid grid-cols-2 md:grid-cols-6 items-center gap-2 rounded border p-3">
                    <div className="col-span-2 md:col-span-2">
                      <div className="font-medium">{b.vehicle.route.from} → {b.vehicle.route.to}</div>
                      <div className="text-xs text-muted-foreground">Driver: {b.vehicle.driver}</div>
                    </div>
                    <div className="hidden md:block text-sm">{t("seats_label")}: {b.seats}</div>
                    <div className="hidden md:block text-sm">{t("total")}: ₹{b.totalINR}</div>
                    <div className="hidden md:block text-sm">{t("when")}: {new Date(b.createdAt).toLocaleString()}</div>
                    <div className="text-right md:text-left text-sm">{t("eta")}: {b.vehicle.etaMins} min</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
