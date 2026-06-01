'use client';

import { useState, useEffect, useRef } from 'react';
import { Task } from '@/types';
import { useTasksStore } from '@/store/tasks.store';
import { useProjectsStore } from '@/store/projects.store';
import { useTagsStore } from '@/store/tags.store';
import { RichTextEditor } from '@/components/common/RichTextEditor';
import { DatePicker } from '@/components/common/DatePicker';
import { TagChip } from './TagChip';
import { Flag, Trash2, RotateCcw } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

interface TaskInspectorProps {
  task: Task;
}

export function TaskInspector({ task }: TaskInspectorProps) {
  const { updateTask, deleteTask, completeTask, dropTask, reactivateTask } = useTasksStore();
  const projects = useProjectsStore((s) => s.projects);
  const { tags, addTag } = useTagsStore();
  const { setSelectedItem } = useUIStore();
  const [title, setTitle] = useState(task.title);
  const [tagInput, setTagInput] = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Sync title when task changes
  useEffect(() => {
    setTitle(task.title);
  }, [task.id, task.title]);

  const activeProjects = Object.values(projects).filter((p) => p.status === 'active');
  const allTags = Object.values(tags);
  const taskTags = task.tag_ids.map((id) => tags[id]).filter(Boolean);

  const tagSuggestions = allTags.filter(
    (t) =>
      !task.tag_ids.includes(t.id) &&
      (tagInput.trim() === '' || t.name.toLowerCase().includes(tagInput.toLowerCase()))
  );
  const canCreate =
    tagInput.trim() !== '' &&
    !allTags.some((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase());

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    }
  };

  const handleDelete = () => {
    if (confirm('Delete this task?')) {
      deleteTask(task.id);
      setSelectedItem(null);
    }
  };

  const addTagToTask = (tagId: string) => {
    if (!task.tag_ids.includes(tagId)) {
      updateTask(task.id, { tag_ids: [...task.tag_ids, tagId] });
    }
    setTagInput('');
    setTagDropdownOpen(false);
  };

  const createAndAddTag = () => {
    const name = tagInput.trim();
    if (!name) return;
    const newTag = addTag({ name, parent_id: null, color: null, position: Date.now() });
    updateTask(task.id, { tag_ids: [...task.tag_ids, newTag.id] });
    setTagInput('');
    setTagDropdownOpen(false);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const exact = allTags.find((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase());
      if (exact) {
        addTagToTask(exact.id);
      } else if (tagInput.trim()) {
        createAndAddTag();
      }
    }
    if (e.key === 'Escape') {
      setTagInput('');
      setTagDropdownOpen(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleTitleBlur}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
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
        placeholder="Task title"
      />

      {/* Notes */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: 'var(--muted-text)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Notes
        </label>
        <RichTextEditor
          value={task.notes}
          onChange={(html) => updateTask(task.id, { notes: html })}
          placeholder="Add notes…"
        />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => updateTask(task.id, { flagged: !task.flagged })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: task.flagged ? '#ff950022' : 'transparent',
            color: task.flagged ? 'var(--accent-orange)' : 'var(--muted-text)',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          <Flag size={13} fill={task.flagged ? 'var(--accent-orange)' : 'none'} />
          {task.flagged ? 'Flagged' : 'Flag'}
        </button>

        {task.status === 'active' && (
          <>
            <button
              onClick={() => completeTask(task.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--accent-primary)',
                background: 'transparent',
                color: 'var(--accent-primary)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Complete
            </button>
            <button
              onClick={() => dropTask(task.id)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'transparent',
                color: 'var(--muted-text)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Drop
            </button>
          </>
        )}
        {(task.status === 'completed' || task.status === 'dropped') && (
          <button
            onClick={() => reactivateTask(task.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'var(--muted-text)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} />
            Reactivate
          </button>
        )}
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

      {/* Project */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: 'var(--muted-text)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Project
        </label>
        <select
          value={task.project_id || ''}
          onChange={(e) => updateTask(task.id, { project_id: e.target.value || null })}
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--background)',
            color: 'var(--foreground)',
            fontSize: '13px',
          }}
        >
          <option value="">Inbox</option>
          {activeProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: 'var(--muted-text)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Tags
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {taskTags.map((tag) => (
            <TagChip
              key={tag.id}
              tag={tag}
              onRemove={() =>
                updateTask(task.id, { tag_ids: task.tag_ids.filter((id) => id !== tag.id) })
              }
            />
          ))}
        </div>

        {/* Tag combobox */}
        <div style={{ position: 'relative' }}>
          <input
            ref={tagInputRef}
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setTagDropdownOpen(true);
            }}
            onFocus={() => setTagDropdownOpen(true)}
            onBlur={() => setTimeout(() => setTagDropdownOpen(false), 150)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tag… (type to search or create)"
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          {tagDropdownOpen && (tagSuggestions.length > 0 || canCreate) && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                boxShadow: 'var(--shadow-md)',
                zIndex: 50,
                maxHeight: '180px',
                overflowY: 'auto',
                marginTop: '2px',
              }}
            >
              {tagSuggestions.map((tag) => (
                <div
                  key={tag.id}
                  onMouseDown={() => addTagToTask(tag.id)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'var(--accent-primary-light)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'transparent')
                  }
                >
                  {tag.color && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: tag.color,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {tag.name}
                </div>
              ))}
              {canCreate && (
                <div
                  onMouseDown={createAndAddTag}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'var(--accent-primary)',
                    borderTop: tagSuggestions.length > 0 ? '1px solid var(--border-color)' : 'none',
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'var(--accent-primary-light)')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = 'transparent')
                  }
                >
                  + Create &quot;{tagInput.trim()}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <DatePicker
          label="Defer Date"
          value={task.defer_date}
          onChange={(date) => updateTask(task.id, { defer_date: date })}
        />
        <DatePicker
          label="Due Date"
          value={task.due_date}
          onChange={(date) => updateTask(task.id, { due_date: date })}
        />
        <DatePicker
          label="Planned Date"
          value={task.planned_date}
          onChange={(date) => updateTask(task.id, { planned_date: date })}
        />
      </div>

      {/* Duration */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '500',
            color: 'var(--muted-text)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Estimated Duration (min)
        </label>
        <input
          type="number"
          min="0"
          value={task.estimated_duration ?? ''}
          onChange={(e) =>
            updateTask(task.id, {
              estimated_duration: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          placeholder="e.g. 30"
          style={{
            width: '100%',
            padding: '7px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--background)',
            color: 'var(--foreground)',
            fontSize: '13px',
          }}
        />
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

      {/* Delete */}
      <button
        onClick={handleDelete}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid var(--accent-red)',
          background: 'transparent',
          color: 'var(--accent-red)',
          fontSize: '13px',
          cursor: 'pointer',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <Trash2 size={14} />
        Delete Task
      </button>

      {/* Metadata */}
      <div style={{ fontSize: '11px', color: 'var(--muted-text)' }}>
        Created: {new Date(task.created_at).toLocaleDateString()}
        {task.completed_at && (
          <div>Completed: {new Date(task.completed_at).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
}
