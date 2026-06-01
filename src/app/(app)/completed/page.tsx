'use client';

import { CheckSquare } from 'lucide-react';
import { TaskList } from '@/components/task/TaskList';
import { useCompletedTasks } from '@/hooks/useTasks';
import { useCompletedProjects } from '@/hooks/useProjects';
import { useProjectsStore } from '@/store/projects.store';
import { format, parseISO } from 'date-fns';

export default function CompletedPage() {
  const completedTasks = useCompletedTasks();
  const completedProjects = useCompletedProjects();
  const updateProject = useProjectsStore((s) => s.updateProject);

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
        <CheckSquare size={20} color="var(--accent-primary)" />
        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Completed</h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <div>
            <div
              style={{
                padding: '10px 16px 4px',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--muted-text)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'var(--sidebar-bg)',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              Projects ({completedProjects.length})
            </div>
            {completedProjects.map((project) => (
              <div
                key={project.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  gap: '10px',
                }}
              >
                <CheckSquare size={16} color="var(--accent-primary)" />
                <span style={{ flex: 1, fontSize: '14px', opacity: 0.7 }}>{project.title}</span>
                {project.completed_at && (
                  <span style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
                    {format(parseISO(project.completed_at), 'MMM d')}
                  </span>
                )}
                <button
                  onClick={() => updateProject(project.id, { status: 'active', completed_at: null })}
                  style={{ fontSize: '11px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
                >
                  Reactivate
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Completed Tasks */}
        <div>
          {completedTasks.length > 0 && (
            <div
              style={{
                padding: '10px 16px 4px',
                fontSize: '11px',
                fontWeight: '600',
                color: 'var(--muted-text)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                background: 'var(--sidebar-bg)',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              Tasks ({completedTasks.length})
            </div>
          )}
          <TaskList
            tasks={completedTasks}
            emptyMessage={completedProjects.length === 0 ? 'Nothing completed yet' : undefined}
          />
        </div>
      </div>
    </div>
  );
}
