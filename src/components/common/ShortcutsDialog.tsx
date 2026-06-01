'use client';

import { X } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

const shortcuts = [
  { keys: ['⌘', 'K'], description: 'Quick entry — capture a new task' },
  { keys: ['⌘', 'I'], description: 'Toggle inspector panel' },
  { keys: ['⌘', '/'], description: 'Show keyboard shortcuts' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
  { keys: ['Esc'], description: 'Close modals and dialogs' },
];

export function ShortcutsDialog() {
  const { shortcutsOpen, setShortcutsOpen } = useUIStore();

  if (!shortcutsOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => setShortcutsOpen(false)}
    >
      <div
        style={{
          width: 'min(420px, calc(100vw - 32px))',
          background: 'var(--sidebar-bg)',
          borderRadius: '16px',
          border: '1px solid var(--sidebar-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--sidebar-border)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Keyboard Shortcuts</h2>
          <button
            onClick={() => setShortcutsOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-text)',
              padding: '4px',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '12px 20px 20px' }}>
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.description}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid var(--glass-border)',
                gap: '16px',
              }}
            >
              <span style={{ fontSize: '14px', color: 'var(--foreground)' }}>
                {shortcut.description}
              </span>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid var(--sidebar-border)',
                      background: 'var(--background)',
                      fontSize: '12px',
                      fontFamily: 'var(--font-geist-mono, monospace)',
                      color: 'var(--muted-text)',
                    }}
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
