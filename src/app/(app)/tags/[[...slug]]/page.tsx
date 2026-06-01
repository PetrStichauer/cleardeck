'use client';

import { useState } from 'react';
import { Tag as TagIcon, Plus, Trash2, Check } from 'lucide-react';
import { useTagsStore } from '@/store/tags.store';
import { useTasksByTag } from '@/hooks/useTasks';
import { TagChip } from '@/components/task/TagChip';
import { TaskList } from '@/components/task/TaskList';
import { EmptyState } from '@/components/common/EmptyState';
import { Tag } from '@/types';

const COLOR_SWATCHES = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
];

function TagRow({
  tag,
  selected,
  onSelect,
}: {
  tag: Tag;
  selected: boolean;
  onSelect: () => void;
}) {
  const { updateTag, deleteTag } = useTagsStore();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(tag.name);
  const [showColors, setShowColors] = useState(false);

  function commitRename() {
    if (editName.trim() && editName.trim() !== tag.name) {
      updateTag(tag.id, { name: editName.trim() });
    }
    setEditing(false);
  }

  function handleDelete() {
    if (window.confirm(`Delete tag "${tag.name}"?`)) {
      deleteTag(tag.id);
    }
  }

  function setColor(color: string | null) {
    updateTag(tag.id, { color });
    setShowColors(false);
  }

  return (
    <div
      style={{
        padding: '6px 8px',
        borderRadius: '6px',
        cursor: 'pointer',
        background: selected ? 'var(--accent-primary-light)' : 'transparent',
        marginBottom: '2px',
      }}
    >
      {editing ? (
        <input
          autoFocus
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') { setEditName(tag.name); setEditing(false); }
          }}
          style={{
            width: '100%',
            padding: '3px 6px',
            borderRadius: '4px',
            border: '1px solid var(--accent-primary)',
            background: 'var(--background)',
            color: 'var(--foreground)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={onSelect}>
            {/* Color dot */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowColors(!showColors); }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: tag.color ?? 'var(--border-color)',
                border: '1px solid rgba(0,0,0,0.15)',
                cursor: 'pointer',
                flexShrink: 0,
                padding: 0,
              }}
              title="Change color"
            />
            <span
              style={{ flex: 1, fontSize: '13px', color: selected ? 'var(--accent-primary)' : 'var(--foreground)' }}
              onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
            >
              {tag.name}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-text)', padding: '1px', display: 'flex', opacity: 0.6 }}
            >
              <Trash2 size={12} />
            </button>
          </div>

          {showColors && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px', paddingLeft: '18px' }}>
              {COLOR_SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={(e) => { e.stopPropagation(); setColor(c); }}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: c,
                    border: tag.color === c ? '2px solid var(--foreground)' : '2px solid transparent',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {tag.color === c && <Check size={10} color="#fff" />}
                </button>
              ))}
              {/* Clear color */}
              <button
                onClick={(e) => { e.stopPropagation(); setColor(null); }}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'var(--border-color)',
                  border: !tag.color ? '2px solid var(--foreground)' : '2px solid transparent',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '10px',
                  color: 'var(--muted-text)',
                }}
                title="No color"
              >
                ✕
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function TagTasksView({ tag }: { tag: Tag }) {
  const tasks = useTasksByTag(tag.id);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <TagChip tag={tag} />
        <span style={{ fontSize: '14px', color: 'var(--muted-text)' }}>{tasks.length} tasks</span>
      </div>
      <TaskList tasks={tasks} emptyMessage="No tasks with this tag" />
    </div>
  );
}

export default function TagsPage() {
  const { tags, addTag } = useTagsStore();
  const allTags = Object.values(tags).sort((a, b) => a.position - b.position);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(allTags[0]?.id || null);
  const [addingTag, setAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');

  const selectedTag = selectedTagId ? tags[selectedTagId] : null;

  const handleAddTag = () => {
    if (!newTagName.trim()) return;
    const tag = addTag({ name: newTagName.trim(), parent_id: null, color: null, position: Date.now() });
    setNewTagName('');
    setAddingTag(false);
    setSelectedTagId(tag.id);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Left: tag list */}
      <div style={{ width: '200px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--sidebar-bg)', flexShrink: 0 }}>
        <div style={{ padding: '12px 12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tags</span>
          <button onClick={() => setAddingTag(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)' }}>
            <Plus size={16} />
          </button>
        </div>

        {addingTag && (
          <div style={{ padding: '4px 8px' }}>
            <input
              autoFocus
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag();
                if (e.key === 'Escape') { setAddingTag(false); setNewTagName(''); }
              }}
              placeholder="Tag name…"
              style={{ width: '100%', padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--accent-primary)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' }}
            />
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          {allTags.map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              selected={selectedTagId === tag.id}
              onSelect={() => setSelectedTagId(tag.id)}
            />
          ))}
          {allTags.length === 0 && (
            <div style={{ padding: '16px', fontSize: '13px', color: 'var(--muted-text)', textAlign: 'center' }}>
              No tags yet
            </div>
          )}
        </div>
      </div>

      {/* Right: tasks for selected tag */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {selectedTag ? (
          <TagTasksView tag={selectedTag} />
        ) : (
          <EmptyState message="Select a tag to view tasks" icon={<TagIcon size={48} />} />
        )}
      </div>
    </div>
  );
}
