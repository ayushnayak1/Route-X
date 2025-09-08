import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

export default function Auth() {
  const [tab, setTab] = useState("login");
  const [driverAvailable, setDriverAvailable] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(role: "passenger" | "driver", action: "login" | "signup") {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const name = (data.get("name") as string) || "User";
      const email = (data.get("email") as string) || "user@example.com";
      login({ id: crypto.randomUUID(), name, email, role });
      toast.success(action === "login" ? "Welcome back" : "Account created");
      navigate("/");
    };
  }

  function shareGPS() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.success("GPS shared", { description: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` });
      },
      () => toast.error("Permission denied")
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login / Sign up</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="passenger" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="passenger">Passenger</TabsTrigger>
              <TabsTrigger value="driver">Driver</TabsTrigger>
            </TabsList>

            <TabsContent value="passenger">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit("passenger","login")}
                  >
                    <div>
                      <Label htmlFor="pname-login">Full name (optional)</Label>
                      <Input id="pname-login" name="name" placeholder="Your name" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" required type="email" placeholder="you@example.com" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" required type="password" />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-2 block">Gender</Label>
                      <RadioGroup name="gender" className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="pg-m" value="male" />
                          <Label htmlFor="pg-m">Male</Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="pg-f" value="female" />
                          <Label htmlFor="pg-f">Female</Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="pg-o" value="other" />
                          <Label htmlFor="pg-o">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="md:col-span-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full">Login</Button>
                      </motion.div>
                    </div>
                  </form>
                  </motion.div>
                </TabsContent>
                <TabsContent value="signup">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit("passenger","signup")}>
                    <div>
                      <Label htmlFor="name">Full name</Label>
                      <Input id="name" name="name" required placeholder="Your name" />
                    </div>
                    <div>
                      <Label htmlFor="email2">Email</Label>
                      <Input id="email2" name="email" required type="email" placeholder="you@example.com" />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-2 block">Gender</Label>
                      <RadioGroup name="gender" className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="psg-m" value="male" />
                          <Label htmlFor="psg-m">Male</Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="psg-f" value="female" />
                          <Label htmlFor="psg-f">Female</Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="psg-o" value="other" />
                          <Label htmlFor="psg-o">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label htmlFor="password2">Password</Label>
                      <Input id="password2" name="password" required type="password" />
                    </div>
                    <div>
                      <Label htmlFor="confirm">Confirm password</Label>
                      <Input id="confirm" name="confirm" required type="password" />
                    </div>
                    <div className="md:col-span-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full">Create account</Button>
                      </motion.div>
                    </div>
                  </form>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="driver">
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit("driver","login")}
                  >
                    <div>
                      <Label htmlFor="dname-login">Full name (optional)</Label>
                      <Input id="dname-login" name="name" placeholder="Driver name" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="demail">Email</Label>
                      <Input id="demail" name="email" required type="email" placeholder="driver@routex.in" />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="dpassword">Password</Label>
                      <Input id="dpassword" name="password" required type="password" />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-2 block">Gender</Label>
                      <RadioGroup name="gender" className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="dg-m" value="male" />
                          <Label htmlFor="dg-m">Male</Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="dg-f" value="female" />
                          <Label htmlFor="dg-f">Female</Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="dg-o" value="other" />
                          <Label htmlFor="dg-o">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2">
                      <Switch id="avail" checked={driverAvailable} onCheckedChange={setDriverAvailable} />
                      <Label htmlFor="avail">Available for duty</Label>
                      <Button type="button" variant="outline" onClick={shareGPS} className="ml-auto">Share GPS</Button>
                    </div>
                    <div className="md:col-span-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full">Login as Driver</Button>
                      </motion.div>
                    </div>
                  </form>
                  </motion.div>
                </TabsContent>
                <TabsContent value="signup">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit("driver","signup")}
                  >
                    <div>
                      <Label htmlFor="dname">Full name</Label>
                      <Input id="dname" name="name" required placeholder="Driver name" />
                    </div>
                    <div>
                      <Label htmlFor="demail2">Email</Label>
                      <Input id="demail2" name="email" required type="email" placeholder="driver@routex.in" />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="mb-2 block">Gender</Label>
                      <RadioGroup name="gender" className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="dsg-m" value="male" />
                          <Label htmlFor="dsg-m">Male</Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="dsg-f" value="female" />
                          <Label htmlFor="dsg-f">Female</Label>
                        </div>
                        <div className="flex items-center gap-2 rounded-md border p-2">
                          <RadioGroupItem id="dsg-o" value="other" />
                          <Label htmlFor="dsg-o">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label htmlFor="busno">Bus number</Label>
                      <Input id="busno" name="busno" required placeholder="UP65 AB 1234" />
                    </div>
                    <div>
                      <Label htmlFor="route">Route (From → To)</Label>
                      <Input id="route" name="route" required placeholder="Kanpur → Unnao" />
                    </div>
                    <div className="flex items-center gap-3 md:col-span-2">
                      <Switch id="avail2" checked={driverAvailable} onCheckedChange={setDriverAvailable} />
                      <Label htmlFor="avail2">Available for duty</Label>
                      <Button type="button" variant="outline" onClick={shareGPS} className="ml-auto">Start GPS</Button>
                    </div>
                    <div className="md:col-span-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button type="submit" className="w-full">Create driver account</Button>
                      </motion.div>
                    </div>
                  </form>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
}
