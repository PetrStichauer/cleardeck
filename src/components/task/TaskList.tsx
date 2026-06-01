'use client';

import { Task } from '@/types';
import { TaskRow } from './TaskRow';
import { EmptyState } from '@/components/common/EmptyState';

interface TaskGroup {
  label?: string;
  tasks: (Task & { _locked?: boolean })[];
}

interface TaskListProps {
  groups?: TaskGroup[];
  tasks?: Task[];
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function TaskList({ groups, tasks, emptyMessage = 'No tasks', emptyIcon }: TaskListProps) {
  // Normalize to groups
  const normalizedGroups: TaskGroup[] = groups || (tasks ? [{ tasks }] : []);
  const totalTasks = normalizedGroups.reduce((sum, g) => sum + g.tasks.length, 0);

  if (totalTasks === 0) {
    return <EmptyState message={emptyMessage} icon={emptyIcon} />;
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {normalizedGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {group.label && (
            <div
              style={{
                padding: '10px 16px 4px',
                fontSize: '10px',
                fontWeight: '700',
                color: 'var(--muted-text)',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                background: 'var(--sidebar-bg)',
                borderBottom: '1px solid var(--border-color)',
                borderLeft: '3px solid var(--accent-primary)',
                position: 'sticky',
                top: 0,
                zIndex: 5,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {group.label}
              <span
                style={{
                  background: 'var(--accent-primary-light)',
                  color: 'var(--accent-primary)',
                  borderRadius: '10px',
                  padding: '0 6px',
                  fontSize: '10px',
                  fontWeight: '700',
                }}
              >
                {group.tasks.length}
              </span>
            </div>
          )}
          {group.tasks.map((task) => (
            <TaskRow key={task.id} task={task} locked={task._locked} />
          ))}
        </div>
      ))}
    </div>
  );
}
