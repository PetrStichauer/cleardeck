'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/ui.store';
import { Sidebar } from './Sidebar';

export function MobileSidebarSheet() {
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);

  // Close on Escape
  useEffect(() => {
    if (!mobileNavOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileNavOpen, setMobileNavOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="mobile-sheet-backdrop"
        style={{ opacity: mobileNavOpen ? 1 : 0, pointerEvents: mobileNavOpen ? 'auto' : 'none', transition: 'opacity 0.28s ease' }}
        onClick={() => setMobileNavOpen(false)}
      />
      {/* Sliding panel */}
      <div className={`mobile-sheet-panel${mobileNavOpen ? ' open' : ''}`}>
        <Sidebar onNavigate={() => setMobileNavOpen(false)} />
      </div>
    </>
  );
}
