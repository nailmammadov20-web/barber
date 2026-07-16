import type { Locale } from "@/lib/i18n/config";
import type { DictionaryShape } from "@/lib/i18n/dictionaries/types";
import az from "@/lib/i18n/dictionaries/az";
import lt from "@/lib/i18n/dictionaries/lt";

export type Dictionary = DictionaryShape;

const dictionaries: Record<Locale, Dictionary> = { az, lt };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
