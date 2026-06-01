'use client';

import { CalendarDays } from 'lucide-react';
import { useForecastTasks, useOverdueTasks } from '@/hooks/useTasks';
import { TaskRow } from '@/components/task/TaskRow';
import { getDayBuckets, isSameDay, parseISO, format, isToday } from '@/lib/dates';

export default function ForecastPage() {
  const forecastData = useForecastTasks();
  const overdueTasks = useOverdueTasks();
  const dayBuckets = getDayBuckets(2, 14);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
        }}
      >
        <CalendarDays size={20} color="var(--accent-primary)" />
        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Forecast</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Overdue bucket */}
        {overdueTasks.length > 0 && (
          <div>
            <div
              style={{
                padding: '10px 16px 4px',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--accent-red)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: '#ff3b3011',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Overdue
              <span
                style={{
                  background: 'var(--accent-red)',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '0 6px',
                  fontSize: '10px',
                }}
              >
                {overdueTasks.length}
              </span>
            </div>
            {overdueTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </div>
        )}

        {/* Day buckets */}
        {dayBuckets.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');
          const bucket = forecastData.find((b) => b.date === dayStr);
          const taskCount = bucket?.tasks.length || 0;
          const today = isToday(day);

          return (
            <div key={dayStr}>
              <div
                style={{
                  padding: '10px 16px 4px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: today ? 'var(--accent-primary)' : 'var(--muted-text)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  background: today ? 'var(--accent-primary-light)' : 'var(--sidebar-bg)',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderLeft: today ? '3px solid var(--accent-primary)' : '3px solid transparent',
                }}
              >
                <span>{today ? 'Today' : format(day, 'EEE, MMM d')}</span>
                {taskCount > 0 && (
                  <span
                    style={{
                      background: today ? 'var(--accent-primary)' : 'var(--muted-text)',
                      color: '#fff',
                      borderRadius: '10px',
                      padding: '0 6px',
                      fontSize: '10px',
                    }}
                  >
                    {taskCount}
                  </span>
                )}
              </div>
              {bucket?.tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
              {taskCount === 0 && (
                <div
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    color: 'var(--muted-text)',
                    opacity: 0.5,
                    borderBottom: '1px solid var(--border-color)',
                    minHeight: '36px',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
