import {
  Task,
  TaskStatus,
  Project,
  ProjectStatus,
  ProjectType,
  Tag,
  Folder,
  CustomPerspective,
  FilterOperator,
  GroupBy,
  SortBy,
  RepeatSettings,
} from '@/types';

// ==================== TASKS ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function taskFromDB(row: Record<string, any>): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.description ?? '',
    status: mapTaskStatus(row.status),
    flagged: row.flagged ?? false,
    defer_date: row.defer_date ?? null,
    due_date: row.due_date ?? null,
    planned_date: row.planned_date ?? null,
    estimated_duration: row.estimated_minutes ?? null,
    project_id: row.project_id ?? null,
    tag_ids: row.tag_ids ?? [],
    repeat: (row.repeat_settings as RepeatSettings) ?? null,
    parent_id: row.parent_task_id ?? null,
    position: row.position ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at ?? null,
    dropped_at: row.dropped_at ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function taskToDB(task: Task): Record<string, any> {
  return {
    id: task.id,
    title: task.title,
    description: task.notes,
    status: task.status,
    flagged: task.flagged,
    defer_date: task.defer_date,
    due_date: task.due_date,
    planned_date: task.planned_date,
    estimated_minutes: task.estimated_duration,
    project_id: task.project_id,
    tag_ids: task.tag_ids,
    repeat_settings: task.repeat,
    parent_task_id: task.parent_id,
    position: task.position,
    created_at: task.created_at,
    updated_at: task.updated_at,
    completed_at: task.completed_at,
    dropped_at: task.dropped_at,
  };
}

function mapTaskStatus(dbStatus: string): TaskStatus {
  if (dbStatus === 'completed') return 'completed';
  if (dbStatus === 'dropped') return 'dropped';
  return 'active';
}

// ==================== PROJECTS ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function projectFromDB(row: Record<string, any>): Project {
  return {
    id: row.id,
    title: row.name,
    notes: row.description ?? '',
    status: (row.status as ProjectStatus) ?? 'active',
    type: (row.type as ProjectType) ?? 'parallel',
    folder_id: row.folder_id ?? null,
    flagged: row.flagged ?? false,
    defer_date: row.defer_date ?? null,
    due_date: row.target_date ?? null,
    review_interval_weeks: row.review_interval_weeks ?? 1,
    last_reviewed_at: row.last_reviewed_at ?? null,
    complete_with_last_action: row.complete_with_last_action ?? false,
    position: row.position ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function projectToDB(project: Project): Record<string, any> {
  return {
    id: project.id,
    name: project.title,
    description: project.notes,
    status: project.status,
    type: project.type,
    folder_id: project.folder_id,
    flagged: project.flagged,
    defer_date: project.defer_date,
    target_date: project.due_date,
    review_interval_weeks: project.review_interval_weeks,
    last_reviewed_at: project.last_reviewed_at,
    complete_with_last_action: project.complete_with_last_action,
    position: project.position,
    created_at: project.created_at,
    updated_at: project.updated_at,
    completed_at: project.completed_at,
  };
}

// ==================== TAGS ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function tagFromDB(row: Record<string, any>): Tag {
  return {
    id: row.id,
    name: row.name,
    parent_id: row.parent_id ?? null,
    color: row.color ?? null,
    position: row.position ?? 0,
  };
}

export function tagToDB(tag: Tag): Record<string, unknown> {
  return {
    id: tag.id,
    name: tag.name,
    parent_id: tag.parent_id,
    color: tag.color,
    position: tag.position,
  };
}

// ==================== FOLDERS ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function folderFromDB(row: Record<string, any>): Folder {
  return {
    id: row.id,
    name: row.name,
    parent_id: row.parent_id ?? null,
    position: row.position ?? 0,
  };
}

export function folderToDB(folder: Folder): Record<string, unknown> {
  return {
    id: folder.id,
    name: folder.name,
    parent_id: folder.parent_id,
    position: folder.position,
  };
}

// ==================== PERSPECTIVES ====================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function perspectiveFromDB(row: Record<string, any>): CustomPerspective {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon ?? 'Eye',
    filter_operator: (row.filter_operator as FilterOperator) ?? 'and',
    filter_rules: row.filter_rules ?? [],
    group_by: (row.group_by as GroupBy) ?? 'none',
    sort_by: (row.sort_by as SortBy) ?? 'created_at',
    sort_direction: row.sort_direction ?? 'asc',
    show_completed: row.show_completed ?? false,
    position: row.position ?? 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function perspectiveToDB(p: CustomPerspective): Record<string, unknown> {
  return {
    id: p.id,
    name: p.name,
    icon: p.icon,
    filter_operator: p.filter_operator,
    filter_rules: p.filter_rules,
    group_by: p.group_by,
    sort_by: p.sort_by,
    sort_direction: p.sort_direction,
    show_completed: p.show_completed,
    position: p.position,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}
