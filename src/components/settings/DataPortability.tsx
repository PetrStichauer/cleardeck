'use client';

import { useRef, useState } from 'react';
import { X, Download, Upload } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';
import { useTasksStore } from '@/store/tasks.store';
import { useProjectsStore } from '@/store/projects.store';
import { useTagsStore } from '@/store/tags.store';
import { useFoldersStore } from '@/store/folders.store';
import { usePerspectivesStore } from '@/store/perspectives.store';
import {
  buildExportPayload,
  parseImportPayload,
  importData,
  reloadAllStores,
} from '@/lib/data-portability';

export function DataPortability() {
  const { dataPortabilityOpen, setDataPortabilityOpen } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingModeRef = useRef<'merge' | 'replace'>('merge');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!dataPortabilityOpen) return null;

  function handleExport() {
    const payload = buildExportPayload(
      useTasksStore.getState().tasks,
      useProjectsStore.getState().projects,
      useTagsStore.getState().tags,
      useFoldersStore.getState().folders,
      usePerspectivesStore.getState().perspectives,
    );

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleardeck-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Export downloaded successfully.');
  }

  function handleImportClick(mode: 'merge' | 'replace') {
    if (mode === 'replace') {
      const confirmed = confirm(
        'Replace all data? This will delete your current tasks, projects, tags, folders, and perspectives.'
      );
      if (!confirmed) return;
    }
    pendingModeRef.current = mode;
    fileInputRef.current?.click();
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const text = await file.text();
      const data = parseImportPayload(JSON.parse(text));
      await importData(data, pendingModeRef.current);
      await reloadAllStores();
      setMessage(`Import complete (${pendingModeRef.current} mode).`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => setDataPortabilityOpen(false)}
    >
      <div
        style={{
          width: 'min(440px, calc(100vw - 32px))',
          background: 'var(--sidebar-bg)',
          borderRadius: '16px',
          border: '1px solid var(--sidebar-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--sidebar-border)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Data Export / Import</h2>
          <button
            onClick={() => setDataPortabilityOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-text)',
              padding: '4px',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--muted-text)', margin: '0 0 20px', lineHeight: 1.5 }}>
            Export all your tasks, projects, tags, folders, and perspectives as JSON.
            Import to restore or migrate between instances.
          </p>

          <button
            onClick={handleExport}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '11px',
              borderRadius: '8px',
              border: '1px solid var(--sidebar-border)',
              background: 'var(--background)',
              color: 'var(--foreground)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              marginBottom: '12px',
            }}
          >
            <Download size={16} />
            Export JSON
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleImportClick('merge')}
              disabled={importing}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: importing ? 'not-allowed' : 'pointer',
                opacity: importing ? 0.6 : 1,
              }}
            >
              <Upload size={16} />
              Import (Merge)
            </button>
            <button
              onClick={() => handleImportClick('replace')}
              disabled={importing}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '11px',
                borderRadius: '8px',
                border: '1px solid var(--accent-red, #dc2626)',
                background: 'transparent',
                color: 'var(--accent-red, #dc2626)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: importing ? 'not-allowed' : 'pointer',
                opacity: importing ? 0.6 : 1,
              }}
            >
              <Upload size={16} />
              Import (Replace)
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileSelected}
          />

          {message && (
            <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--muted-text)' }}>{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
