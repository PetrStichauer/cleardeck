import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Tag, TagsState } from '@/types';
import { generateId } from '@/lib/utils';
import { supabaseClient } from '@/lib/supabase/client';
import { tagFromDB, tagToDB } from '@/lib/supabase/mappers';

interface TagsStore extends TagsState {
  _hasHydrated: boolean;
  loadFromSupabase: () => Promise<void>;
}

export const useTagsStore = create<TagsStore>()(
  immer((set, get) => ({
    tags: {},
    _hasHydrated: false,

    loadFromSupabase: async () => {
      if (get()._hasHydrated) return;
      const { data, error } = await supabaseClient()
        .from('cd_tags')
        .select('*')
        .order('position');
      if (error) console.error('[tags] loadFromSupabase error:', error.message);
      if (data) {
        const tags = data.reduce((acc, row) => {
          acc[row.id] = tagFromDB(row);
          return acc;
        }, {} as Record<string, Tag>);
        set({ tags, _hasHydrated: true });
      }
    },

    addTag: (tagData) => {
      const tag: Tag = { ...tagData, id: generateId() };
      set((state) => {
        state.tags[tag.id] = tag;
      });
      supabaseClient()
        .from('cd_tags')
        .insert(tagToDB(tag))
        .then(({ error }) => {
          if (error) console.error('[tags] addTag error:', error.message, error.code, error.details);
        });
      return tag;
    },

    updateTag: (id, updates) => {
      set((state) => {
        if (state.tags[id]) {
          Object.assign(state.tags[id], updates);
        }
      });
      const updated = get().tags[id];
      if (updated) {
        supabaseClient()
          .from('cd_tags')
          .upsert(tagToDB(updated))
          .then(({ error }) => {
            if (error) console.error('[tags] updateTag error:', error.message, error.code, error.details);
          });
      }
    },

    deleteTag: (id) => {
      set((state) => {
        delete state.tags[id];
      });
      supabaseClient()
        .from('cd_tags')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('[tags] deleteTag error:', error.message, error.code, error.details);
        });
    },
  }))
);
