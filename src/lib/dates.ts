import {
  isAfter,
  isBefore,
  isToday,
  addDays,
  startOfDay,
  endOfDay,
  format,
  formatRelative,
  parseISO,
  differenceInDays,
  isSameDay,
} from 'date-fns';

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return isBefore(startOfDay(parseISO(dateStr)), startOfDay(new Date()));
}

export function isSoon(dateStr: string | null, daysThreshold = 3): boolean {
  if (!dateStr) return false;
  const date = startOfDay(parseISO(dateStr));
  const now = startOfDay(new Date());
  const threshold = startOfDay(addDays(new Date(), daysThreshold));
  return !isBefore(date, now) && !isAfter(date, threshold);
}

export function isDueToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return isToday(parseISO(dateStr));
}

export function isAvailable(deferDate: string | null): boolean {
  if (!deferDate) return true;
  return !isAfter(startOfDay(parseISO(deferDate)), startOfDay(new Date()));
}

export function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  const now = new Date();
  const days = differenceInDays(startOfDay(date), startOfDay(now));

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0 && days <= 7) return format(date, 'EEEE'); // Day of week
  return format(date, 'MMM d');
}

export function formatFullDate(dateStr: string | null): string {
  if (!dateStr) return '';
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getDayBuckets(daysBack = 2, daysForward = 14): Date[] {
  const days: Date[] = [];
  for (let i = -daysBack; i <= daysForward; i++) {
    days.push(addDays(startOfDay(new Date()), i));
  }
  return days;
}

export { parseISO, isSameDay, format, startOfDay, endOfDay, addDays, isToday };
