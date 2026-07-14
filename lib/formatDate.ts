const AZ_MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avqust",
  "sentyabr",
  "oktyabr",
  "noyabr",
  "dekabr",
];
const AZ_WEEKDAYS_SHORT = ["B.", "B.e.", "Ç.a.", "Ç.", "C.a.", "C.", "Ş."];

export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Formats manually (not via Intl/toLocaleDateString) so server- and client-rendered
// output always match exactly — Node's default ICU build lacks full az-AZ data,
// which caused a hydration mismatch when relying on the browser's locale support.
export function formatDateDisplay(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getDate()} ${AZ_MONTHS[date.getMonth()]}, ${AZ_WEEKDAYS_SHORT[date.getDay()]}`;
}
