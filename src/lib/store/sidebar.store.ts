import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SidebarGroup } from '../types/sidebar.type';

interface SidebarStore {
  groups: SidebarGroup[];
  openGroupIds: string[];
  isCollapsed: boolean;
  selectedItemId: string | null;

  // Actions
  setGroups: (groups: SidebarGroup[]) => void;
  openGroup: (groupId: string) => void;
  closeGroup: (groupId: string) => void;
  toggleGroup: (groupId: string) => void;
  toggleCollapse: () => void;
  selectItem: (itemId: string) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      // Default values
      groups: [],
      openGroupIds: [],
      isCollapsed: false,
      selectedItemId: null,

      // Actions
      setGroups: groups => set({ groups }),

      openGroup: groupId =>
        set(state => ({
          openGroupIds: Array.from(new Set([...state.openGroupIds, groupId])),
        })),

      closeGroup: groupId =>
        set(state => ({
          openGroupIds: state.openGroupIds.filter(id => id !== groupId),
        })),

      toggleGroup: groupId => {
        const { openGroupIds, openGroup, closeGroup } = get();
        if (openGroupIds.includes(groupId)) {
          closeGroup(groupId);
        } else {
          openGroup(groupId);
        }
      },

      toggleCollapse: () => set(state => ({ isCollapsed: !state.isCollapsed })),

      selectItem: itemId => set({ selectedItemId: itemId }),
    }),
    {
      name: 'sidebar-store',
      // Saving only the necessary data
      partialize: state => ({
        openGroupIds: state.openGroupIds,
        isCollapsed: state.isCollapsed,
        selectedItemId: state.selectedItemId,
      }),
    },
  ),
);
