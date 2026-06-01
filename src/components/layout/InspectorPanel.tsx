'use client';

import { useUIStore } from '@/store/ui.store';
import { useTasksStore } from '@/store/tasks.store';
import { useProjectsStore } from '@/store/projects.store';
import { TaskInspector } from '@/components/task/TaskInspector';
import { ProjectInspector } from '@/components/project/ProjectInspector';
import { X } from 'lucide-react';

export function InspectorPanel() {
  const { selectedItem, inspectorOpen, setInspectorOpen, setSelectedItem } = useUIStore();
  const tasks = useTasksStore((s) => s.tasks);
  const projects = useProjectsStore((s) => s.projects);

  if (!inspectorOpen || !selectedItem) return null;

  const task = selectedItem.type === 'task' ? tasks[selectedItem.id] : null;
  const project = selectedItem.type === 'project' ? projects[selectedItem.id] : null;

  function handleClose() {
    setInspectorOpen(false);
    setSelectedItem(null);
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="inspector-mobile-backdrop"
        onClick={handleClose}
      />

      <aside
        className="inspector-panel"
        style={{
          borderLeft: '1px solid var(--border-color)',
          background: 'var(--card-bg)',
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '360px',
        }}
      >
        {/* Mobile drag handle */}
        <div className="inspector-drag-handle" />

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            position: 'sticky',
            top: 0,
            background: 'var(--card-bg)',
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
            }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted-text)' }}>
              {selectedItem.type === 'task' ? 'Task' : 'Project'}
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-text)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '6px',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-primary-light)';
              e.currentTarget.style.color = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--muted-text)';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          {task && <TaskInspector task={task} />}
          {project && <ProjectInspector project={project} />}
        </div>
      </aside>
    </>
  );
}
