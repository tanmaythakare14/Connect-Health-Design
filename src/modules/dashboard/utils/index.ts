const relativeFormatter = new Intl.RelativeTimeFormat('en-US', {
  numeric: 'auto',
});

const fullFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

const UNITS: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
];

/** "8 minutes ago", "2 hours ago", "yesterday" — or "just now" under a minute. */
export function formatRelativeTime(iso: string, now = Date.now()): string {
  const elapsedMs = now - new Date(iso).getTime();
  for (const { unit, ms } of UNITS) {
    if (elapsedMs >= ms) {
      return relativeFormatter.format(-Math.floor(elapsedMs / ms), unit);
    }
  }
  return 'just now';
}

/** "Nov 2, 2026, 1:51:20 PM" — for the relative time's tooltip. */
export function formatFullDateTime(iso: string): string {
  return fullFormatter.format(new Date(iso));
}
