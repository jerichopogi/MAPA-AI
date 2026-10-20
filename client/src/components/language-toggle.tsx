import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** EN / TL pill switch. */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t("Language")} className={cn("inline-flex rounded-full bg-muted p-0.5 text-xs", className)}>
      {(["en", "tl"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          title={code === "en" ? "English" : "Taglish"}
          className={cn(
            "rounded-full px-2.5 py-1 font-medium transition-colors",
            lang === code ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {code === "en" ? "EN" : "TL"}
        </button>
      ))}
    </div>
  );
}
