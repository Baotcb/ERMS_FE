import { create } from 'zustand'

interface AppState {
    // UI States
    isLoading: boolean
    isSidebarOpen: boolean

    // Actions
    setIsLoading: (loading: boolean) => void
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
    // Initial states
    isLoading: false,
    isSidebarOpen: true,

    // Actions
    setIsLoading: (loading) => set({ isLoading: loading }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
}))
