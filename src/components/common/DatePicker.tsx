'use client';

import { format, parseISO } from 'date-fns';

interface DatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  label?: string;
  placeholder?: string;
}

export function DatePicker({ value, onChange, label, placeholder = 'None' }: DatePickerProps) {
  const inputValue = value ? format(parseISO(value), 'yyyy-MM-dd') : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label style={{ fontSize: '11px', fontWeight: '500', color: 'var(--muted-text)' }}>
          {label}
        </label>
      )}
      <input
        type="date"
        value={inputValue}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? `${val}T00:00:00.000Z` : null);
        }}
        placeholder={placeholder}
        style={{
          padding: '6px 10px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          background: 'var(--background)',
          color: value ? 'var(--foreground)' : 'var(--muted-text)',
          fontSize: '13px',
          width: '100%',
          cursor: 'pointer',
        }}
      />
    </div>
  );
}
