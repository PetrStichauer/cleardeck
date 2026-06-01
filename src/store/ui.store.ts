import { create } from 'zustand';
import { SelectedItem, UIState } from '@/types';

export const useUIStore = create<UIState>()((set) => ({
  selectedItem: null,
  inspectorOpen: false,
  quickEntryOpen: false,
  sidebarCollapsed: false,
  mobileNavOpen: false,
  searchQuery: '',
  showDeferred: false,
  notificationsEnabled: false,
  shortcutsOpen: false,
  dataPortabilityOpen: false,

  setSelectedItem: (item: SelectedItem | null) =>
    set({ selectedItem: item, inspectorOpen: item !== null }),

  setInspectorOpen: (open: boolean) => set({ inspectorOpen: open }),

  setQuickEntryOpen: (open: boolean) => set({ quickEntryOpen: open }),

  setSidebarCollapsed: (collapsed: boolean) => set({ sidebarCollapsed: collapsed }),

  setMobileNavOpen: (open: boolean) => set({ mobileNavOpen: open }),

  toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })),

  setSearchQuery: (q: string) => set({ searchQuery: q }),

  setShowDeferred: (show: boolean) => set({ showDeferred: show }),

  setNotificationsEnabled: (enabled: boolean) => set({ notificationsEnabled: enabled }),

  setShortcutsOpen: (open: boolean) => set({ shortcutsOpen: open }),

  setDataPortabilityOpen: (open: boolean) => set({ dataPortabilityOpen: open }),
}));
