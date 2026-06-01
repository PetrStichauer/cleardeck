# ClearDeck Architecture

ClearDeck is a GTD-inspired task manager built with Next.js 15 (App Router), TypeScript, Zustand, and Supabase PostgreSQL + Auth.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS + inline styles |
| State | Zustand + Immer middleware |
| Rich text | Tiptap (StarterKit) |
| Date utils | date-fns |
| Icons | Lucide React |
| Dark mode | next-themes |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth (email/password) |

## Data Model

All entities are stored in Supabase with user-scoped Row Level Security.

### Task

```typescript
interface Task {
  id: string;
  title: string;
  notes: string;           // HTML from Tiptap
  status: 'active' | 'completed' | 'dropped';
  flagged: boolean;
  defer_date: string | null;
  due_date: string | null;
  planned_date: string | null;
  estimated_duration: number | null;
  project_id: string | null;  // null = Inbox
  tag_ids: string[];
  repeat: RepeatSettings | null;
  parent_id: string | null;   // action groups (schema only in v0.1)
  position: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  dropped_at: string | null;
}
```

### Project, Tag, Folder, CustomPerspective

See `src/types/index.ts` for full TypeScript definitions.

Supabase tables:

| App entity | Table |
|---|---|
| Tasks | `tasks` |
| Projects | `projects` |
| Tags | `cd_tags` |
| Folders | `cd_folders` |
| Custom perspectives | `cd_perspectives` |

## Perspectives (Views)

| Perspective | Route | Description |
|---|---|---|
| Inbox | `/inbox` | Active tasks with no project |
| Projects | `/projects` | Folder + project tree |
| Tags | `/tags` | Tasks grouped by tag |
| Forecast | `/forecast` | Date-bucketed timeline |
| Flagged | `/flagged` | All flagged active tasks |
| Review | `/review` | Projects past review interval |
| Completed | `/completed` | Done tasks and projects |
| Custom | `/perspectives/[id]` | User-defined filters |

## File Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, ThemeProvider
│   ├── page.tsx                # Public landing page
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── (app)/                  # Authenticated shell (3-panel grid)
│       ├── layout.tsx
│       ├── inbox/page.tsx
│       ├── projects/[[...slug]]/page.tsx
│       └── ...
├── components/
│   ├── layout/                 # Sidebar, MainPanel, InspectorPanel
│   ├── task/                   # TaskRow, TaskList, QuickEntry
│   ├── project/                # ProjectTree, ProjectInspector
│   ├── common/                 # ShortcutsDialog, DatePicker, etc.
│   └── settings/               # DataPortability
├── store/                      # Zustand stores (Record<string, Entity>)
├── hooks/                      # useTasks, useStorage, useKeyboardShortcuts
├── lib/
│   ├── supabase/               # client, middleware, mappers
│   ├── data-portability.ts     # JSON export/import
│   ├── filters.ts              # Custom perspective filter engine
│   └── dates.ts
└── types/index.ts
```

## Key Architectural Decisions

### 1. Stores as `Record<string, Entity>`

O(1) lookup by ID. Selectors return arrays via `Object.values()` for rendering.

### 2. Supabase-first persistence

Each store loads from Supabase on mount via `useStorage()`. Mutations optimistically update Zustand state and async upsert/delete to Supabase.

DB ↔ app mapping lives in `src/lib/supabase/mappers.ts`.

### 3. Layout: CSS Grid three panels

```css
grid-template-columns: 240px 1fr 360px;
/* Inspector hidden: 240px 1fr 0px */
```

### 4. Sequential project enforcement

If a project is `type: 'sequential'`, `useTasks` returns only the first active task by position. Others are locked until the previous one completes.

### 5. Auth middleware

`src/middleware.ts` protects all routes except `/`, `/login`, `/signup`, and static assets. Authenticated users on login/signup redirect to `/inbox`.

### 6. Row Level Security

All tables have `user_id` set via `cd_set_user_id()` trigger on insert. RLS policies enforce `auth.uid() = user_id` for all operations.

## Schema

Single migration: `supabase/migrations/001_cleardeck_schema.sql`

See [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for bootstrap instructions.

## Data Export / Import

JSON format defined in `src/lib/data-portability.ts`. Export includes all user entities. Import supports merge (upsert) or replace (delete all + upsert).

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd+K` | Quick entry |
| `Cmd+I` | Toggle inspector |
| `Cmd+/` or `?` | Shortcuts overlay |
| `Esc` | Close modals |

## Roadmap (not in v0.1)

- Repeat task generation
- Action groups UI
- Horizontal Forecast calendar
- Playwright E2E tests
