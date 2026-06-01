import { Task } from '@/types';
import { isOverdue, isDueToday } from '@/lib/dates';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function sendNotification(title: string, body: string, tag?: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  new Notification(title, {
    body,
    tag,
    icon: '/icon-192.png',
  });
}

export function checkAndNotify(tasks: Task[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const overdue = tasks.filter(
    (t) => t.status === 'active' && isOverdue(t.due_date)
  );
  const dueToday = tasks.filter(
    (t) => t.status === 'active' && !isOverdue(t.due_date) && isDueToday(t.due_date)
  );

  if (overdue.length > 0) {
    sendNotification(
      `${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`,
      overdue.map((t) => t.title).slice(0, 3).join(', ') + (overdue.length > 3 ? '…' : ''),
      'overdue'
    );
  }

  if (dueToday.length > 0) {
    sendNotification(
      `${dueToday.length} task${dueToday.length > 1 ? 's' : ''} due today`,
      dueToday.map((t) => t.title).slice(0, 3).join(', ') + (dueToday.length > 3 ? '…' : ''),
      'due-today'
    );
  }
}
