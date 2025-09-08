import { Link, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelect } from "./LanguageSelect";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Bus, LogIn, User, LogOut, ShieldAlert, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <motion.header className="sticky top-0 z-40 w-full border-b bg-background/70 backdrop-blur" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: "easeOut" }}>
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link to="/" className="flex items-center gap-2 font-extrabold">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Bus className="h-4 w-4" />
            </div>
            <span className="text-lg tracking-tight">Route-X</span>
          </Link>
        </motion.div>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSelect />
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User menu">
                  <Avatar className="h-8 w-8">
                    {user.photoUrl && <AvatarImage src={user.photoUrl} alt={user.name} />}
                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4"/> {t("profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4"/> {t("sign_out")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")}>
              <LogIn className="mr-2 h-4 w-4"/> {t("login_signup")}
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
