import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "en" | "hi";
const STORAGE_KEY = "routex-lang";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    hero_badge: "Live in Tier 2/3 India",
    hero_title: "Track & book public buses with Route-X",
    hero_desc: "Real-time bus locations, ETA, driver details, fare estimate and seat availability for daily commuters in towns and rural India.",
    open_map: "Open Live Map",
    my_bookings: "My Bookings",
    focused_buses: "Focused on public buses",
    driver_gps: "Driver GPS powered",
    search_placeholder: "Search city (e.g., Banda)",
    enlarge_map: "Enlarge map",
    live_status_in: "Live status in",
    buses: "buses",
    no_buses: "No buses visible yet. Try searching a city.",
    using_location: "Using your location",
    book: "Book",
    login_signup: "Login / Sign up",
    profile: "Profile",
    sign_out: "Sign out",
    dialog_title: "Live Map",
    dialog_desc: "Tap a vehicle to view details and book.",
    booking_title: "Book your seat",
    full_name: "Full name",
    phone: "Phone",
    seats: "Seats",
    payable: "Payable",
    cancel: "Cancel",
    confirm_booking: "Confirm booking",
  },
  hi: {
    hero_badge: "भारत के टियर 2/3 शहरों में लाइव",
    hero_title: "Route-X के साथ पब्लिक बसें ट्रैक करें और बुक करें",
    hero_desc: "रियल-टाइम बस लोकेशन, ETA, ड्राइवर विवरण, किराया अनुमान और सीट उपलब्धता — ग्रामीण और छोटे शहरों के दैनिक यात्रियों के लिए।",
    open_map: "लाइव मैप खोलें",
    my_bookings: "मेरी बुकिंग्स",
    focused_buses: "सार्वजनिक बसों पर फोकस",
    driver_gps: "ड्राइवर GPS आधारित",
    search_placeholder: "शहर खोजें (जैसे, बांदा)",
    enlarge_map: "मैप बड़ा करें",
    live_status_in: "लाइव स्थिति",
    buses: "बसें",
    no_buses: "कोई बस नहीं दिख रही। कृपया शहर खोजें।",
    using_location: "आपके लोकेशन का उपयोग",
    book: "बुक करें",
    login_signup: "लॉगिन / साइन अप",
    profile: "प्रोफाइल",
    sign_out: "साइन आउट",
    dialog_title: "लाइव मैप",
    dialog_desc: "वाहन पर टैप करें और बुक करें।",
    booking_title: "अपनी सीट बुक करें",
    full_name: "पूरा नाम",
    phone: "फोन",
    seats: "सीटें",
    payable: "देय राशि",
    cancel: "रद्द करें",
    confirm_booking: "बुकिंग कन्फर्म करें",
  },
};

type I18nCtx = { lang: Lang; setLang: (l: Lang) => void; t: (k: string) => string };
const I18nContext = createContext<I18nCtx | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Lang | null) ?? "en";
    setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
    window.dispatchEvent(new CustomEvent("routex-lang-change", { detail: { lang: l } }));
  };
  const t = (k: string) => dict[lang][k] ?? dict.en[k] ?? k;
  const value = useMemo(() => ({ lang, setLang, t }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
