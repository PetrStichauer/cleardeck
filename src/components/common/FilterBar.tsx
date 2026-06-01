'use client';

import { Search, X, Flag, Calendar, AlertCircle } from 'lucide-react';
import { QuickFilters } from '@/lib/filters';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  quickFilters: QuickFilters;
  onQuickFilterChange: (filters: QuickFilters) => void;
}

export function FilterBar({ searchQuery, onSearchChange, quickFilters, onQuickFilterChange }: FilterBarProps) {
  function toggleQuick(key: keyof QuickFilters) {
    onQuickFilterChange({ ...quickFilters, [key]: !quickFilters[key] });
  }

  const pillStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '20px',
    border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-color)'}`,
    background: active ? 'var(--accent-primary-light)' : 'transparent',
    color: active ? 'var(--accent-primary)' : 'var(--muted-text)',
    fontSize: '12px',
    fontWeight: active ? '600' : '400',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      {/* Search input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flex: '1',
          minWidth: '160px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '5px 10px',
        }}
      >
        <Search size={13} color="var(--muted-text)" />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks…"
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: '13px',
            color: 'var(--foreground)',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', display: 'flex', color: 'var(--muted-text)' }}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Quick filter pills */}
      <button style={pillStyle(quickFilters.flaggedOnly)} onClick={() => toggleQuick('flaggedOnly')}>
        <Flag size={11} />
        Flagged
      </button>
      <button style={pillStyle(quickFilters.hasDueDate)} onClick={() => toggleQuick('hasDueDate')}>
        <Calendar size={11} />
        Has Due Date
      </button>
      <button style={pillStyle(quickFilters.overdueOnly)} onClick={() => toggleQuick('overdueOnly')}>
        <AlertCircle size={11} />
        Overdue
      </button>
    </div>
  );
}
