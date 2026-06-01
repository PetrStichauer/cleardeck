'use client';

import { isOverdue, isSoon, isDueToday, formatDateDisplay } from '@/lib/dates';

interface DueDateBadgeProps {
  dueDate: string | null;
}

export function DueDateBadge({ dueDate }: DueDateBadgeProps) {
  if (!dueDate) return null;

  const overdue = isOverdue(dueDate);
  const soon = isSoon(dueDate);
  const today = isDueToday(dueDate);

  const color = overdue
    ? 'var(--accent-red)'
    : today || soon
    ? 'var(--accent-orange)'
    : 'var(--muted-text)';

  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: overdue || today ? '600' : '400',
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {formatDateDisplay(dueDate)}
    </span>
  );
}
