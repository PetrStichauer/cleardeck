'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { CustomPerspective } from '@/types';
import {
  Inbox,
  FolderKanban,
  Tag,
  CalendarDays,
  Flag,
  RotateCcw,
  CheckSquare,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Plus,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Trash2,
  Download,
  Keyboard,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { usePerspectivesStore } from '@/store/perspectives.store';
import { useUIStore } from '@/store/ui.store';
import { useInboxTasks } from '@/hooks/useTasks';
import { useProjectsNeedingReview } from '@/hooks/useProjects';
import { supabaseClient } from '@/lib/supabase/client';
import { PerspectiveEditor } from '@/components/perspective/PerspectiveEditor';
import { requestNotificationPermission } from '@/lib/notifications';

const builtinItems = [
  { label: 'Inbox', href: '/inbox', icon: Inbox },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tags', href: '/tags', icon: Tag },
  { label: 'Forecast', href: '/forecast', icon: CalendarDays },
  { label: 'Flagged', href: '/flagged', icon: Flag },
  { label: 'Review', href: '/review', icon: RotateCcw },
  { label: 'Completed', href: '/completed', icon: CheckSquare },
];

interface SidebarProps {
  onNavigate?: () => void;
}

interface PerspectiveItemProps {
  perspective: CustomPerspective;
  isActive: boolean;
  onNavigate?: () => void;
  onDelete: (id: string) => void;
}

function PerspectiveItem({ perspective, isActive, onNavigate, onDelete }: PerspectiveItemProps) {
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete perspective "${perspective.name}"?`)) {
      onDelete(perspective.id);
    }
  };

  return (
    <Link
      href={`/perspectives/${perspective.id}`}
      style={{ textDecoration: 'none' }}
      onClick={onNavigate}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div
        className={`sidebar-nav-item${isActive ? ' active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '9px 12px',
          borderRadius: '8px',
          marginBottom: '2px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: isActive ? '600' : '400',
          color: isActive ? '#ffffff' : 'var(--sidebar-text)',
        }}
      >
        <span style={{ fontSize: '15px' }}>{perspective.icon || '●'}</span>
        <span style={{ flex: 1 }}>{perspective.name}</span>
        {showDelete && (
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--accent-red, #dc2626)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.7,
            }}
            title="Delete perspective"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </Link>
  );
}

export function Sidebar({ onNavigate }: SidebarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const { showDeferred, setShowDeferred, notificationsEnabled, setNotificationsEnabled, setDataPortabilityOpen, setShortcutsOpen } = useUIStore();

  async function handleSignOut() {
    await supabaseClient().auth.signOut();
    window.location.href = '/login';
  }

  async function handleToggleNotifications() {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
    } else {
      const granted = await requestNotificationPermission();
      if (granted) setNotificationsEnabled(true);
    }
  }

  const perspectives = usePerspectivesStore((s) => s.perspectives);
  const deletePerspective = usePerspectivesStore((s) => s.deletePerspective);
  const inboxTasks = useInboxTasks();
  const reviewProjects = useProjectsNeedingReview();

  const customPerspectives = Object.values(perspectives).sort(
    (a, b) => a.position - b.position
  );

  const footerBtnStyle = (active?: boolean): React.CSSProperties => ({
    background: active ? 'var(--gradient-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--muted-text)',
    border: 'none',
    borderRadius: '7px',
    padding: '7px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease, color 0.15s ease',
    boxShadow: active ? '0 1px 4px rgba(124,58,237,0.35)' : 'none',
  });

  return (
    <>
      <aside
        className="sidebar-panel sidebar-glass"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        {/* App branding */}
        <div
          style={{
            padding: '18px 16px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon.svg"
            alt=""
            width={28}
            height={28}
            style={{ borderRadius: '8px', flexShrink: 0 }}
          />
          <span style={{
            fontSize: '14px',
            fontWeight: '700',
            color: '#0369a1',
            letterSpacing: '0.03em',
          }}>
            ClearDeck
          </span>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 8px' }}>
          {builtinItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const badge =
              item.href === '/inbox'
                ? inboxTasks.length || null
                : item.href === '/review'
                ? reviewProjects.length || null
                : null;

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: 'none' }}
                onClick={onNavigate}
              >
                <div
                  className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    marginBottom: '2px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '400',
                    color: isActive ? '#ffffff' : 'var(--sidebar-text)',
                  }}
                >
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {badge !== null && (
                    <span
                      style={{
                        background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--accent-primary-light)',
                        color: isActive ? '#fff' : 'var(--accent-primary)',
                        borderRadius: '10px',
                        padding: '1px 7px',
                        fontSize: '11px',
                        fontWeight: '700',
                        minWidth: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Custom perspectives section */}
          <div
            style={{
              padding: '12px 12px 4px',
              fontSize: '10px',
              fontWeight: '700',
              color: 'var(--muted-text)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Custom</span>
            <button
              onClick={() => setEditorOpen(true)}
              title="New perspective"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', padding: '0 2px', display: 'flex' }}
            >
              <Plus size={13} />
            </button>
          </div>

          {customPerspectives.map((p) => {
            const isActive = pathname === `/perspectives/${p.id}`;
            return (
              <PerspectiveItem
                key={p.id}
                perspective={p}
                isActive={isActive}
                onNavigate={onNavigate}
                onDelete={deletePerspective}
              />
            );
          })}
        </nav>

        {/* Footer: theme + toggles + signout */}
        <div
          style={{
            padding: '10px 14px',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            gap: '4px',
            alignItems: 'center',
          }}
        >
          {(['light', 'dark', 'system'] as const).map((t) => {
            const Icon = t === 'light' ? Sun : t === 'dark' ? Moon : Monitor;
            const isActiveTheme = mounted && theme === t;
            return (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={footerBtnStyle(isActiveTheme)}
                title={t}
              >
                <Icon size={14} />
              </button>
            );
          })}

          {/* Show deferred toggle */}
          <button
            onClick={() => setShowDeferred(!showDeferred)}
            style={footerBtnStyle(showDeferred)}
            title={showDeferred ? 'Hide deferred tasks' : 'Show deferred tasks'}
          >
            {showDeferred ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Notifications toggle */}
          <button
            onClick={handleToggleNotifications}
            style={footerBtnStyle(notificationsEnabled)}
            title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
          </button>

          {/* Data export/import */}
          <button
            onClick={() => setDataPortabilityOpen(true)}
            style={footerBtnStyle()}
            title="Export / import data"
          >
            <Download size={14} />
          </button>

          {/* Keyboard shortcuts */}
          <button
            onClick={() => setShortcutsOpen(true)}
            style={footerBtnStyle()}
            title="Keyboard shortcuts (?)"
          >
            <Keyboard size={14} />
          </button>

          <button
            onClick={handleSignOut}
            style={{ ...footerBtnStyle(), marginLeft: 'auto' }}
            title="Sign out"
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-text)')}
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      <PerspectiveEditor
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
      />
    </>
  );
}
