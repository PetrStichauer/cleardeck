'use client';

import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ message = 'Nothing here', icon }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: '12px',
        color: 'var(--muted-text)',
        padding: '40px 20px',
      }}
    >
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        background: 'var(--accent-primary-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--accent-primary)',
        opacity: 0.7,
      }}>
        {icon || <Inbox size={32} />}
      </div>
      <p style={{ fontSize: '14px', margin: 0, textAlign: 'center' }}>{message}</p>
    </div>
  );
}
