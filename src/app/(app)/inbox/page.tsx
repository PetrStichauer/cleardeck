'use client';

import { useState } from 'react';
import { Inbox, Plus } from 'lucide-react';
import { TaskList } from '@/components/task/TaskList';
import { FilterBar } from '@/components/common/FilterBar';
import { useInboxTasks } from '@/hooks/useTasks';
import { useUIStore } from '@/store/ui.store';
import { filterBySearch, applyQuickFilters, QuickFilters } from '@/lib/filters';

export default function InboxPage() {
  const allTasks = useInboxTasks();
  const setQuickEntryOpen = useUIStore((s) => s.setQuickEntryOpen);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);

  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    flaggedOnly: false,
    hasDueDate: false,
    overdueOnly: false,
  });

  const tasks = applyQuickFilters(filterBySearch(allTasks, searchQuery), quickFilters);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Inbox size={20} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Inbox</h1>
          {tasks.length > 0 && (
            <span
              style={{
                background: 'var(--accent-primary)',
                color: '#fff',
                borderRadius: '10px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {tasks.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setQuickEntryOpen(true)}
          title="New Task (⌘K)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--gradient-primary)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <Plus size={14} />
          New Task
        </button>
      </div>

      {/* Filter bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        quickFilters={quickFilters}
        onQuickFilterChange={setQuickFilters}
      />

      {/* Task list */}
      <TaskList
        tasks={tasks}
        emptyMessage="Inbox is empty. Press ⌘K to add a task."
        emptyIcon={<Inbox size={48} />}
      />
    </div>
  );
}
