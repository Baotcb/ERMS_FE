import { create } from 'zustand'
import {
    saveJobPosting,
    unsaveJobPosting,
    getMySavedPosts,
} from '../api/saved-job-service'

interface SavedJobsState {
    /** Set of jobPostingIds that are currently saved */
    savedJobIds: Set<string>
    /** Whether the initial fetch has completed */
    isLoaded: boolean
    /** Load saved job IDs from backend */
    fetchSavedJobIds: () => Promise<void>
    /** Save a job (optimistic + API call) */
    saveJob: (jobPostingId: string) => void
    /** Unsave a job (optimistic + API call) */
    removeJob: (jobPostingId: string) => void
    /** Check if a job is saved */
    isSaved: (jobPostingId: string) => boolean
}

export const useSavedJobsStore = create<SavedJobsState>()((set, get) => ({
    savedJobIds: new Set<string>(),
    isLoaded: false,

    fetchSavedJobIds: async () => {
        try {
            const response = await getMySavedPosts(1, 200)
            const ids = new Set(response.items.map((item) => item.jobPostingId))
            set({ savedJobIds: ids, isLoaded: true })
        } catch {
            // Nếu chưa đăng nhập hoặc lỗi → bỏ qua
            set({ isLoaded: true })
        }
    },

    saveJob: (jobPostingId) => {
        const { savedJobIds } = get()
        if (savedJobIds.has(jobPostingId)) return

        // Optimistic update
        const next = new Set(savedJobIds)
        next.add(jobPostingId)
        set({ savedJobIds: next })

        // Sync với backend
        saveJobPosting(jobPostingId).catch(() => {
            // Rollback nếu thất bại
            const rollback = new Set(get().savedJobIds)
            rollback.delete(jobPostingId)
            set({ savedJobIds: rollback })
        })
    },

    removeJob: (jobPostingId) => {
        const { savedJobIds } = get()
        if (!savedJobIds.has(jobPostingId)) return

        // Optimistic update
        const next = new Set(savedJobIds)
        next.delete(jobPostingId)
        set({ savedJobIds: next })

        // Sync với backend
        unsaveJobPosting(jobPostingId).catch(() => {
            // Rollback nếu thất bại
            const rollback = new Set(get().savedJobIds)
            rollback.add(jobPostingId)
            set({ savedJobIds: rollback })
        })
    },

    isSaved: (jobPostingId) => {
        return get().savedJobIds.has(jobPostingId)
    },
}))
