/**
 * Date helpers.
 *
 * The app used to store dates in whatever `toLocaleDateString` produced
 * (e.g. "25/12/2024" for en-GB). That format cannot be parsed back with
 * `new Date(...)` in most browsers (`new Date("25/12/2024")` is an invalid
 * date), which broke the heatmap, "completed today" checks and sync conflict
 * resolution.
 *
 * All dates are now stored in the local-time ISO format `YYYY-MM-DD`
 * (day granularity, no timezone component so it is stable across clients).
 */

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}/;
const EN_GB_DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

/** Format a Date as a local `YYYY-MM-DD` string. */
export function toIsoDate(date: Date): string {
  const year = date.getFullYear().toString().padStart(4, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Today as a local `YYYY-MM-DD` string. */
export function todayIso(): string {
  return toIsoDate(new Date());
}

/**
 * Normalize any previously stored date representation (ISO datetime,
 * `YYYY-MM-DD`, legacy `DD/MM/YYYY`, Date object) to `YYYY-MM-DD`.
 * Returns null when the value cannot be interpreted as a date.
 */
export function normalizeStoredDate(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : toIsoDate(value);
  }

  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const trimmed = value.trim();

  if (ISO_DATE_PATTERN.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  // legacy en-GB format: DD/MM/YYYY
  const legacyMatch = trimmed.match(EN_GB_DATE_PATTERN);
  if (legacyMatch) {
    const [, day, month, year] = legacyMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : toIsoDate(parsed);
}

/** Full ISO-8601 timestamp (UTC), used for LastUpdated fields. */
export function nowIsoTimestamp(): string {
  return new Date().toISOString();
}
