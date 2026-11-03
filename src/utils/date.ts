const DAY_MS = 24 * 60 * 60 * 1000;

/** "Today", "Yesterday", "3d ago", "2w ago", then a short date ("Sep 14"). */
export function formatUpdatedLabel(isoDate: string, now = new Date()): string {
  const startOfDay = (date: Date): number =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const date = new Date(isoDate);
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (days <= 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days < 7) {
    return `${days}d ago`;
  }
  if (days < 30) {
    return `${Math.floor(days / 7)}w ago`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
