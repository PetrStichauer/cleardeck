// ============================================================
// Core data types for ClearDeck
// ============================================================

export type TaskStatus = 'active' | 'completed' | 'dropped';
export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'dropped';
export type ProjectType = 'sequential' | 'parallel' | 'single_action';
export type RepeatUnit = 'days' | 'weeks' | 'months' | 'years';
export type RepeatType = 'regular' | 'from_completion';

export interface RepeatSettings {
  interval: number;
  unit: RepeatUnit;
  type: RepeatType;
}

export interface Task {
  id: string;
  title: string;
  notes: string; // HTML from Tiptap editor
  status: TaskStatus;
  flagged: boolean;
  defer_date: string | null; // ISO 8601 – when task becomes available
  due_date: string | null; // ISO 8601 – deadline
  planned_date: string | null; // ISO 8601 – user-planned day
  estimated_duration: number | null; // minutes
  project_id: string | null; // null = Inbox
  tag_ids: string[];
  repeat: RepeatSettings | null;
  parent_id: string | null; // for Action Groups (sub-tasks)
  position: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  dropped_at: string | null;
}

export interface Project {
  id: string;
  title: string;
  notes: string;
  status: ProjectStatus;
  type: ProjectType;
  folder_id: string | null;
  flagged: boolean;
  defer_date: string | null;
  due_date: string | null;
  review_interval_weeks: number; // default: 1
  last_reviewed_at: string | null;
  complete_with_last_action: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface Tag {
  id: string;
  name: string;
  parent_id: string | null;
  color: string | null;
  position: number;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  position: number;
}

export type FilterOperator = 'and' | 'or';
export type FilterField = 'status' | 'flagged' | 'project_id' | 'tag_ids' | 'due_date' | 'defer_date' | 'planned_date' | 'title';
export type FilterCondition = 'equals' | 'not_equals' | 'contains' | 'is_set' | 'is_not_set' | 'before' | 'after';
export type GroupBy = 'project' | 'tag' | 'due_date' | 'defer_date' | 'flagged' | 'none';
export type SortBy = 'title' | 'due_date' | 'defer_date' | 'created_at' | 'position' | 'flagged';

export interface FilterRule {
  field: FilterField;
  condition: FilterCondition;
  value?: string | boolean | string[];
}

export interface CustomPerspective {
  id: string;
  name: string;
  icon: string;
  filter_operator: FilterOperator;
  filter_rules: FilterRule[];
  group_by: GroupBy;
  sort_by: SortBy;
  sort_direction: 'asc' | 'desc';
  show_completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

// UI State Types
export type SelectedItemType = 'task' | 'project' | null;

export interface SelectedItem {
  type: SelectedItemType;
  id: string;
}

// Store Types
export interface TasksState {
  tasks: Record<string, Task>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  dropTask: (id: string) => void;
  reactivateTask: (id: string) => void;
}

export interface ProjectsState {
  projects: Record<string, Project>;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  completeProject: (id: string) => void;
  markReviewed: (id: string) => void;
}

export interface TagsState {
  tags: Record<string, Tag>;
  addTag: (tag: Omit<Tag, 'id'>) => Tag;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
}

export interface FoldersState {
  folders: Record<string, Folder>;
  addFolder: (folder: Omit<Folder, 'id'>) => Folder;
  updateFolder: (id: string, updates: Partial<Folder>) => void;
  deleteFolder: (id: string) => void;
}

export interface PerspectivesState {
  perspectives: Record<string, CustomPerspective>;
  addPerspective: (perspective: Omit<CustomPerspective, 'id' | 'created_at' | 'updated_at'>) => CustomPerspective;
  updatePerspective: (id: string, updates: Partial<CustomPerspective>) => void;
  deletePerspective: (id: string) => void;
}

export interface UIState {
  selectedItem: SelectedItem | null;
  inspectorOpen: boolean;
  quickEntryOpen: boolean;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  searchQuery: string;
  showDeferred: boolean;
  notificationsEnabled: boolean;
  shortcutsOpen: boolean;
  dataPortabilityOpen: boolean;
  setSelectedItem: (item: SelectedItem | null) => void;
  setInspectorOpen: (open: boolean) => void;
  setQuickEntryOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  toggleInspector: () => void;
  setSearchQuery: (q: string) => void;
  setShowDeferred: (show: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  setDataPortabilityOpen: (open: boolean) => void;
}
