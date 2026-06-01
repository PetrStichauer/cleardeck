import { supabaseClient } from '@/lib/supabase/client';
import {
  taskToDB,
  projectToDB,
  tagToDB,
  folderToDB,
  perspectiveToDB,
} from '@/lib/supabase/mappers';
import type { Task, Project, Tag, Folder, CustomPerspective } from '@/types';

export const EXPORT_VERSION = '1.0';

export interface ClearDeckExport {
  version: string;
  app: 'cleardeck';
  exported_at: string;
  data: {
    tasks: Task[];
    projects: Project[];
    tags: Tag[];
    folders: Folder[];
    perspectives: CustomPerspective[];
  };
}

export function buildExportPayload(
  tasks: Record<string, Task>,
  projects: Record<string, Project>,
  tags: Record<string, Tag>,
  folders: Record<string, Folder>,
  perspectives: Record<string, CustomPerspective>,
): ClearDeckExport {
  return {
    version: EXPORT_VERSION,
    app: 'cleardeck',
    exported_at: new Date().toISOString(),
    data: {
      tasks: Object.values(tasks),
      projects: Object.values(projects),
      tags: Object.values(tags),
      folders: Object.values(folders),
      perspectives: Object.values(perspectives),
    },
  };
}

export function parseImportPayload(raw: unknown): ClearDeckExport['data'] {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid file: expected JSON object');
  }

  const obj = raw as Record<string, unknown>;

  if (obj.app === 'cleardeck' && obj.data && typeof obj.data === 'object') {
    return validateData(obj.data as Record<string, unknown>);
  }

  if ('tasks' in obj || 'projects' in obj) {
    return validateData(obj);
  }

  throw new Error('Unrecognized export format');
}

function validateData(data: Record<string, unknown>): ClearDeckExport['data'] {
  return {
    tasks: Array.isArray(data.tasks) ? (data.tasks as Task[]) : [],
    projects: Array.isArray(data.projects) ? (data.projects as Project[]) : [],
    tags: Array.isArray(data.tags) ? (data.tags as Tag[]) : [],
    folders: Array.isArray(data.folders) ? (data.folders as Folder[]) : [],
    perspectives: Array.isArray(data.perspectives)
      ? (data.perspectives as CustomPerspective[])
      : [],
  };
}

async function clearAllUserData(): Promise<void> {
  const sb = supabaseClient();
  const tables = ['tasks', 'projects', 'cd_perspectives', 'cd_tags', 'cd_folders'] as const;

  for (const table of tables) {
    const { error } = await sb.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw new Error(`Failed to clear ${table}: ${error.message}`);
  }
}

export async function importData(
  data: ClearDeckExport['data'],
  mode: 'merge' | 'replace',
): Promise<void> {
  const sb = supabaseClient();

  if (mode === 'replace') {
    await clearAllUserData();
  }

  if (data.folders.length > 0) {
    const { error } = await sb.from('cd_folders').upsert(data.folders.map(folderToDB));
    if (error) throw new Error(`Failed to import folders: ${error.message}`);
  }

  if (data.tags.length > 0) {
    const { error } = await sb.from('cd_tags').upsert(data.tags.map(tagToDB));
    if (error) throw new Error(`Failed to import tags: ${error.message}`);
  }

  if (data.projects.length > 0) {
    const { error } = await sb.from('projects').upsert(data.projects.map(projectToDB));
    if (error) throw new Error(`Failed to import projects: ${error.message}`);
  }

  if (data.tasks.length > 0) {
    const { error } = await sb.from('tasks').upsert(data.tasks.map(taskToDB));
    if (error) throw new Error(`Failed to import tasks: ${error.message}`);
  }

  if (data.perspectives.length > 0) {
    const { error } = await sb
      .from('cd_perspectives')
      .upsert(data.perspectives.map(perspectiveToDB));
    if (error) throw new Error(`Failed to import perspectives: ${error.message}`);
  }
}

export async function reloadAllStores(): Promise<void> {
  const [
    { useTasksStore },
    { useProjectsStore },
    { useTagsStore },
    { useFoldersStore },
    { usePerspectivesStore },
  ] = await Promise.all([
    import('@/store/tasks.store'),
    import('@/store/projects.store'),
    import('@/store/tags.store'),
    import('@/store/folders.store'),
    import('@/store/perspectives.store'),
  ]);

  useTasksStore.setState({ tasks: {}, _hasHydrated: false });
  useProjectsStore.setState({ projects: {}, _hasHydrated: false });
  useTagsStore.setState({ tags: {}, _hasHydrated: false });
  useFoldersStore.setState({ folders: {}, _hasHydrated: false });
  usePerspectivesStore.setState({ perspectives: {}, _hasHydrated: false });

  await Promise.all([
    useTasksStore.getState().loadFromSupabase(),
    useProjectsStore.getState().loadFromSupabase(),
    useTagsStore.getState().loadFromSupabase(),
    useFoldersStore.getState().loadFromSupabase(),
    usePerspectivesStore.getState().loadFromSupabase(),
  ]);
}
