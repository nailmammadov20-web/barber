const DEFAULT_COUNTRY_CODE = "994"; // Azerbaijan

/** Normalizes a locally-entered phone number to the digits-only international format wa.me expects. */
export function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    return digits.slice(2);
  }
  if (digits.startsWith(DEFAULT_COUNTRY_CODE)) {
    return digits;
  }
  if (digits.startsWith("0")) {
    return `${DEFAULT_COUNTRY_CODE}${digits.slice(1)}`;
  }
  return `${DEFAULT_COUNTRY_CODE}${digits}`;
}

export function buildConfirmationMessage(params: {
  customerName: string;
  barberName: string;
  date: string;
  timeSlot: string;
}): string {
  const { customerName, barberName, date, timeSlot } = params;
  return `Salam ${customerName}, ${barberName} sizin ${date} tarixində saat ${timeSlot} üçün randevunuzu təsdiqlədi. Görüşərik!`;
}

export function buildWhatsappLink(phone: string, message: string): string {
  return `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
}
