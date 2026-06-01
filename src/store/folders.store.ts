import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Folder, FoldersState } from '@/types';
import { generateId } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase/client';
import { folderFromDB, folderToDB } from '@/lib/supabase/mappers';

interface FoldersStore extends FoldersState {
  _hasHydrated: boolean;
  loadFromSupabase: () => Promise<void>;
}

export const useFoldersStore = create<FoldersStore>()(
  immer((set, get) => ({
    folders: {},
    _hasHydrated: false,

    loadFromSupabase: async () => {
      if (get()._hasHydrated) return;
      const { data, error } = await supabaseClient()
        .from('cd_folders')
        .select('*')
        .order('position');
      if (error) console.error('[folders] loadFromSupabase error:', error.message);
      if (data) {
        const folders = data.reduce((acc, row) => {
          acc[row.id] = folderFromDB(row);
          return acc;
        }, {} as Record<string, Folder>);
        set({ folders, _hasHydrated: true });
      }
    },

    addFolder: (folderData) => {
      const folder: Folder = { ...folderData, id: generateId() };
      set((state) => {
        state.folders[folder.id] = folder;
      });
      supabaseClient()
        .from('cd_folders')
        .insert(folderToDB(folder))
        .then(({ error }) => {
          if (error) console.error('[folders] addFolder error:', error.message, error.code, error.details);
        });
      return folder;
    },

    updateFolder: (id, updates) => {
      set((state) => {
        if (state.folders[id]) {
          Object.assign(state.folders[id], updates);
        }
      });
      const updated = get().folders[id];
      if (updated) {
        supabaseClient()
          .from('cd_folders')
          .upsert(folderToDB(updated))
          .then(({ error }) => {
            if (error) console.error('[folders] updateFolder error:', error.message, error.code, error.details);
          });
      }
    },

    deleteFolder: (id) => {
      set((state) => {
        delete state.folders[id];
      });
      supabaseClient()
        .from('cd_folders')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[folders] deleteFolder error:', error.message, error.code, error.details);
        });
    },
  }))
);
