import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLang } from "./lang";
import { links } from "@/content/portfolio";
import { Button } from "@/components/ui/button";

const ids = ["about", "skills", "tools", "experience", "projects", "education", "contact"] as const;

export function Header() {
  const { t, toggle, lang } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 md:bg-background/70 md:backdrop-blur-xl">
      <div className="mx-auto grid h-22 max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 sm:flex sm:justify-between" dir="ltr">
        <a href="#top" aria-label={t.brand} className="shrink-0 rounded-full">
          <img src={`${import.meta.env.BASE_URL}logo-badge.png`} alt={t.brand} width={64} height={64} className="size-16 rounded-full object-contain" />
        </a>
        <nav className="hidden items-center gap-6 lg:flex" dir={lang === "ar" ? "rtl" : "ltr"}>
          {ids.map((id) => (
            <a key={id} href={`#${id}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{t.nav[id]}</a>
          ))}
          <a href={links.cv} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">{t.nav.cv}</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={toggle} lang={lang === "en" ? "ar" : "en"} className="border-line text-link shadow-none">
            {t.langSwitch}
          </Button>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-5 py-4 lg:hidden">
          {ids.map((id) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="block py-3 text-base text-foreground">{t.nav[id]}</a>
          ))}
          <a href={links.cv} target="_blank" rel="noreferrer" className="block py-3 text-base text-foreground">{t.nav.cv}</a>
        </nav>
      )}
    </header>
  );
}
