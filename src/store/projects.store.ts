import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Project, ProjectsState } from '@/types';
import { generateId } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase/client';
import { projectFromDB, projectToDB } from '@/lib/supabase/mappers';

interface ProjectsStore extends ProjectsState {
  _hasHydrated: boolean;
  loadFromSupabase: () => Promise<void>;
}

export const useProjectsStore = create<ProjectsStore>()(
  immer((set, get) => ({
    projects: {},
    _hasHydrated: false,

    loadFromSupabase: async () => {
      if (get()._hasHydrated) return;
      const { data, error } = await supabaseClient()
        .from('projects')
        .select('*')
        .order('position');
      if (error) {
        console.error('[projects] loadFromSupabase error:', error.message, error.code, error.details);
      }
      const projects = (data ?? []).reduce((acc, row) => {
        acc[row.id] = projectFromDB(row);
        return acc;
      }, {} as Record<string, Project>);
      set({ projects, _hasHydrated: true });
    },

    addProject: (projectData) => {
      const now = new Date().toISOString();
      const project: Project = {
        ...projectData,
        id: generateId(),
        created_at: now,
        updated_at: now,
      };
      set((state) => {
        state.projects[project.id] = project;
      });
      supabaseClient()
        .from('projects')
        .insert(projectToDB(project))
        .then(({ error }) => {
          if (error) console.error('[projects] addProject error:', error.message, error.code, error.details);
        });
      return project;
    },

    updateProject: (id, updates) => {
      const now = new Date().toISOString();
      set((state) => {
        if (state.projects[id]) {
          Object.assign(state.projects[id], updates, { updated_at: now });
        }
      });
      const updated = get().projects[id];
      if (updated) {
        supabaseClient()
          .from('projects')
          .upsert(projectToDB(updated))
          .then(({ error }) => {
            if (error) console.error('[projects] updateProject error:', error.message, error.code, error.details);
          });
      }
    },

    deleteProject: (id) => {
      set((state) => {
        delete state.projects[id];
      });
      supabaseClient()
        .from('projects')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[projects] deleteProject error:', error.message, error.code, error.details);
        });
    },

    completeProject: (id) => {
      const now = new Date().toISOString();
      set((state) => {
        if (state.projects[id]) {
          state.projects[id].status = 'completed';
          state.projects[id].completed_at = now;
          state.projects[id].updated_at = now;
        }
      });
      const updated = get().projects[id];
      if (updated) {
        supabaseClient()
          .from('projects')
          .upsert(projectToDB(updated))
          .then(({ error }) => {
            if (error) console.error('[projects] completeProject error:', error.message, error.code, error.details);
          });
      }
    },

    markReviewed: (id) => {
      const now = new Date().toISOString();
      set((state) => {
        if (state.projects[id]) {
          state.projects[id].last_reviewed_at = now;
          state.projects[id].updated_at = now;
        }
      });
      const updated = get().projects[id];
      if (updated) {
        supabaseClient()
          .from('projects')
          .upsert(projectToDB(updated))
          .then(({ error }) => {
            if (error) console.error('[projects] markReviewed error:', error.message, error.code, error.details);
          });
      }
    },
  }))
);
