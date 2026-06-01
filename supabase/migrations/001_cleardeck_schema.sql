-- ClearDeck v0.1.0 — self-contained schema for fresh Supabase projects
-- Run via Supabase CLI or SQL editor on a new project.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- FOLDERS (project organization)
-- ============================================================

CREATE TABLE cd_folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(200) NOT NULL,
  parent_id  UUID REFERENCES cd_folders(id) ON DELETE SET NULL,
  position   BIGINT NOT NULL DEFAULT 0,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TAGS
-- ============================================================

CREATE TABLE cd_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  parent_id  UUID REFERENCES cd_tags(id) ON DELETE SET NULL,
  color      VARCHAR(20),
  position   BIGINT NOT NULL DEFAULT 0,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROJECTS
-- ============================================================

CREATE TABLE projects (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                      VARCHAR(500) NOT NULL DEFAULT '',
  description               TEXT DEFAULT '',
  status                    VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'on_hold', 'completed', 'dropped')),
  type                      VARCHAR(30) NOT NULL DEFAULT 'parallel'
    CHECK (type IN ('sequential', 'parallel', 'single_action')),
  folder_id                 UUID REFERENCES cd_folders(id) ON DELETE SET NULL,
  flagged                   BOOLEAN NOT NULL DEFAULT false,
  defer_date                TIMESTAMPTZ,
  target_date               TIMESTAMPTZ,
  review_interval_weeks     INTEGER NOT NULL DEFAULT 1,
  last_reviewed_at          TIMESTAMPTZ,
  complete_with_last_action BOOLEAN NOT NULL DEFAULT false,
  position                  BIGINT NOT NULL DEFAULT 0,
  user_id                   UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at              TIMESTAMPTZ
);

-- ============================================================
-- TASKS
-- ============================================================

CREATE TABLE tasks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             VARCHAR(500) NOT NULL DEFAULT '',
  description       TEXT DEFAULT '',
  status            VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'dropped')),
  flagged           BOOLEAN NOT NULL DEFAULT false,
  defer_date        TIMESTAMPTZ,
  due_date          TIMESTAMPTZ,
  planned_date      TIMESTAMPTZ,
  estimated_minutes INTEGER,
  project_id        UUID REFERENCES projects(id) ON DELETE SET NULL,
  tag_ids           UUID[] DEFAULT '{}',
  repeat_settings   JSONB,
  parent_task_id    UUID REFERENCES tasks(id) ON DELETE SET NULL,
  position          BIGINT NOT NULL DEFAULT 0,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  dropped_at        TIMESTAMPTZ
);

-- ============================================================
-- CUSTOM PERSPECTIVES
-- ============================================================

CREATE TABLE cd_perspectives (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100) NOT NULL,
  icon             VARCHAR(50) DEFAULT 'Eye',
  filter_operator  VARCHAR(10) DEFAULT 'and',
  filter_rules     JSONB DEFAULT '[]',
  group_by         VARCHAR(50) DEFAULT 'none',
  sort_by          VARCHAR(50) DEFAULT 'created_at',
  sort_direction   VARCHAR(5) DEFAULT 'asc',
  show_completed   BOOLEAN DEFAULT false,
  position         BIGINT NOT NULL DEFAULT 0,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status) WHERE status != 'completed';
CREATE INDEX idx_tasks_flagged ON tasks(flagged) WHERE flagged = true;
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_defer_date ON tasks(defer_date) WHERE defer_date IS NOT NULL;
CREATE INDEX idx_tasks_planned_date ON tasks(planned_date) WHERE planned_date IS NOT NULL;
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX idx_tasks_tag_ids ON tasks USING GIN(tag_ids);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_folder_id ON projects(folder_id) WHERE folder_id IS NOT NULL;

CREATE INDEX idx_cd_tags_user_id ON cd_tags(user_id);
CREATE INDEX idx_cd_folders_user_id ON cd_folders(user_id);
CREATE INDEX idx_cd_perspectives_user_id ON cd_perspectives(user_id);

-- ============================================================
-- AUTO-SET user_id ON INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION cd_set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_user_id_tasks
  BEFORE INSERT ON tasks
  FOR EACH ROW EXECUTE FUNCTION cd_set_user_id();

CREATE TRIGGER set_user_id_projects
  BEFORE INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION cd_set_user_id();

CREATE TRIGGER set_user_id_cd_tags
  BEFORE INSERT ON cd_tags
  FOR EACH ROW EXECUTE FUNCTION cd_set_user_id();

CREATE TRIGGER set_user_id_cd_folders
  BEFORE INSERT ON cd_folders
  FOR EACH ROW EXECUTE FUNCTION cd_set_user_id();

CREATE TRIGGER set_user_id_cd_perspectives
  BEFORE INSERT ON cd_perspectives
  FOR EACH ROW EXECUTE FUNCTION cd_set_user_id();

-- ============================================================
-- ROW LEVEL SECURITY (user-scoped from day one)
-- ============================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cd_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cd_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE cd_perspectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_scoped ON tasks
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_scoped ON projects
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_scoped ON cd_tags
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_scoped ON cd_folders
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_scoped ON cd_perspectives
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- GRANTS (authenticated users only)
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cd_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cd_folders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cd_perspectives TO authenticated;
