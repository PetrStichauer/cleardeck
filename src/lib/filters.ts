import { Task, FilterRule, FilterOperator, FilterField, GroupBy, SortBy, Tag, Project } from '@/types';
import { isAvailable, isOverdue } from '@/lib/dates';
import { parseISO, startOfDay } from 'date-fns';

// ── Evaluate a single FilterRule against a task ──────────────────────────────

export function evaluateRule(task: Task, rule: FilterRule): boolean {
  switch (rule.field as FilterField) {
    case 'title': {
      if (rule.condition === 'contains') {
        return task.title.toLowerCase().includes(String(rule.value ?? '').toLowerCase());
      }
      return true;
    }

    case 'flagged': {
      if (rule.condition === 'equals') return task.flagged === rule.value;
      if (rule.condition === 'not_equals') return task.flagged !== rule.value;
      return true;
    }

    case 'status': {
      if (rule.condition === 'equals') return task.status === rule.value;
      if (rule.condition === 'not_equals') return task.status !== rule.value;
      return true;
    }

    case 'project_id': {
      if (rule.condition === 'is_set') return task.project_id !== null;
      if (rule.condition === 'is_not_set') return task.project_id === null;
      if (rule.condition === 'equals') return task.project_id === rule.value;
      if (rule.condition === 'not_equals') return task.project_id !== rule.value;
      return true;
    }

    case 'tag_ids': {
      if (rule.condition === 'is_set') return task.tag_ids.length > 0;
      if (rule.condition === 'is_not_set') return task.tag_ids.length === 0;
      if (rule.condition === 'contains') {
        if (Array.isArray(rule.value)) {
          return (rule.value as string[]).some((id) => task.tag_ids.includes(id));
        }
        if (typeof rule.value === 'string') return task.tag_ids.includes(rule.value);
      }
      return true;
    }

    case 'due_date': {
      if (rule.condition === 'is_set') return task.due_date !== null;
      if (rule.condition === 'is_not_set') return task.due_date === null;
      if (!task.due_date) return false;
      if (rule.condition === 'before' && rule.value) {
        return startOfDay(parseISO(task.due_date)) < startOfDay(parseISO(String(rule.value)));
      }
      if (rule.condition === 'after' && rule.value) {
        return startOfDay(parseISO(task.due_date)) > startOfDay(parseISO(String(rule.value)));
      }
      return true;
    }

    case 'defer_date': {
      if (rule.condition === 'is_set') return task.defer_date !== null;
      if (rule.condition === 'is_not_set') return task.defer_date === null;
      if (!task.defer_date) return false;
      if (rule.condition === 'before' && rule.value) {
        return startOfDay(parseISO(task.defer_date)) < startOfDay(parseISO(String(rule.value)));
      }
      if (rule.condition === 'after' && rule.value) {
        return startOfDay(parseISO(task.defer_date)) > startOfDay(parseISO(String(rule.value)));
      }
      return true;
    }

    case 'planned_date': {
      if (rule.condition === 'is_set') return task.planned_date !== null;
      if (rule.condition === 'is_not_set') return task.planned_date === null;
      return true;
    }

    default:
      return true;
  }
}

// ── Apply all rules with AND/OR operator ────────────────────────────────────

export function applyFilterRules(
  tasks: Task[],
  rules: FilterRule[],
  operator: FilterOperator
): Task[] {
  if (rules.length === 0) return tasks;
  return tasks.filter((task) => {
    const results = rules.map((r) => evaluateRule(task, r));
    return operator === 'and' ? results.every(Boolean) : results.some(Boolean);
  });
}

// ── Defer filter: remove tasks not yet available ─────────────────────────────

export function filterDeferred(tasks: Task[], showDeferred: boolean): Task[] {
  if (showDeferred) return tasks;
  return tasks.filter((t) => isAvailable(t.defer_date));
}

// ── Search: filter by title and notes (HTML) ─────────────────────────────────

export function filterBySearch(tasks: Task[], query: string): Task[] {
  if (!query.trim()) return tasks;
  const q = query.toLowerCase();
  return tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.notes.toLowerCase().includes(q)
  );
}

// ── Quick-filter toggles ──────────────────────────────────────────────────────

export interface QuickFilters {
  flaggedOnly: boolean;
  hasDueDate: boolean;
  overdueOnly: boolean;
}

export function applyQuickFilters(tasks: Task[], quickFilters: QuickFilters): Task[] {
  let result = tasks;
  if (quickFilters.flaggedOnly) result = result.filter((t) => t.flagged);
  if (quickFilters.hasDueDate) result = result.filter((t) => t.due_date !== null);
  if (quickFilters.overdueOnly) result = result.filter((t) => isOverdue(t.due_date));
  return result;
}

// ── Group tasks ───────────────────────────────────────────────────────────────

export interface TaskGroup {
  label: string;
  tasks: Task[];
}

export function groupTasks(
  tasks: Task[],
  groupBy: GroupBy,
  projects: Record<string, Project>,
  tags: Record<string, Tag>
): TaskGroup[] {
  if (groupBy === 'none') return [{ label: '', tasks }];

  const groups: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    let key = 'None';

    if (groupBy === 'project') {
      key = task.project_id
        ? (projects[task.project_id]?.title ?? 'Unknown Project')
        : 'Inbox';
    } else if (groupBy === 'tag') {
      if (task.tag_ids.length === 0) {
        key = 'No Tag';
      } else {
        key = tags[task.tag_ids[0]]?.name ?? 'Unknown Tag';
      }
    } else if (groupBy === 'due_date') {
      key = task.due_date ? task.due_date.split('T')[0] : 'No Due Date';
    } else if (groupBy === 'defer_date') {
      key = task.defer_date ? task.defer_date.split('T')[0] : 'No Defer Date';
    } else if (groupBy === 'flagged') {
      key = task.flagged ? 'Flagged' : 'Not Flagged';
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(task);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => {
      // Put "No X" groups at the end
      if (a.startsWith('No ') && !b.startsWith('No ')) return 1;
      if (!a.startsWith('No ') && b.startsWith('No ')) return -1;
      return a.localeCompare(b);
    })
    .map(([label, tasks]) => ({ label, tasks }));
}

// ── Sort tasks ────────────────────────────────────────────────────────────────

export function sortTasks(
  tasks: Task[],
  sortBy: SortBy,
  direction: 'asc' | 'desc'
): Task[] {
  const sorted = [...tasks].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'title':
        cmp = a.title.localeCompare(b.title);
        break;
      case 'due_date':
        cmp = (a.due_date ?? '9999-99-99').localeCompare(b.due_date ?? '9999-99-99');
        break;
      case 'defer_date':
        cmp = (a.defer_date ?? '9999-99-99').localeCompare(b.defer_date ?? '9999-99-99');
        break;
      case 'created_at':
        cmp = a.created_at.localeCompare(b.created_at);
        break;
      case 'position':
        cmp = a.position - b.position;
        break;
      case 'flagged':
        cmp = (b.flagged ? 1 : 0) - (a.flagged ? 1 : 0);
        break;
    }
    return direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}
