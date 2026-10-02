// Toutes les dates sont manipulées en "YYYY-MM-DD" et stockées à minuit UTC.

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

export function toDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

export function fromDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function isValidISO(iso: string): boolean {
  if (!ISO_RE.test(iso)) return false;
  const d = toDate(iso);
  return !Number.isNaN(d.getTime()) && fromDate(d) === iso;
}

/** Date du jour à Paris. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return fromDate(d);
}

/** 0 = dimanche, 1 = lundi … 6 = samedi */
export function weekdayOf(iso: string): number {
  return toDate(iso).getUTCDay();
}

export function formatLong(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(toDate(iso));
}

export function formatMonth(year: number, month: number): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  );
}
