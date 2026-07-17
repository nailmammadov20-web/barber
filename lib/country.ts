export type BarberCountry = "AZ" | "LT" | "OTHER";

const COUNTRY_PREFIXES: { prefix: string; country: BarberCountry }[] = [
  { prefix: "+994", country: "AZ" },
  { prefix: "+370", country: "LT" },
];

export function detectCountryFromPhone(phone: string): BarberCountry {
  const normalized = phone.trim();
  const match = COUNTRY_PREFIXES.find(({ prefix }) => normalized.startsWith(prefix));
  return match?.country ?? "OTHER";
}

export const COUNTRY_LABEL: Record<BarberCountry, string> = {
  AZ: "Azərbaycan",
  LT: "Litva",
  OTHER: "Digər",
};

export const COUNTRY_CURRENCY: Record<BarberCountry, string> = {
  AZ: "AZN",
  LT: "€",
  OTHER: "AZN",
};
