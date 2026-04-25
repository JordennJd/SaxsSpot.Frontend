// Utility function for combining classes
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(' ');
}

const displayLocale =
  typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'ru-RU';

function parseToDate(value: string | Date | null | undefined): Date | null {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Дата и время в «человеческом» виде (локаль браузера, например 14 апреля 2026 г., 15:30). */
export function formatDateTime(value: string | Date | null | undefined): string {
  const d = parseToDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(displayLocale, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(d);
}

/** Только дата (без времени). */
export function formatDateOnly(value: string | Date | null | undefined): string {
  const d = parseToDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(displayLocale, {
    dateStyle: 'long',
  }).format(d);
}

/** Узкий вариант: короткий месяц + дата + время. */
export function formatDateTimeCompact(value: string | Date | null | undefined): string {
  const d = parseToDate(value);
  if (!d) return '—';
  return new Intl.DateTimeFormat(displayLocale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function formatDurationFromTotalSeconds(totalSeconds: number): string {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
}

/** Non-negative duration from milliseconds, e.g. sum of per-system generation spans. */
export function formatElapsedDurationMs(totalMs: number): string {
  if (!Number.isFinite(totalMs) || totalMs < 0) return '—';
  return formatDurationFromTotalSeconds(Math.floor(totalMs / 1000));
}

/** Elapsed wall-clock time between two instants, e.g. "2d 3h 1m 5s". */
export function formatGenerationDuration(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined,
): string {
  const first = parseToDate(start);
  const last = parseToDate(end);
  if (!first || !last) return '—';

  const diffMs = last.getTime() - first.getTime();
  if (diffMs < 0) return '—';

  return formatElapsedDurationMs(diffMs);
}

/** @deprecated Используйте formatDateTime. */
export function formatDate(date: string | Date): string {
  return formatDateTime(date);
}

// Format file size
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (bytes / Math.pow(k, i)) + ' ' + sizes[i];
}

// Sleep utility for development/testing
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
} 