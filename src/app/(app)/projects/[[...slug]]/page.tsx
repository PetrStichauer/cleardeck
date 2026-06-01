'use client';

import { useState } from 'react';
import { FolderKanban, Plus, ChevronLeft, FolderPlus } from 'lucide-react';
import { useActiveProjects } from '@/hooks/useProjects';
import { useProjectTasks } from '@/hooks/useTasks';
import { useProjectsStore } from '@/store/projects.store';
import { useFoldersStore } from '@/store/folders.store';
import { useTasksStore } from '@/store/tasks.store';
import { useUIStore } from '@/store/ui.store';
import { ProjectTree } from '@/components/project/ProjectTree';
import { TaskList } from '@/components/task/TaskList';
import { EmptyState } from '@/components/common/EmptyState';

function ProjectTasksView({ projectId, onBack }: { projectId: string; onBack?: () => void }) {
  const projects = useProjectsStore((s) => s.projects);
  const addTask = useTasksStore((s) => s.addTask);
  const { setSelectedItem } = useUIStore();
  const project = projects[projectId];
  const tasks = useProjectTasks(projectId);
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  if (!project) return null;

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    const task = addTask({
      title: newTitle.trim(),
      notes: '',
      status: 'active',
      flagged: false,
      defer_date: null,
      due_date: null,
      planned_date: null,
      estimated_duration: null,
      project_id: projectId,
      tag_ids: [],
      repeat: null,
      parent_id: null,
      position: Date.now(),
      completed_at: null,
      dropped_at: null,
    });
    setNewTitle('');
    setAdding(false);
    setSelectedItem({ type: 'task', id: task.id });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Mobile back button */}
        <button
          className="mobile-back-btn"
          onClick={() => onBack?.()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', padding: '4px', alignItems: 'center', gap: '2px', fontSize: '14px' }}
        >
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontSize: '16px', fontWeight: '600', flex: 1 }}>{project.title}</span>
        <button
          onClick={() => setSelectedItem({ type: 'project', id: projectId })}
          style={{ fontSize: '12px', color: 'var(--accent-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
        >
          Info
        </button>
        <button
          onClick={() => setAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#fff', background: 'var(--gradient-primary)', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px' }}
        >
          <Plus size={13} /> Add Task
        </button>
      </div>

      {adding && (
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
              if (e.key === 'Escape') { setAdding(false); setNewTitle(''); }
            }}
            placeholder="New task title…"
            style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--accent-primary)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '14px', outline: 'none' }}
          />
          <button onClick={handleAddTask} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: 'var(--gradient-primary)', color: '#fff', fontSize: '13px', cursor: 'pointer' }}>Add</button>
          <button onClick={() => { setAdding(false); setNewTitle(''); }} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--muted-text)', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      <TaskList tasks={tasks} emptyMessage="No tasks in this project" />
    </div>
  );
}

export default function ProjectsPage() {
  const activeProjects = useActiveProjects();
  const { folders, addFolder } = useFoldersStore();
  const addProject = useProjectsStore((s) => s.addProject);
  const { setSelectedItem } = useUIStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    activeProjects[0]?.id || null
  );
  const [addingProject, setAddingProject] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [addingFolder, setAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const allFolders = Object.values(folders);

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addFolder({ name: newFolderName.trim(), parent_id: null, position: Date.now() });
    setNewFolderName('');
    setAddingFolder(false);
  };

  const handleAddProject = () => {
    if (!newProjectTitle.trim()) return;
    const project = addProject({
      title: newProjectTitle.trim(),
      notes: '',
      status: 'active',
      type: 'parallel',
      folder_id: null,
      flagged: false,
      defer_date: null,
      due_date: null,
      review_interval_weeks: 1,
      last_reviewed_at: null,
      complete_with_last_action: false,
      position: Date.now(),
      completed_at: null,
    });
    setNewProjectTitle('');
    setAddingProject(false);
    setSelectedProjectId(project.id);
  };

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Left: project tree */}
      <div
        className={`projects-list-panel${selectedProjectId ? ' has-selection' : ''}`}
        style={{ width: '220px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', background: 'var(--sidebar-bg)', flexShrink: 0 }}
      >
        <div style={{ padding: '12px 12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Projects</span>
          <div style={{ display: 'flex', gap: '2px' }}>
            <button
              onClick={() => { setAddingFolder(true); setAddingProject(false); }}
              title="New Folder"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-text)', display: 'flex', padding: '2px' }}
            >
              <FolderPlus size={15} />
            </button>
            <button
              onClick={() => { setAddingProject(true); setAddingFolder(false); }}
              title="New Project"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', display: 'flex', padding: '2px' }}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {addingFolder && (
          <div style={{ padding: '4px 8px' }}>
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddFolder();
                if (e.key === 'Escape') { setAddingFolder(false); setNewFolderName(''); }
              }}
              placeholder="Folder name…"
              style={{ width: '100%', padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--muted-text)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' }}
            />
          </div>
        )}

        {addingProject && (
          <div style={{ padding: '4px 8px' }}>
            <input
              autoFocus
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddProject();
                if (e.key === 'Escape') { setAddingProject(false); setNewProjectTitle(''); }
              }}
              placeholder="Project name…"
              style={{ width: '100%', padding: '5px 8px', borderRadius: '5px', border: '1px solid var(--accent-primary)', background: 'var(--background)', color: 'var(--foreground)', fontSize: '13px', outline: 'none' }}
            />
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <ProjectTree
            projects={activeProjects}
            folders={allFolders}
            selectedProjectId={selectedProjectId}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
            }}
          />
        </div>
      </div>

      {/* Right: tasks */}
      <div
        className={`projects-task-panel${selectedProjectId ? ' has-selection' : ''}`}
        style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {selectedProjectId ? (
          <ProjectTasksView projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />
        ) : (
          <EmptyState
            message="Select a project to view tasks"
            icon={<FolderKanban size={48} />}
          />
        )}
      </div>
    </div>
  );
}
