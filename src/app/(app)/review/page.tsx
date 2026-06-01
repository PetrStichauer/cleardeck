'use client';

import { useState } from 'react';
import { RotateCcw, ChevronRight, Check } from 'lucide-react';
import { useProjectsNeedingReview } from '@/hooks/useProjects';
import { useProjectsStore } from '@/store/projects.store';
import { useProjectTasks } from '@/hooks/useTasks';
import { TaskRow } from '@/components/task/TaskRow';
import { format, parseISO } from 'date-fns';

function ReviewCard({
  projectId,
  onReviewed,
}: {
  projectId: string;
  onReviewed: () => void;
}) {
  const projects = useProjectsStore((s) => s.projects);
  const markReviewed = useProjectsStore((s) => s.markReviewed);
  const project = projects[projectId];
  const tasks = useProjectTasks(projectId);

  if (!project) return null;

  return (
    <div
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        overflow: 'hidden',
        margin: '16px',
      }}
    >
      {/* Project header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', background: 'var(--sidebar-bg)' }}>
        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{project.title}</h2>
        <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--muted-text)' }}>
          {project.last_reviewed_at
            ? `Last reviewed: ${format(parseISO(project.last_reviewed_at), 'MMM d, yyyy')}`
            : 'Never reviewed'}
          {' · '}{tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tasks */}
      {tasks.length > 0 && (
        <div>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Mark reviewed */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => {
            markReviewed(projectId);
            onReviewed();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--gradient-primary)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <Check size={14} />
          Mark Reviewed
        </button>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  const projectsToReview = useProjectsNeedingReview();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentProject = projectsToReview[currentIndex];

  if (projectsToReview.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <RotateCcw size={20} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Review</h1>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: 'var(--muted-text)' }}>
          <RotateCcw size={48} style={{ opacity: 0.3 }} />
          <p style={{ margin: 0, fontSize: '14px' }}>All projects reviewed!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <RotateCcw size={20} color="var(--accent-primary)" />
        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Review</h1>
        <span style={{ background: 'var(--accent-orange)', color: '#fff', borderRadius: '10px', padding: '2px 8px', fontSize: '12px', fontWeight: '600' }}>
          {projectsToReview.length - currentIndex} remaining
        </span>
      </div>

      {/* Progress */}
      <div style={{ padding: '8px 16px', background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px' }}>
          <div
            style={{
              height: '100%',
              borderRadius: '2px',
              background: 'var(--accent-primary)',
              width: `${(currentIndex / projectsToReview.length) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px' }}>
          {currentIndex} / {projectsToReview.length} reviewed
        </div>
      </div>

      {/* Current review card */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {currentProject && (
          <ReviewCard
            projectId={currentProject.id}
            onReviewed={() => {
              if (currentIndex < projectsToReview.length - 1) {
                setCurrentIndex((i) => i + 1);
              } else {
                setCurrentIndex(projectsToReview.length);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
