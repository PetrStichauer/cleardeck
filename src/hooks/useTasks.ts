'use client';

import { useMemo } from 'react';
import { useTasksStore } from '@/store/tasks.store';
import { useProjectsStore } from '@/store/projects.store';
import { useUIStore } from '@/store/ui.store';
import { Task } from '@/types';
import { isAvailable } from '@/lib/dates';

export function useInboxTasks(): Task[] {
  const tasks = useTasksStore((s) => s.tasks);
  const showDeferred = useUIStore((s) => s.showDeferred);
  return useMemo(
    () =>
      Object.values(tasks)
        .filter(
          (t) =>
            t.status === 'active' &&
            t.project_id === null &&
            t.parent_id === null &&
            (showDeferred || isAvailable(t.defer_date))
        )
        .sort((a, b) => a.position - b.position),
    [tasks, showDeferred]
  );
}

export function useFlaggedTasks(): Task[] {
  const tasks = useTasksStore((s) => s.tasks);
  const showDeferred = useUIStore((s) => s.showDeferred);
  return useMemo(
    () =>
      Object.values(tasks)
        .filter(
          (t) =>
            t.status === 'active' &&
            t.flagged &&
            (showDeferred || isAvailable(t.defer_date))
        )
        .sort((a, b) => {
          // Due date first, then position
          if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
          if (a.due_date) return -1;
          if (b.due_date) return 1;
          return a.position - b.position;
        }),
    [tasks, showDeferred]
  );
}

export function useProjectTasks(projectId: string): Task[] {
  const tasks = useTasksStore((s) => s.tasks);
  const projects = useProjectsStore((s) => s.projects);

  return useMemo(() => {
    const project = projects[projectId];
    if (!project) return [];

    const projectTasks = Object.values(tasks)
      .filter((t) => t.status === 'active' && t.project_id === projectId && t.parent_id === null)
      .sort((a, b) => a.position - b.position);

    // Sequential project: return only the first task
    if (project.type === 'sequential' && projectTasks.length > 0) {
      return projectTasks.map((t, i) => ({
        ...t,
        _locked: i > 0, // mark subsequent tasks as locked
      } as Task & { _locked?: boolean }));
    }

    return projectTasks;
  }, [tasks, projects, projectId]);
}

export function useCompletedTasks(): Task[] {
  const tasks = useTasksStore((s) => s.tasks);
  return useMemo(
    () =>
      Object.values(tasks)
        .filter((t) => t.status === 'completed')
        .sort((a, b) => {
          if (!a.completed_at || !b.completed_at) return 0;
          return b.completed_at.localeCompare(a.completed_at); // newest first
        }),
    [tasks]
  );
}

export function useTasksByTag(tagId: string): Task[] {
  const tasks = useTasksStore((s) => s.tasks);
  const showDeferred = useUIStore((s) => s.showDeferred);
  return useMemo(
    () =>
      Object.values(tasks)
        .filter(
          (t) =>
            t.status === 'active' &&
            t.tag_ids.includes(tagId) &&
            (showDeferred || isAvailable(t.defer_date))
        )
        .sort((a, b) => a.position - b.position),
    [tasks, tagId, showDeferred]
  );
}

export function useForecastTasks(): { date: string; tasks: Task[] }[] {
  const tasks = useTasksStore((s) => s.tasks);

  return useMemo(() => {
    const activeTasks = Object.values(tasks).filter((t) => t.status === 'active');

    // Group by date: planned_date takes priority over due_date to avoid duplicates
    const buckets: Record<string, Task[]> = {};

    activeTasks.forEach((task) => {
      // Use planned_date if set, otherwise fall back to due_date
      const date = task.planned_date ?? task.due_date;
      if (!date) return;
      const day = date.split('T')[0];
      if (!buckets[day]) buckets[day] = [];
      buckets[day].push(task);
    });

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, tasks]) => ({ date, tasks }));
  }, [tasks]);
}

export function useOverdueTasks(): Task[] {
  const tasks = useTasksStore((s) => s.tasks);
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  return useMemo(
    () =>
      Object.values(tasks).filter(
        (t) => t.status === 'active' && t.due_date && t.due_date < today
      ),
    [tasks, today]
  );
}

export function useAllActiveTasks(): Task[] {
  const tasks = useTasksStore((s) => s.tasks);
  const showDeferred = useUIStore((s) => s.showDeferred);
  return useMemo(
    () =>
      Object.values(tasks)
        .filter(
          (t) =>
            t.status === 'active' &&
            (showDeferred || isAvailable(t.defer_date))
        )
        .sort((a, b) => a.position - b.position),
    [tasks, showDeferred]
  );
}
