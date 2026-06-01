'use client';

import { useState, useEffect, useRef } from 'react';
import { useUIStore } from '@/store/ui.store';
import { useTasksStore } from '@/store/tasks.store';
import { useProjectsStore } from '@/store/projects.store';
import { useTagsStore } from '@/store/tags.store';
import { Tag } from '@/types';
import type { ReactNode } from 'react';
import {
  FolderKanban,
  Tag as TagIcon,
  Calendar,
  RotateCcw,
  Flag,
  X,
  Eye,
} from 'lucide-react';

export function QuickEntry() {
  const { quickEntryOpen, setQuickEntryOpen } = useUIStore();
  const addTask = useTasksStore((s) => s.addTask);
  const projects = useProjectsStore((s) => s.projects);
  const { tags, addTag: storeAddTag } = useTagsStore();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [projectId, setProjectId] = useState('');
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [flagged, setFlagged] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<'project' | 'tags' | 'due' | 'repeat' | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quickEntryOpen) {
      setTitle('');
      setNotes('');
      setProjectId('');
      setTagIds([]);
      setDueDate('');
      setFlagged(false);
      setNotesExpanded(false);
      setActiveSection(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [quickEntryOpen]);

  if (!quickEntryOpen) return null;

  const activeProjects = Object.values(projects)
    .filter((p) => p.status === 'active')
    .sort((a, b) => a.position - b.position);
  const allTags = Object.values(tags).sort((a, b) => a.position - b.position);
  const selectedTags = tagIds.map((id) => tags[id]).filter(Boolean) as Tag[];
  const selectedProject = projectId ? projects[projectId] : null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      notes: notes ? `<p>${notes}</p>` : '',
      status: 'active',
      flagged,
      defer_date: null,
      due_date: dueDate || null,
      planned_date: null,
      estimated_duration: null,
      project_id: projectId || null,
      tag_ids: tagIds,
      repeat: null,
      parent_id: null,
      position: Date.now(),
      completed_at: null,
      dropped_at: null,
    });
    setQuickEntryOpen(false);
  };

  const toggleSection = (section: 'project' | 'tags' | 'due' | 'repeat') => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  const removeTag = (id: string) => {
    setTagIds((prev) => prev.filter((t) => t !== id));
  };

  const addTagById = (id: string) => {
    if (id && !tagIds.includes(id)) {
      setTagIds((prev) => [...prev, id]);
    }
    setTagInput('');
    setTagDropdownOpen(false);
  };

  const createAndAddTag = () => {
    const name = tagInput.trim();
    if (!name) return;
    const existing = allTags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      addTagById(existing.id);
    } else {
      const newTag = storeAddTag({ name, parent_id: null, color: null, position: Date.now() });
      setTagIds((prev) => [...prev, newTag.id]);
      setTagInput('');
      setTagDropdownOpen(false);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      createAndAddTag();
    }
    if (e.key === 'Escape') {
      setTagInput('');
      setTagDropdownOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setQuickEntryOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 100,
          backdropFilter: 'blur(3px)',
        }}
      />

      {/* Modal */}
      <div
        className="quick-entry-modal"
        style={{
          position: 'fixed',
          top: '28%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '560px',
          background: 'var(--card-bg)',
          borderRadius: '14px',
          boxShadow: '0 24px 70px rgba(0,0,0,0.4), 0 -3px 0 var(--accent-primary) inset',
          zIndex: 101,
          overflow: 'hidden',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setQuickEntryOpen(false);
        }}
      >
        {/* Title row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px 12px',
          }}
        >
          {/* Circle (visual only) */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              border: '2px solid var(--border-color)',
              flexShrink: 0,
            }}
          />

          {/* Title input */}
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New task…"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) handleSubmit();
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '17px',
              color: 'var(--foreground)',
              fontWeight: '400',
            }}
          />

          {/* Notes toggle */}
          <button
            type="button"
            onClick={() => setNotesExpanded((v) => !v)}
            title="Toggle notes"
            style={{
              background: notesExpanded ? 'var(--accent-primary-light)' : 'none',
              border: 'none',
              cursor: 'pointer',
              color: notesExpanded ? 'var(--accent-primary)' : 'var(--muted-text)',
              padding: '4px',
              borderRadius: '5px',
              display: 'flex',
            }}
          >
            <Eye size={15} />
          </button>

          {/* Flag toggle */}
          <button
            type="button"
            onClick={() => setFlagged((v) => !v)}
            title="Flag"
            style={{
              background: flagged ? 'rgba(255,149,0,0.12)' : 'none',
              border: 'none',
              cursor: 'pointer',
              color: flagged ? 'var(--accent-orange)' : 'var(--muted-text)',
              padding: '4px',
              borderRadius: '5px',
              display: 'flex',
            }}
          >
            <Flag size={15} fill={flagged ? 'var(--accent-orange)' : 'none'} />
          </button>
        </div>

        {/* Notes area */}
        {notesExpanded && (
          <div style={{ padding: '0 20px 10px', paddingLeft: 52 }}>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add Note"
              rows={3}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '14px',
                color: 'var(--foreground)',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5',
              }}
            />
          </div>
        )}

        {/* Toolbar row */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            padding: '4px 20px 10px',
            paddingLeft: 52,
          }}
        >
          {/* Project button */}
          <ToolbarButton
            icon={<FolderKanban size={13} />}
            label={selectedProject ? selectedProject.title : 'Project'}
            active={!!selectedProject || activeSection === 'project'}
            onClick={() => toggleSection('project')}
          />

          {/* Tags button */}
          <ToolbarButton
            icon={<TagIcon size={13} />}
            label={selectedTags.length > 0 ? selectedTags.map((t) => t.name).join(', ') : 'Tags'}
            active={selectedTags.length > 0 || activeSection === 'tags'}
            onClick={() => toggleSection('tags')}
          />

          {/* Due button */}
          <ToolbarButton
            icon={<Calendar size={13} />}
            label={dueDate ? formatDateShort(dueDate) : 'Due'}
            active={!!dueDate || activeSection === 'due'}
            onClick={() => toggleSection('due')}
          />

          {/* Repeat button */}
          <ToolbarButton
            icon={<RotateCcw size={13} />}
            label="Repeat"
            active={activeSection === 'repeat'}
            onClick={() => toggleSection('repeat')}
          />
        </div>

        {/* Expanded sections */}
        {activeSection === 'project' && (
          <ExpandedSection>
            <select
              autoFocus
              value={projectId}
              onChange={(e) => { setProjectId(e.target.value); setActiveSection(null); }}
              style={selectStyle}
            >
              <option value="">Inbox (no project)</option>
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </ExpandedSection>
        )}

        {activeSection === 'tags' && (
          <ExpandedSection>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: selectedTags.length ? '8px' : 0 }}>
              {selectedTags.map((tag) => (
                <span
                  key={tag.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: tag.color || 'var(--accent-blue)',
                    color: '#fff',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => removeTag(tag.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 0, display: 'flex', opacity: 0.8 }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            {/* Tag combobox with inline creation */}
            <div style={{ position: 'relative' }}>
              <input
                autoFocus
                value={tagInput}
                onChange={(e) => { setTagInput(e.target.value); setTagDropdownOpen(true); }}
                onFocus={() => setTagDropdownOpen(true)}
                onBlur={() => setTimeout(() => setTagDropdownOpen(false), 150)}
                onKeyDown={handleTagKeyDown}
                placeholder="Search or create tag…"
                style={{ ...selectStyle }}
              />
              {tagDropdownOpen && (() => {
                const suggestions = allTags.filter(
                  (t) => !tagIds.includes(t.id) &&
                    (tagInput.trim() === '' || t.name.toLowerCase().includes(tagInput.toLowerCase()))
                );
                const canCreate = tagInput.trim() !== '' &&
                  !allTags.some((t) => t.name.toLowerCase() === tagInput.trim().toLowerCase());
                if (!suggestions.length && !canCreate) return null;
                return (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                    borderRadius: '6px', boxShadow: 'var(--shadow-md)', zIndex: 200,
                    maxHeight: '160px', overflowY: 'auto', marginTop: '2px',
                  }}>
                    {suggestions.map((tag) => (
                      <div key={tag.id} onMouseDown={() => addTagById(tag.id)}
                        style={{ padding: '7px 12px', cursor: 'pointer', fontSize: '13px',
                          display: 'flex', alignItems: 'center', gap: '8px' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--accent-primary-light)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        {tag.color && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tag.color, flexShrink: 0 }} />}
                        {tag.name}
                      </div>
                    ))}
                    {canCreate && (
                      <div onMouseDown={createAndAddTag}
                        style={{ padding: '7px 12px', cursor: 'pointer', fontSize: '13px',
                          color: 'var(--accent-primary)',
                          borderTop: suggestions.length > 0 ? '1px solid var(--border-color)' : 'none' }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--accent-primary-light)')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        + Create &quot;{tagInput.trim()}&quot;
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </ExpandedSection>
        )}

        {activeSection === 'due' && (
          <ExpandedSection>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="date"
                autoFocus
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ ...selectStyle, flex: 1 }}
              />
              {dueDate && (
                <button
                  type="button"
                  onClick={() => { setDueDate(''); setActiveSection(null); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-text)', display: 'flex' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </ExpandedSection>
        )}

        {activeSection === 'repeat' && (
          <ExpandedSection>
            <span style={{ fontSize: '13px', color: 'var(--muted-text)' }}>
              Repeat settings available in full inspector after saving.
            </span>
          </ExpandedSection>
        )}

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
            padding: '10px 20px 14px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setQuickEntryOpen(false)}
            style={{
              padding: '7px 18px',
              borderRadius: '7px',
              border: '1px solid var(--border-color)',
              background: 'var(--sidebar-border)',
              color: 'var(--foreground)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            style={{
              padding: '7px 18px',
              borderRadius: '7px',
              border: 'none',
              background: title.trim() ? 'var(--gradient-primary)' : 'var(--border-color)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: title.trim() ? 'pointer' : 'default',
              transition: 'background 0.1s',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}

function ToolbarButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        borderRadius: '6px',
        border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-color)'}`,
        background: active ? 'var(--accent-primary-light)' : 'transparent',
        color: active ? 'var(--accent-primary)' : 'var(--muted-text)',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.1s',
        maxWidth: '140px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </button>
  );
}

function ExpandedSection({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: '8px 20px 12px',
        paddingLeft: 52,
        borderTop: '1px solid var(--border-color)',
        background: 'var(--background)',
      }}
    >
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 10px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  background: 'var(--card-bg)',
  color: 'var(--foreground)',
  fontSize: '13px',
  outline: 'none',
};

function formatDateShort(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
