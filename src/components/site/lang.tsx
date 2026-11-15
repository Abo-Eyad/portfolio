import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { content, type Content, type Lang } from "@/content/portfolio";

const KEY = "aw-portfolio-lang";
const Ctx = createContext<{ lang: Lang; t: Content; toggle: () => void }>({ lang: "en", t: content.en, toggle: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "ar" || saved === "en") setLang(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = content[lang].metaTitle;
  }, [lang]);
  const toggle = () => {
    const next = lang === "en" ? "ar" : "en";
    localStorage.setItem(KEY, next);
    setLang(next);
  };
  return <Ctx.Provider value={{ lang, t: content[lang] as Content, toggle }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
