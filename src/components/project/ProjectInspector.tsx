'use client';

import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { useProjectsStore } from '@/store/projects.store';
import { useFoldersStore } from '@/store/folders.store';
import { useUIStore } from '@/store/ui.store';
import { DatePicker } from '@/components/common/DatePicker';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { Trash2, Flag } from 'lucide-react';

interface ProjectInspectorProps {
  project: Project;
}

export function ProjectInspector({ project }: ProjectInspectorProps) {
  const { updateProject, deleteProject, markReviewed } = useProjectsStore();
  const folders = useFoldersStore((s) => s.folders);
  const { setSelectedItem } = useUIStore();
  const [title, setTitle] = useState(project.title);

  useEffect(() => {
    setTitle(project.title);
  }, [project.id, project.title]);

  const allFolders = Object.values(folders);

  const handleDelete = () => {
    if (confirm('Delete this project?')) {
      deleteProject(project.id);
      setSelectedItem(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => {
          if (title.trim() && title !== project.title) {
            updateProject(project.id, { title: title.trim() });
          }
        }}
        style={{
          fontSize: '16px',
          fontWeight: '600',
          border: 'none',
          borderBottom: '2px solid var(--border-color)',
          outline: 'none',
          background: 'transparent',
          color: 'var(--foreground)',
          width: '100%',
          padding: '0 0 8px',
        }}
      />

      {/* Notes */}
      <div>
        <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--muted-text)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</label>
        <RichTextEditor
          value={project.notes}
          onChange={(html) => updateProject(project.id, { notes: html })}
        />
      </div>

      {/* Status & Type */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>Status</label>
          <select
            value={project.status}
            onChange={(e) => updateProject(project.id, { status: e.target.value as Project['status'] })}
            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px' }}
          >
            <option value="active">Active</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>Type</label>
          <select
            value={project.type}
            onChange={(e) => updateProject(project.id, { type: e.target.value as Project['type'] })}
            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px' }}
          >
            <option value="parallel">Parallel</option>
            <option value="sequential">Sequential</option>
            <option value="single_action">Single Action</option>
          </select>
        </div>
      </div>

      {/* Folder */}
      <div>
        <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>Folder</label>
        <select
          value={project.folder_id || ''}
          onChange={(e) => updateProject(project.id, { folder_id: e.target.value || null })}
          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px' }}
        >
          <option value="">No folder</option>
          {allFolders.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
        {allFolders.length === 0 && (
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--muted-text)' }}>
            Create folders in Projects → folder icon
          </p>
        )}
      </div>

      {/* Dates */}
      <DatePicker label="Defer Date" value={project.defer_date} onChange={(d) => updateProject(project.id, { defer_date: d })} />
      <DatePicker label="Due Date" value={project.due_date} onChange={(d) => updateProject(project.id, { due_date: d })} />

      {/* Review */}
      <div>
        <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--muted-text)', display: 'block', marginBottom: '4px' }}>Review Interval (weeks)</label>
        <input
          type="number"
          min="1"
          value={project.review_interval_weeks}
          onChange={(e) => updateProject(project.id, { review_interval_weeks: parseInt(e.target.value) || 1 })}
          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px' }}
        />
        <button
          onClick={() => markReviewed(project.id)}
          style={{ marginTop: '8px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--muted-text)', fontSize: '13px', cursor: 'pointer' }}
        >
          Mark as Reviewed
        </button>
      </div>

      {/* Flag */}
      <button
        onClick={() => updateProject(project.id, { flagged: !project.flagged })}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: project.flagged ? '#ff950022' : 'transparent', color: project.flagged ? 'var(--accent-orange)' : 'var(--muted-text)', fontSize: '13px', cursor: 'pointer' }}
      >
        <Flag size={13} fill={project.flagged ? 'var(--accent-orange)' : 'none'} />
        {project.flagged ? 'Flagged' : 'Flag'}
      </button>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

      {/* Delete */}
      <button
        onClick={handleDelete}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--accent-red)', background: 'transparent', color: 'var(--accent-red)', fontSize: '13px', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
      >
        <Trash2 size={14} /> Delete Project
      </button>
    </div>
  );
}
