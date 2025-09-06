import { useI18n, Lang } from "@/context/I18nContext";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function LanguageSelect() {
  const { lang, setLang } = useI18n();
  const label = lang === "hi" ? "हिंदी" : "English";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Language">
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLang("en" as Lang)}>English</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLang("hi" as Lang)}>हिंदी</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
