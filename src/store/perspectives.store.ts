import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { CustomPerspective, PerspectivesState } from '@/types';
import { generateId } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase/client';
import { perspectiveFromDB, perspectiveToDB } from '@/lib/supabase/mappers';

interface PerspectivesStore extends PerspectivesState {
  _hasHydrated: boolean;
  loadFromSupabase: () => Promise<void>;
}

export const usePerspectivesStore = create<PerspectivesStore>()(
  immer((set, get) => ({
    perspectives: {},
    _hasHydrated: false,

    loadFromSupabase: async () => {
      if (get()._hasHydrated) return;
      const { data, error } = await supabaseClient()
        .from('cd_perspectives')
        .select('*')
        .order('position');
      if (error) console.error('[perspectives] loadFromSupabase error:', error.message);
      if (data) {
        const perspectives = data.reduce((acc, row) => {
          acc[row.id] = perspectiveFromDB(row);
          return acc;
        }, {} as Record<string, CustomPerspective>);
        set({ perspectives, _hasHydrated: true });
      }
    },

    addPerspective: (perspectiveData) => {
      const now = new Date().toISOString();
      const perspective: CustomPerspective = {
        ...perspectiveData,
        id: generateId(),
        created_at: now,
        updated_at: now,
      };
      set((state) => {
        state.perspectives[perspective.id] = perspective;
      });
      supabaseClient()
        .from('cd_perspectives')
        .insert(perspectiveToDB(perspective))
        .then(({ error }) => {
          if (error) console.error('[perspectives] addPerspective error:', error.message, error.code, error.details);
        });
      return perspective;
    },

    updatePerspective: (id, updates) => {
      const now = new Date().toISOString();
      set((state) => {
        if (state.perspectives[id]) {
          Object.assign(state.perspectives[id], updates, { updated_at: now });
        }
      });
      const updated = get().perspectives[id];
      if (updated) {
        supabaseClient()
          .from('cd_perspectives')
          .upsert(perspectiveToDB(updated))
          .then(({ error }) => {
            if (error) console.error('[perspectives] updatePerspective error:', error.message, error.code, error.details);
          });
      }
    },

    deletePerspective: (id) => {
      set((state) => {
        delete state.perspectives[id];
      });
      supabaseClient()
        .from('cd_perspectives')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[perspectives] deletePerspective error:', error.message, error.code, error.details);
        });
    },
  }))
);
