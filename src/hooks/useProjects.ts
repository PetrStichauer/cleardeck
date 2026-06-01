'use client';

import { useMemo } from 'react';
import { useProjectsStore } from '@/store/projects.store';
import { Project } from '@/types';

export function useActiveProjects(): Project[] {
  const projects = useProjectsStore((s) => s.projects);
  return useMemo(
    () =>
      Object.values(projects)
        .filter((p) => p.status === 'active' || p.status === 'on_hold')
        .sort((a, b) => a.position - b.position),
    [projects]
  );
}

export function useProjectsNeedingReview(): Project[] {
  const projects = useProjectsStore((s) => s.projects);
  const now = new Date();

  return useMemo(
    () =>
      Object.values(projects).filter((p) => {
        if (p.status !== 'active') return false;
        if (!p.last_reviewed_at) return true;
        const lastReview = new Date(p.last_reviewed_at);
        const daysSince = (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince >= p.review_interval_weeks * 7;
      }),
    [projects]
  );
}

export function useCompletedProjects(): Project[] {
  const projects = useProjectsStore((s) => s.projects);
  return useMemo(
    () =>
      Object.values(projects)
        .filter((p) => p.status === 'completed')
        .sort((a, b) => {
          if (!a.completed_at || !b.completed_at) return 0;
          return b.completed_at.localeCompare(a.completed_at);
        }),
    [projects]
  );
}
