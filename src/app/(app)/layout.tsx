'use client';

import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { InspectorPanel } from '@/components/layout/InspectorPanel';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { MobileSidebarSheet } from '@/components/layout/MobileSidebarSheet';
import { QuickEntry } from '@/components/task/QuickEntry';
import { ShortcutsDialog } from '@/components/common/ShortcutsDialog';
import { DataPortability } from '@/components/settings/DataPortability';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useUIStore } from '@/store/ui.store';
import { useStorage } from '@/hooks/useStorage';
import { useTasksStore } from '@/store/tasks.store';
import { checkAndNotify } from '@/lib/notifications';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();
  const ready = useStorage(); // triggers Supabase data load on mount
  const inspectorOpen = useUIStore((s) => s.inspectorOpen);
  const notificationsEnabled = useUIStore((s) => s.notificationsEnabled);
  const tasks = useTasksStore((s) => s.tasks);

  useEffect(() => {
    if (ready && notificationsEnabled) {
      checkAndNotify(Object.values(tasks));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, notificationsEnabled]);

  return (
    <div
      className="app-shell"
      style={{
        display: 'grid',
        gridTemplateColumns: `240px 1fr ${inspectorOpen ? '360px' : '0px'}`,
        height: '100dvh',
        overflow: 'hidden',
        transition: 'grid-template-columns 0.2s ease',
      }}
    >
      <Sidebar />
      <main
        style={{
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--background)',
        }}
      >
        {children}
      </main>
      <InspectorPanel />
      <QuickEntry />
      <ShortcutsDialog />
      <DataPortability />
      <BottomTabBar />
      <MobileSidebarSheet />
    </div>
  );
}
