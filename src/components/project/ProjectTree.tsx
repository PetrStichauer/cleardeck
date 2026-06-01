'use client';

import { Project, Folder } from '@/types';
import { useUIStore } from '@/store/ui.store';
import { useFoldersStore } from '@/store/folders.store';
import { ChevronRight, ChevronDown, Folder as FolderIcon, FolderKanban, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ProjectTreeProps {
  projects: Project[];
  folders: Folder[];
  selectedProjectId?: string | null;
  onSelectProject: (id: string) => void;
}

function FolderNode({
  folder,
  allFolders,
  projects,
  selectedProjectId,
  onSelectProject,
}: {
  folder: Folder;
  allFolders: Folder[];
  projects: Project[];
  selectedProjectId?: string | null;
  onSelectProject: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const deleteFolder = useFoldersStore((s) => s.deleteFolder);
  const subFolders = allFolders.filter((f) => f.parent_id === folder.id);
  const folderProjects = projects.filter((p) => p.folder_id === folder.id);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete folder "${folder.name}"?`)) {
      deleteFolder(folder.id);
    }
  };

  return (
    <div>
      <div
        onClick={() => setExpanded(!expanded)}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 16px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--muted-text)',
        }}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <FolderIcon size={14} />
        <span style={{ flex: 1 }}>{folder.name}</span>
        {showDelete && (
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--accent-red, #dc2626)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.7,
            }}
            title="Delete folder"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
      {expanded && (
        <div style={{ paddingLeft: '16px' }}>
          {subFolders.map((sf) => (
            <FolderNode
              key={sf.id}
              folder={sf}
              allFolders={allFolders}
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProject={onSelectProject}
            />
          ))}
          {folderProjects.map((p) => (
            <ProjectNode
              key={p.id}
              project={p}
              isSelected={selectedProjectId === p.id}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectNode({
  project,
  isSelected,
  onSelect,
}: {
  project: Project;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      onClick={() => onSelect(project.id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '7px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        background: isSelected ? 'var(--accent-primary-light)' : 'transparent',
        color: isSelected ? 'var(--accent-primary)' : 'var(--foreground)',
        borderRadius: '6px',
        margin: '1px 4px',
        opacity: project.status === 'on_hold' ? 0.55 : 1,
      }}
    >
      <FolderKanban size={14} />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {project.title}
      </span>
      {project.status === 'on_hold' && (
        <span style={{ fontSize: '10px', color: 'var(--muted-text)', background: 'var(--sidebar-border)', padding: '1px 5px', borderRadius: '4px' }}>
          On Hold
        </span>
      )}
    </div>
  );
}

export function ProjectTree({
  projects,
  folders,
  selectedProjectId,
  onSelectProject,
}: ProjectTreeProps) {
  const rootFolders = folders.filter((f) => f.parent_id === null).sort((a, b) => a.position - b.position);
  const unfolderedProjects = projects.filter((p) => p.folder_id === null).sort((a, b) => a.position - b.position);

  return (
    <div style={{ padding: '8px 0' }}>
      {rootFolders.map((folder) => (
        <FolderNode
          key={folder.id}
          folder={folder}
          allFolders={folders}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={onSelectProject}
        />
      ))}
      {unfolderedProjects.map((p) => (
        <ProjectNode
          key={p.id}
          project={p}
          isSelected={selectedProjectId === p.id}
          onSelect={onSelectProject}
        />
      ))}
    </div>
  );
}
