'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { TaskStatus } from '@/types';

interface TaskStatusButtonProps {
  status: TaskStatus;
  flagged?: boolean;
  onComplete: () => void;
  onDrop?: () => void;
  size?: number;
}

export function TaskStatusButton({
  status,
  flagged,
  onComplete,
  onDrop,
  size = 18,
}: TaskStatusButtonProps) {
  const [hovered, setHovered] = useState(false);

  const isCompleted = status === 'completed';
  const isDropped = status === 'dropped';

  const borderColor = flagged
    ? 'var(--accent-orange)'
    : isCompleted
    ? 'var(--accent-primary)'
    : isDropped
    ? 'var(--muted-text)'
    : 'var(--border-color)';

  const bgColor = isCompleted
    ? 'var(--accent-primary)'
    : isDropped
    ? 'var(--muted-text)'
    : hovered
    ? 'var(--accent-primary-light)'
    : 'transparent';

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        if (isCompleted || isDropped) return;
        onComplete();
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDrop && !isCompleted && !isDropped) {
          onDrop();
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={isCompleted ? 'Completed' : isDropped ? 'Dropped' : 'Click to complete, right-click to drop'}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${borderColor}`,
        background: bgColor,
        cursor: isCompleted || isDropped ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.15s ease',
        padding: 0,
      }}
    >
      {isCompleted && <Check size={size * 0.6} color="#fff" strokeWidth={2.5} />}
      {isDropped && <X size={size * 0.6} color="#fff" strokeWidth={2.5} />}
    </button>
  );
}
