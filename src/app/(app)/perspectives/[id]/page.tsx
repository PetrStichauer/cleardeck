'use client';

import { use, useState } from 'react';
import { Settings } from 'lucide-react';
import { usePerspectivesStore } from '@/store/perspectives.store';
import { useTasksStore } from '@/store/tasks.store';
import { useProjectsStore } from '@/store/projects.store';
import { useTagsStore } from '@/store/tags.store';
import { useUIStore } from '@/store/ui.store';
import { TaskList } from '@/components/task/TaskList';
import { EmptyState } from '@/components/common/EmptyState';
import { PerspectiveEditor } from '@/components/perspective/PerspectiveEditor';
import { applyFilterRules, filterBySearch, sortTasks, groupTasks } from '@/lib/filters';

export default function PerspectivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [editorOpen, setEditorOpen] = useState(false);

  const perspectives = usePerspectivesStore((s) => s.perspectives);
  const tasks = useTasksStore((s) => s.tasks);
  const projects = useProjectsStore((s) => s.projects);
  const tags = useTagsStore((s) => s.tags);
  const searchQuery = useUIStore((s) => s.searchQuery);

  const perspective = perspectives[id];
  if (!perspective) {
    return <EmptyState message="Perspective not found" />;
  }

  let filtered = Object.values(tasks);

  // Status filter
  if (!perspective.show_completed) {
    filtered = filtered.filter((t) => t.status === 'active');
  }

  // Custom filter rules
  filtered = applyFilterRules(filtered, perspective.filter_rules, perspective.filter_operator);

  // Global search
  filtered = filterBySearch(filtered, searchQuery);

  // Sort
  filtered = sortTasks(filtered, perspective.sort_by, perspective.sort_direction);

  // Group
  const groups = groupTasks(filtered, perspective.group_by, projects, tags);

  const totalCount = filtered.length;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
          <span style={{ fontSize: '20px' }}>{perspective.icon || '●'}</span>
          <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0, flex: 1 }}>{perspective.name}</h1>
          {totalCount > 0 && (
            <span style={{ background: 'var(--accent-blue)', color: '#fff', borderRadius: '10px', padding: '2px 8px', fontSize: '12px', fontWeight: '600' }}>
              {totalCount}
            </span>
          )}
          <button
            onClick={() => setEditorOpen(true)}
            title="Edit perspective"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-text)', padding: '6px', borderRadius: '6px', display: 'flex' }}
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Grouped task lists */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {groups.length === 0 || (groups.length === 1 && groups[0].tasks.length === 0) ? (
            <EmptyState message="No tasks match this perspective" />
          ) : perspective.group_by === 'none' ? (
            <TaskList tasks={groups[0]?.tasks ?? []} emptyMessage="No tasks match this perspective" />
          ) : (
            groups.map((group) => (
              group.tasks.length > 0 && (
                <div key={group.label}>
                  <div style={{
                    padding: '10px 20px 4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--muted-text)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    borderBottom: '1px solid var(--border-color)',
                    background: 'var(--card-bg)',
                  }}>
                    {group.label}
                    <span style={{ marginLeft: '6px', fontWeight: '400', opacity: 0.7 }}>
                      ({group.tasks.length})
                    </span>
                  </div>
                  <TaskList tasks={group.tasks} emptyMessage="" />
                </div>
              )
            ))
          )}
        </div>
      </div>

      <PerspectiveEditor
        perspective={perspective}
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
      />
    </>
  );
}
