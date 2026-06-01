'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { TaskList } from '@/components/task/TaskList';
import { FilterBar } from '@/components/common/FilterBar';
import { useFlaggedTasks } from '@/hooks/useTasks';
import { filterBySearch, applyQuickFilters, QuickFilters } from '@/lib/filters';

export default function FlaggedPage() {
  const allTasks = useFlaggedTasks();
  // Local search – independent per page, doesn't bleed in from Inbox
  const [searchQuery, setSearchQuery] = useState('');

  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    flaggedOnly: false,
    hasDueDate: false,
    overdueOnly: false,
  });

  const tasks = applyQuickFilters(filterBySearch(allTasks, searchQuery), quickFilters);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
        <Flag size={20} color="var(--accent-orange)" />
        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Flagged</h1>
        {tasks.length > 0 && (
          <span
            style={{
              background: 'var(--accent-orange)',
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

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        quickFilters={quickFilters}
        onQuickFilterChange={setQuickFilters}
      />

      <TaskList
        tasks={tasks}
        emptyMessage="No flagged tasks"
        emptyIcon={<Flag size={48} />}
      />
    </div>
  );
}
