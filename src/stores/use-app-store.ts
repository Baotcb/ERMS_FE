import { create } from 'zustand'

interface AppState {
    // UI States
    isLoading: boolean
    isSidebarOpen: boolean
    isMobileSidebarOpen: boolean

    // Actions
    setIsLoading: (loading: boolean) => void
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    toggleMobileSidebar: () => void
    setMobileSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
    // Initial states
    isLoading: false,
    isSidebarOpen: true,
    isMobileSidebarOpen: false,

    // Actions
    setIsLoading: (loading) => set({ isLoading: loading }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    toggleMobileSidebar: () =>
        set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
    setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
}))
