'use client';

import { useEffect, useState } from 'react';
import { useTasksStore } from '@/store/tasks.store';
import { useProjectsStore } from '@/store/projects.store';
import { useTagsStore } from '@/store/tags.store';
import { useFoldersStore } from '@/store/folders.store';
import { usePerspectivesStore } from '@/store/perspectives.store';

/**
 * Triggers data loading from Supabase on mount and returns true once
 * all stores have been populated. Use this to render skeletons while loading.
 */
export function useStorage(): boolean {
  const [ready, setReady] = useState(false);

  const loadTasks = useTasksStore((s) => s.loadFromSupabase);
  const loadProjects = useProjectsStore((s) => s.loadFromSupabase);
  const loadTags = useTagsStore((s) => s.loadFromSupabase);
  const loadFolders = useFoldersStore((s) => s.loadFromSupabase);
  const loadPerspectives = usePerspectivesStore((s) => s.loadFromSupabase);

  useEffect(() => {
    Promise.all([
      loadTasks(),
      loadProjects(),
      loadTags(),
      loadFolders(),
      loadPerspectives(),
    ]).then(() => setReady(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ready;
}
