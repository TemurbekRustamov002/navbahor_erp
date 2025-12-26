import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isExpanded: boolean;
  isHovered: boolean;
  setExpanded: (expanded: boolean) => void;
  setHovered: (hovered: boolean) => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isExpanded: true,
      isHovered: false,
      setExpanded: (expanded: boolean) => set({ isExpanded: expanded }),
      setHovered: (hovered: boolean) => set({ isHovered: hovered }),
      toggle: () => set({ isExpanded: !get().isExpanded }),
    }),
    {
      name: 'sidebar-state',
      partialize: (state) => ({ isExpanded: state.isExpanded }),
    }
  )
);