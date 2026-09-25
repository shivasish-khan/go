/**
 * Timezone helpers.
 *
 * The backend stores and returns every timestamp in UTC. These helpers are the
 * single place that converts between that UTC "wire format" and whatever
 * timezone the person has picked, so:
 *  - anything we *display* (expiry dates, click timestamps, plan access) is
 *    shown in their chosen timezone with an explicit UTC offset, and
 *  - anything we *send* (a custom expiry date/time the person picked on a
 *    wall clock) is converted into a correct, unambiguous UTC instant before
 *    it leaves the browser, so the backend never has to guess a timezone.
 */

/** Used only if the browser doesn't support Intl.supportedValuesOf("timeZone"). */
const FALLBACK_TIMEZONES = [
  "UTC",
  "Pacific/Midway",
  "Pacific/Honolulu",
  "America/Anchorage",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Atlantic/Azores",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Athens",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Asia/Jerusalem",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",
  "Asia/Jakarta",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Perth",
  "Australia/Sydney",
  "Pacific/Auckland",
];

function getOrdinalDay(day: number) {
  if (day > 3 && day < 21) return `${day}th`;

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/** The IANA timezone the browser is currently set to, e.g. "Asia/Kolkata". */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Every IANA timezone the browser knows about, for the timezone picker. */
export function listTimezones(): string[] {
  try {
    if (typeof Intl.supportedValuesOf === "function") {
      const zones = Intl.supportedValuesOf("timeZone");
      if (zones && zones.length > 0) return zones;
    }
  } catch {
    // Fall through to the fallback list below.
  }

  return [...FALLBACK_TIMEZONES];
}

/** The offset of `timeZone`, in minutes east of UTC, at the instant `date`. Handles DST. */
export function getTimeZoneOffsetMinutes(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const lookup: Record<string, string> = {};
  for (const part of parts) lookup[part.type] = part.value;

  const asUtc = Date.UTC(
    Number(lookup.year),
    Number(lookup.month) - 1,
    Number(lookup.day),
    Number(lookup.hour) % 24,
    Number(lookup.minute),
    Number(lookup.second)
  );

  return Math.round((asUtc - date.getTime()) / 60000);
}

/** e.g. 330 -> "+05:30", -240 -> "-04:00", 0 -> "+00:00" */
export function formatUtcOffset(minutes: number): string {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;

  return `${sign}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** e.g. "Asia/Kolkata (UTC+05:30)" — recomputed for "now" so it stays right across DST. */
export function getTimezoneDisplayLabel(timeZone: string): string {
  const offset = getTimeZoneOffsetMinutes(timeZone, new Date());
  return `${timeZone.replace(/_/g, " ")} (UTC${formatUtcOffset(offset)})`;
}

/**
 * Converts a wall-clock date/time the person picked (in `timeZone`) into the
 * matching UTC instant. Two-pass so it stays correct across DST transitions,
 * where a fixed offset guessed once can be off by an hour.
 */
export function zonedWallTimeToUtcIso(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number, // 0-23
  minute: number,
  timeZone: string
): string {
  const naiveUtcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);

  const firstPassOffset = getTimeZoneOffsetMinutes(timeZone, new Date(naiveUtcGuess));
  const refinedMillis = naiveUtcGuess - firstPassOffset * 60000;

  const secondPassOffset = getTimeZoneOffsetMinutes(timeZone, new Date(refinedMillis));
  const finalMillis = naiveUtcGuess - secondPassOffset * 60000;

  return new Date(finalMillis).toISOString();
}

/** Formats a UTC timestamp string from the backend into the given IANA timezone. */
export function formatInTimeZone(value?: string | null, timeZone = "UTC"): string {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const lookup: Record<string, string> = {};
  for (const part of parts) lookup[part.type] = part.value;

  const day = getOrdinalDay(Number(lookup.day));
  const month = lookup.month.toLowerCase();
  const offset = formatUtcOffset(getTimeZoneOffsetMinutes(timeZone, date));

  return `${day} ${month} ${lookup.year} ${lookup.hour}:${lookup.minute}:${lookup.second} UTC${offset}`;
}
