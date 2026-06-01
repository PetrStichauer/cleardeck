'use client';

import { Task } from '@/types';
import { useTasksStore } from '@/store/tasks.store';
import { useUIStore } from '@/store/ui.store';
import { useTagsStore } from '@/store/tags.store';
import { TaskStatusButton } from './TaskStatusButton';
import { TagChip } from './TagChip';
import { DueDateBadge } from './DueDateBadge';
import { Flag } from 'lucide-react';

interface TaskRowProps {
  task: Task;
  locked?: boolean;
}

export function TaskRow({ task, locked }: TaskRowProps) {
  const { completeTask, dropTask, updateTask } = useTasksStore();
  const { setSelectedItem, selectedItem } = useUIStore();
  const tags = useTagsStore((s) => s.tags);

  const isSelected = selectedItem?.type === 'task' && selectedItem.id === task.id;
  const isCompleted = task.status === 'completed';
  const isDropped = task.status === 'dropped';

  const taskTags = task.tag_ids.map((id) => tags[id]).filter(Boolean);

  return (
    <div
      className="task-row"
      onClick={() => {
        if (!locked) {
          setSelectedItem({ type: 'task', id: task.id });
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 16px',
        cursor: locked ? 'default' : 'pointer',
        background: isSelected ? 'var(--accent-primary-light)' : 'transparent',
        opacity: locked || isDropped ? 0.4 : 1,
        borderBottom: '1px solid var(--border-color)',
        minHeight: '44px',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = 'var(--accent-primary-light)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }
      }}
    >
      {/* Status button */}
      <TaskStatusButton
        status={task.status}
        flagged={task.flagged}
        onComplete={() => completeTask(task.id)}
        onDrop={() => dropTask(task.id)}
      />

      {/* Title */}
      <span
        style={{
          flex: 1,
          fontSize: '14px',
          color: 'var(--foreground)',
          textDecoration: isCompleted || isDropped ? 'line-through' : 'none',
          opacity: isCompleted || isDropped ? 0.6 : 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {task.title}
      </span>

      {/* Tags */}
      {taskTags.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {taskTags.slice(0, 2).map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
          {taskTags.length > 2 && (
            <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
              +{taskTags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Flag */}
      {task.flagged && (
        <Flag
          size={12}
          fill="var(--accent-orange)"
          color="var(--accent-orange)"
          style={{ flexShrink: 0 }}
        />
      )}

      {/* Due date */}
      {task.due_date && <DueDateBadge dueDate={task.due_date} />}
    </div>
  );
}
