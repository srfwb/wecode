const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(timestampMs: number, now: number = Date.now()): string {
  const diff = now - timestampMs;
  if (diff < 0) return "à l'instant";
  if (diff < MINUTE) return "à l'instant";
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `il y a ${mins} min`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `il y a ${hours} h`;
  }
  if (diff < 2 * DAY) return "hier";
  if (diff < 7 * DAY) {
    const days = Math.floor(diff / DAY);
    return `il y a ${days} j`;
  }
  return new Date(timestampMs).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
