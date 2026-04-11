import { create } from 'zustand'

interface AppState {
  isLoading: boolean
  isSidebarOpen: boolean
  isMobileSidebarOpen: boolean
  setIsLoading: (loading: boolean) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleMobileSidebar: () => void
  setMobileSidebarOpen: (open: boolean) => void
}

const initialShellState = {
  isLoading: false,
  isSidebarOpen: true,
  isMobileSidebarOpen: false,
} satisfies Pick<AppState, 'isLoading' | 'isSidebarOpen' | 'isMobileSidebarOpen'>

export const useAppStore = create<AppState>((set) => ({
  ...initialShellState,
  setIsLoading: (loading) => set({ isLoading: loading }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
}))
