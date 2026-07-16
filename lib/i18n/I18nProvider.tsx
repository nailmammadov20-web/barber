"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";

const I18nContext = createContext<{ locale: Locale; dict: Dictionary } | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return <I18nContext value={{ locale, dict }}>{children}</I18nContext>;
}

export function useDictionary(): Dictionary {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useDictionary must be used within I18nProvider");
  return context.dict;
}

export function useLocale(): Locale {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useLocale must be used within I18nProvider");
  return context.locale;
}
