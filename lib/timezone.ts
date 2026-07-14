// This app only operates in Azerbaijan, where all shop hours, "today", and slot
// availability must be computed in Baku wall-clock time (UTC+4, no DST since 2016) —
// never the server's own local time. Vercel's serverless functions run in UTC, so
// plain `new Date().getHours()` on the server silently used UTC instead of Baku time,
// which made "past" time slots for today look available for hours after they'd
// actually passed. These helpers shift the current instant by the fixed Baku offset
// and read it back with the UTC getters, so the result is correct regardless of what
// timezone the runtime (server or browser) is actually configured for.
const BAKU_OFFSET_MS = 4 * 60 * 60 * 1000;

function bakuShifted(): Date {
  return new Date(Date.now() + BAKU_OFFSET_MS);
}

export function todayInBaku(): string {
  const d = bakuShifted();
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function nowMinutesInBaku(): number {
  const d = bakuShifted();
  return d.getUTCHours() * 60 + d.getUTCMinutes();
}

// A Date object (constructed via the local/legacy constructor, i.e. at local midnight
// in whichever timezone reads it back) representing "today" as Baku sees it. Meant for
// APIs like react-day-picker's `disabled`/`selected` that compare Date objects rather
// than ISO strings.
export function todayInBakuAsDate(): Date {
  const d = bakuShifted();
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
