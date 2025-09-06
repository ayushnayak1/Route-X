import { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { setTheme, getInitialTheme, initTheme, Theme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const [current, setCurrent] = useState<Theme>("system");

  useEffect(() => {
    initTheme();
    setCurrent(getInitialTheme());
  }, []);

  const choose = (t: Theme) => {
    setCurrent(t);
    setTheme(t);
    // emit event so map can react to theme changes
    window.dispatchEvent(new CustomEvent("routex-theme-change", { detail: { theme: t } }));
  };

  const icon = current === "dark" ? <Moon className="h-4 w-4" /> : current === "light" ? <Sun className="h-4 w-4" /> : <Laptop className="h-4 w-4" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Toggle theme">
          {icon}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => choose("light")}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => choose("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => choose("system")}>
          <Laptop className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
