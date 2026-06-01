'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, FolderKanban, CalendarDays, Flag, RotateCcw, Menu } from 'lucide-react';
import { useInboxTasks } from '@/hooks/useTasks';
import { useProjectsNeedingReview } from '@/hooks/useProjects';
import { useUIStore } from '@/store/ui.store';

const primaryTabs = [
  { label: 'Inbox', href: '/inbox', icon: Inbox, badge: 'inbox' as const },
  { label: 'Projects', href: '/projects', icon: FolderKanban, badge: null },
  { label: 'Forecast', href: '/forecast', icon: CalendarDays, badge: null },
  { label: 'Flagged', href: '/flagged', icon: Flag, badge: null },
  { label: 'Review', href: '/review', icon: RotateCcw, badge: 'review' as const },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const inboxTasks = useInboxTasks();
  const reviewProjects = useProjectsNeedingReview();

  function getBadgeCount(badge: 'inbox' | 'review' | null) {
    if (badge === 'inbox') return inboxTasks.length;
    if (badge === 'review') return reviewProjects.length;
    return 0;
  }

  return (
    <nav className="bottom-tab-bar">
      {primaryTabs.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
        const badgeCount = getBadgeCount(tab.badge);
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '8px 4px',
              textDecoration: 'none',
              color: isActive ? 'var(--accent-primary)' : 'var(--muted-text)',
              position: 'relative',
              minHeight: '44px',
              transition: 'color 0.15s ease',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              {badgeCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-8px',
                  background: isActive ? 'var(--accent-primary)' : 'var(--accent-red)',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: '700',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  lineHeight: 1,
                }}>
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '9px',
              fontWeight: isActive ? '600' : '400',
              letterSpacing: '0.02em',
            }}>
              {tab.label}
            </span>
            {isActive && (
              <span style={{
                position: 'absolute',
                bottom: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20px',
                height: '2px',
                borderRadius: '1px',
                background: 'var(--gradient-primary)',
              }} />
            )}
          </Link>
        );
      })}

      {/* More button – opens MobileSidebarSheet */}
      <button
        onClick={() => setMobileNavOpen(true)}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '3px',
          padding: '8px 4px',
          background: 'none',
          border: 'none',
          color: 'var(--muted-text)',
          minHeight: '44px',
          cursor: 'pointer',
          transition: 'color 0.15s ease',
        }}
      >
        <Menu size={22} strokeWidth={1.8} />
        <span style={{ fontSize: '9px', fontWeight: '400', letterSpacing: '0.02em' }}>
          More
        </span>
      </button>
    </nav>
  );
}
