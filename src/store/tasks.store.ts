import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Task, TasksState } from '@/types';
import { generateId } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase/client';
import { taskFromDB, taskToDB } from '@/lib/supabase/mappers';

interface TasksStore extends TasksState {
  _hasHydrated: boolean;
  loadFromSupabase: () => Promise<void>;
}

export const useTasksStore = create<TasksStore>()(
  immer((set, get) => ({
    tasks: {},
    _hasHydrated: false,

    loadFromSupabase: async () => {
      if (get()._hasHydrated) return;
      const { data, error } = await supabaseClient()
        .from('tasks')
        .select('*')
        .order('position');
      if (error) {
        console.error('[tasks] loadFromSupabase error:', error.message, error.code, error.details);
      }
      const tasks = (data ?? []).reduce((acc, row) => {
        acc[row.id] = taskFromDB(row);
        return acc;
      }, {} as Record<string, Task>);
      set({ tasks, _hasHydrated: true });
    },

    addTask: (taskData) => {
      const now = new Date().toISOString();
      const task: Task = {
        ...taskData,
        id: generateId(),
        created_at: now,
        updated_at: now,
      };
      set((state) => {
        state.tasks[task.id] = task;
      });
      supabaseClient()
        .from('tasks')
        .insert(taskToDB(task))
        .then(({ error }) => {
          if (error) console.error('[tasks] addTask error:', error.message, error.code, error.details);
        });
      return task;
    },

    updateTask: (id, updates) => {
      const now = new Date().toISOString();
      set((state) => {
        if (state.tasks[id]) {
          Object.assign(state.tasks[id], updates, { updated_at: now });
        }
      });
      const updated = get().tasks[id];
      if (updated) {
        supabaseClient()
          .from('tasks')
          .upsert(taskToDB(updated))
          .then(({ error }) => {
            if (error) console.error('[tasks] updateTask error:', error.message, error.code, error.details);
          });
      }
    },

    deleteTask: (id) => {
      set((state) => {
        delete state.tasks[id];
      });
      supabaseClient()
        .from('tasks')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[tasks] deleteTask error:', error.message, error.code, error.details);
        });
    },

    completeTask: (id) => {
      const now = new Date().toISOString();
      set((state) => {
        if (state.tasks[id]) {
          state.tasks[id].status = 'completed';
          state.tasks[id].completed_at = now;
          state.tasks[id].updated_at = now;
        }
      });
      const updated = get().tasks[id];
      if (updated) {
        supabaseClient()
          .from('tasks')
          .upsert(taskToDB(updated))
          .then(({ error }) => {
            if (error) console.error('[tasks] completeTask error:', error.message, error.code, error.details);
          });
      }
    },

    dropTask: (id) => {
      const now = new Date().toISOString();
      set((state) => {
        if (state.tasks[id]) {
          state.tasks[id].status = 'dropped';
          state.tasks[id].dropped_at = now;
          state.tasks[id].updated_at = now;
        }
      });
      const updated = get().tasks[id];
      if (updated) {
        supabaseClient()
          .from('tasks')
          .upsert(taskToDB(updated))
          .then(({ error }) => {
            if (error) console.error('[tasks] dropTask error:', error.message, error.code, error.details);
          });
      }
    },

    reactivateTask: (id) => {
      set((state) => {
        if (state.tasks[id]) {
          state.tasks[id].status = 'active';
          state.tasks[id].completed_at = null;
          state.tasks[id].dropped_at = null;
          state.tasks[id].updated_at = new Date().toISOString();
        }
      });
      const updated = get().tasks[id];
      if (updated) {
        supabaseClient()
          .from('tasks')
          .upsert(taskToDB(updated))
          .then(({ error }) => {
            if (error) console.error('[tasks] reactivateTask error:', error.message, error.code, error.details);
          });
      }
    },
  }))
);
