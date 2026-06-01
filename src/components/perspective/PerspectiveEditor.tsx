'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { CustomPerspective, FilterRule, FilterField, FilterCondition, FilterOperator, GroupBy, SortBy } from '@/types';
import { usePerspectivesStore } from '@/store/perspectives.store';
import { useTagsStore } from '@/store/tags.store';
import { useProjectsStore } from '@/store/projects.store';

const EMOJI_OPTIONS = ['📋', '⭐', '🔥', '💡', '🎯', '🚀', '📌', '✅', '🗂️', '📅', '🏷️', '🔔', '📝', '💼', '🔍', '🎉', '⚡', '🌟', '🧩', '🎨'];

const FIELD_OPTIONS: { value: FilterField; label: string }[] = [
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'project_id', label: 'Project' },
  { value: 'tag_ids', label: 'Tags' },
  { value: 'due_date', label: 'Due Date' },
  { value: 'defer_date', label: 'Defer Date' },
  { value: 'planned_date', label: 'Planned Date' },
];

function conditionsForField(field: FilterField): { value: FilterCondition; label: string }[] {
  switch (field) {
    case 'title':
      return [{ value: 'contains', label: 'contains' }];
    case 'flagged':
      return [
        { value: 'equals', label: 'is' },
        { value: 'not_equals', label: 'is not' },
      ];
    case 'status':
      return [
        { value: 'equals', label: 'is' },
        { value: 'not_equals', label: 'is not' },
      ];
    case 'project_id':
      return [
        { value: 'is_set', label: 'has a project' },
        { value: 'is_not_set', label: 'has no project' },
        { value: 'equals', label: 'is' },
        { value: 'not_equals', label: 'is not' },
      ];
    case 'tag_ids':
      return [
        { value: 'is_set', label: 'has tags' },
        { value: 'is_not_set', label: 'has no tags' },
        { value: 'contains', label: 'includes tag' },
      ];
    case 'due_date':
    case 'defer_date':
    case 'planned_date':
      return [
        { value: 'is_set', label: 'is set' },
        { value: 'is_not_set', label: 'is not set' },
        { value: 'before', label: 'before' },
        { value: 'after', label: 'after' },
      ];
    default:
      return [{ value: 'equals', label: 'equals' }];
  }
}

const selectStyle: React.CSSProperties = {
  padding: '5px 8px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  background: 'var(--card-bg)',
  color: 'var(--foreground)',
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer',
};

interface RuleValueInputProps {
  rule: FilterRule;
  onChangeString: (v: string) => void;
  onChangeBool: (v: boolean) => void;
  onChangeTagIds: (ids: string[]) => void;
}

