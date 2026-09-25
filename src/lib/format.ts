import { formatInTimeZone } from "./timezone";

/** Formats a UTC timestamp from the backend in the given timezone (defaults to UTC). */
export function formatDate(value?: string | null, timeZone = "UTC") {
  return formatInTimeZone(value, timeZone);
}

export function formatAccess(value?: string, timeZone = "UTC") {
  if (!value || value === "free") return "Free";
  if (value === "lifetime") return "Lifetime";
  return formatDate(value, timeZone);
}

export function entriesFromRecord(record: Record<string, number>) {
  return Object.entries(record || {}).sort((a, b) => b[1] - a[1]);
}
