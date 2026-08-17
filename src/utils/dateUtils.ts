/**
 * Local calendar-date helpers.
 *
 * `new Date().toISOString().slice(0, 10)` returns the UTC date, which is a
 * different day from the user's own calendar for part of every day. That
 * mattered here because weekday-based plan selection uses local time while
 * session records were stamped in UTC: an early-morning workout east of
 * Greenwich, or a late-night one west of it, was filed under the wrong day and
 * then disappeared from that day's charts, streaks, and weekly review.
 *
 * Everything that stores or compares a calendar date should use these.
 */

/** A Date as a local-time YYYY-MM-DD string. */
export function toLocalIsoDate(value: Date | string | number = new Date()): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const offsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10)
}

/** Today as a local-time YYYY-MM-DD string. */
export function todayIsoDate(): string {
  return toLocalIsoDate(new Date())
}