function RuleValueInput({ rule, onChangeString, onChangeBool, onChangeTagIds }: RuleValueInputProps) {
  const tags = useTagsStore((s) => s.tags);
  const projects = useProjectsStore((s) => s.projects);

  const noValue: FilterCondition[] = ['is_set', 'is_not_set'];
  if (noValue.includes(rule.condition)) return null;

  if (rule.field === 'flagged') {
    return (
      <select
        value={String(rule.value ?? 'true')}
        onChange={(e) => onChangeBool(e.target.value === 'true')}
        style={selectStyle}
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  if (rule.field === 'status') {
    return (
      <select
        value={String(rule.value ?? 'active')}
        onChange={(e) => onChangeString(e.target.value)}
        style={selectStyle}
      >
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="dropped">Dropped</option>
      </select>
    );
  }

  if (rule.field === 'project_id' && (rule.condition === 'equals' || rule.condition === 'not_equals')) {
    const activeProjects = Object.values(projects).filter((p) => p.status === 'active' || p.status === 'on_hold');
    return (
      <select
        value={String(rule.value ?? '')}
        onChange={(e) => onChangeString(e.target.value)}
        style={{ ...selectStyle, maxWidth: '200px' }}
      >
        <option value="">— select project —</option>
        {activeProjects.map((p) => (
          <option key={p.id} value={p.id}>{p.title}</option>
        ))}
      </select>
    );
  }

  if (rule.field === 'tag_ids' && rule.condition === 'contains') {
    const allTags = Object.values(tags);
    const selectedIds: string[] = Array.isArray(rule.value) ? (rule.value as string[]) : (rule.value ? [rule.value as string] : []);
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
        {allTags.map((tag) => {
          const checked = selectedIds.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => {
                const next = checked
                  ? selectedIds.filter((id) => id !== tag.id)
                  : [...selectedIds, tag.id];
                onChangeTagIds(next);
              }}
              style={{
                padding: '3px 8px',
                borderRadius: '12px',
                border: `1px solid ${checked ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                background: checked ? 'var(--accent-primary-light)' : 'transparent',
                color: checked ? 'var(--accent-primary)' : 'var(--foreground)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {tag.color && (
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: tag.color, flexShrink: 0 }} />
              )}
              {tag.name}
            </button>
          );
        })}
        {allTags.length === 0 && (
          <span style={{ fontSize: '12px', color: 'var(--muted-text)' }}>No tags yet</span>
        )}
      </div>
    );
  }

  if (rule.field === 'due_date' || rule.field === 'defer_date' || rule.field === 'planned_date') {
    return (
      <input
        type="date"
        value={String(rule.value ?? '')}
        onChange={(e) => onChangeString(e.target.value)}
        style={{ ...selectStyle, colorScheme: 'dark light' }}
      />
    );
  }

  return (
    <input
      type="text"
      value={String(rule.value ?? '')}
      onChange={(e) => onChangeString(e.target.value)}
      placeholder="value…"
      style={selectStyle}
    />
  );
}

interface PerspectiveEditorProps {
  perspective?: CustomPerspective;
  open: boolean;
  onClose: () => void;
}

export function PerspectiveEditor({ perspective, open, onClose }: PerspectiveEditorProps) {
  const { addPerspective, updatePerspective } = usePerspectivesStore();

  const [name, setName] = useState(perspective?.name ?? '');
  const [icon, setIcon] = useState(perspective?.icon ?? '📋');
  const [operator, setOperator] = useState<FilterOperator>(perspective?.filter_operator ?? 'and');
  const [rules, setRules] = useState<FilterRule[]>(perspective?.filter_rules ?? []);
  const [groupBy, setGroupBy] = useState<GroupBy>(perspective?.group_by ?? 'none');
  const [sortBy, setSortBy] = useState<SortBy>(perspective?.sort_by ?? 'position');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(perspective?.sort_direction ?? 'asc');
  const [showCompleted, setShowCompleted] = useState(perspective?.show_completed ?? false);

  if (!open) return null;

  function addRule() {
    setRules((prev) => [...prev, { field: 'title', condition: 'contains', value: '' }]);
  }

  function updateRule(index: number, patch: Partial<FilterRule>) {
    setRules((prev) => prev.map((r, i) => {
      if (i !== index) return r;
      const updated = { ...r, ...patch };
      if (patch.field) {
        updated.condition = conditionsForField(patch.field)[0].value;
        updated.value = undefined;
      }
      return updated;
    }));
  }

  function removeRule(index: number) {
    setRules((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!name.trim()) return;
    const data = {
      name: name.trim(),
      icon,
      filter_operator: operator,
      filter_rules: rules,
      group_by: groupBy,
      sort_by: sortBy,
      sort_direction: sortDir,
      show_completed: showCompleted,
      position: perspective?.position ?? Date.now(),
    };
    if (perspective) {
      updatePerspective(perspective.id, data);
    } else {
      addPerspective(data);
    }
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          borderRadius: '14px',
          width: '580px',
          maxWidth: '95vw',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 12px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>
            {perspective ? 'Edit Perspective' : 'New Perspective'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-text)', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Perspective name…"
              style={{ ...selectStyle, width: '100%', padding: '7px 10px' }}
            />
          </div>

          {/* Icon picker */}
          <div>
            <label style={labelStyle}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => setIcon(e)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    border: icon === e ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    background: icon === e ? 'var(--accent-primary-light)' : 'var(--card-bg)',
                    cursor: 'pointer',
                    fontSize: '18px',
                    lineHeight: 1,
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* AND/OR operator */}
          <div>
            <label style={labelStyle}>Match</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['and', 'or'] as FilterOperator[]).map((op) => (
                <button
                  key={op}
                  onClick={() => setOperator(op)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: operator === op ? 'var(--accent-primary)' : 'transparent',
                    color: operator === op ? '#fff' : 'var(--foreground)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  {op === 'and' ? 'All rules (AND)' : 'Any rule (OR)'}
                </button>
              ))}
            </div>
          </div>

          {/* Filter rules */}
          <div>
            <label style={labelStyle}>Filter Rules</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rules.map((rule, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', flexWrap: 'wrap', padding: '8px', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <select
                    value={rule.field}
                    onChange={(e) => updateRule(i, { field: e.target.value as FilterField })}
                    style={selectStyle}
                  >
                    {FIELD_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <select
                    value={rule.condition}
                    onChange={(e) => updateRule(i, { condition: e.target.value as FilterCondition })}
                    style={selectStyle}
                  >
                    {conditionsForField(rule.field).map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  <div style={{ flex: 1 }}>
                    <RuleValueInput
                      rule={rule}
                      onChangeString={(v) => updateRule(i, { value: v })}
                      onChangeBool={(v) => updateRule(i, { value: v as unknown as string })}
                      onChangeTagIds={(ids) => updateRule(i, { value: ids as unknown as string[] })}
                    />
                  </div>
                  <button
                    onClick={() => removeRule(i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '4px', display: 'flex', flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addRule}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px dashed var(--border-color)',
                  background: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  alignSelf: 'flex-start',
                }}
              >
                <Plus size={12} />
                Add Rule
              </button>
            </div>
          </div>

          {/* Group by + Sort by */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <label style={labelStyle}>Group by</label>
              <select value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)} style={selectStyle}>
                <option value="none">None</option>
                <option value="project">Project</option>
                <option value="tag">Tag</option>
                <option value="due_date">Due Date</option>
                <option value="defer_date">Defer Date</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sort by</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortBy)} style={selectStyle}>
                <option value="position">Position</option>
                <option value="title">Title</option>
                <option value="due_date">Due Date</option>
                <option value="defer_date">Defer Date</option>
                <option value="created_at">Created</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Direction</label>
              <select value={sortDir} onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')} style={selectStyle}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          {/* Show completed */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              style={{ width: '14px', height: '14px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            Show completed tasks
          </label>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 20px', borderTop: '1px solid var(--border-color)' }}>
          <button
            onClick={onClose}
            style={{ ...selectStyle, padding: '7px 16px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              padding: '7px 18px',
              borderRadius: '6px',
              border: 'none',
              background: name.trim() ? 'var(--gradient-primary)' : 'var(--border-color)',
              color: name.trim() ? '#fff' : 'var(--muted-text)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            {perspective ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: '600',
  color: 'var(--muted-text)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '6px',
};
