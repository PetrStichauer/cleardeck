'use client';

import { Tag } from '@/types';

interface TagChipProps {
  tag: Tag;
  onRemove?: () => void;
}

export function TagChip({ tag, onRemove }: TagChipProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '1px 7px',
        borderRadius: '10px',
        fontSize: '11px',
        fontWeight: '500',
        background: tag.color ? `${tag.color}22` : 'var(--sidebar-border)',
        color: tag.color || 'var(--muted-text)',
        border: `1px solid ${tag.color ? `${tag.color}44` : 'var(--border-color)'}`,
        whiteSpace: 'nowrap',
      }}
    >
      {tag.name}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
            color: 'inherit',
            opacity: 0.7,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
}
