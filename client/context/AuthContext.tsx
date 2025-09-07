import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "passenger" | "driver";
export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
};

const STORAGE_KEY = "routex-user";

type AuthContextType = {
  user: User | null;
  login: (u: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      login: (u: User) => {
        setUser(u);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
