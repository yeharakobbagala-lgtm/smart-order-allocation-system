/**
 * Parse API datetimes. Backend stores/returns UTC; naive ISO strings
 * without Z must be treated as UTC (appending Z), otherwise browsers in
 * UTC+ zones treat them as local and the reservation looks already expired.
 */
export function parseServerDate(iso: string | null | undefined): Date {
  if (!iso) return new Date(NaN);
  const trimmed = iso.trim();
  if (!trimmed) return new Date(NaN);
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed);
  return new Date(hasTimezone ? trimmed : `${trimmed}Z`);
}

export function secondsUntilExpiry(expiresAt: string): number {
  const end = parseServerDate(expiresAt).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.floor((end - Date.now()) / 1000));
}

export function formatDeliveryDate(iso: string): string {
  const d = parseServerDate(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatExpiryClock(iso: string): string {
  const d = parseServerDate(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatEtaHours(hours: number): string {
  if (!Number.isFinite(hours)) return "—";
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `~${mins} minute${mins === 1 ? "" : "s"}`;
  }
  const rounded = Math.round(hours);
  if (Math.abs(hours - rounded) < 0.05) {
    return `~${rounded} hour${rounded === 1 ? "" : "s"}`;
  }
  return `~${hours.toFixed(1)} hours`;
}

export function formatTravelTime(hours: number): string {
  if (!Number.isFinite(hours)) return "—";
  const mins = Math.round(hours * 60);
  if (mins < 1) return "0 minutes";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (m === 0) return `${h} hour${h === 1 ? "" : "s"}`;
  return `${h} h ${m} min`;
}

export function formatStockWait(hours: number): string {
  if (!Number.isFinite(hours)) return "—";
  if (hours <= 0) return "0 hours";
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hour${rounded === 1 ? "" : "s"}`;
}

export function formatProcessingTime(hours: number): string {
  if (!Number.isFinite(hours)) return "—";
  const rounded = Math.round(hours);
  return `${rounded} hour${rounded === 1 ? "" : "s"}`;
}

/** Matches backend TEMPORARY_RESERVATION_MINUTES */
export const RESERVATION_DURATION_SECONDS = 10 * 60;
