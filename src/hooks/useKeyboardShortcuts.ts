'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function useKeyboardShortcuts() {
  const setQuickEntryOpen = useUIStore((s) => s.setQuickEntryOpen);
  const toggleInspector = useUIStore((s) => s.toggleInspector);
  const setShortcutsOpen = useUIStore((s) => s.setShortcutsOpen);
  const shortcutsOpen = useUIStore((s) => s.shortcutsOpen);
  const quickEntryOpen = useUIStore((s) => s.quickEntryOpen);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target) && e.key !== 'Escape') return;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickEntryOpen(true);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        toggleInspector();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShortcutsOpen(!shortcutsOpen);
        return;
      }

      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        setQuickEntryOpen(false);
        setShortcutsOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setQuickEntryOpen, toggleInspector, setShortcutsOpen, shortcutsOpen]);

  useEffect(() => {
    if (quickEntryOpen) setShortcutsOpen(false);
  }, [quickEntryOpen, setShortcutsOpen]);
}
