import { create } from 'zustand'

export const useUiStore = create((set) => ({
  isSidebarOpen: false, // mobile drawer state
  isSidebarCollapsed: false, // desktop collapse state
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleCollapse: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
}))
