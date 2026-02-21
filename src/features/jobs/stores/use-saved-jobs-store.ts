
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Job } from '../types'
import { STORAGE_KEYS } from '@/utils/constants'
import { apiClient } from '@/lib/api-client'

interface SavedJobsState {
    savedJobs: Job[]
    saveJob: (job: Job) => void
    removeJob: (jobId: string) => void
    isSaved: (jobId: string) => boolean
}

export const useSavedJobsStore = create<SavedJobsState>()(
    persist(
        (set, get) => ({
            savedJobs: [],
            saveJob: (job) => {
                const { savedJobs } = get()
                if (!savedJobs.some((j) => j.id === job.id)) {
                    set({ savedJobs: [job, ...savedJobs] })
                    // Sync với backend (fire-and-forget, không block UI)
                    apiClient.post('/api/job-postings/savejob', { jobPostingId: job.id })
                        .catch(() => {
                            // Ignore errors - localStorage đã lưu rồi
                            // API có thể fail nếu user chưa đăng nhập hoặc không phải Candidate
                        })
                }
            },
            removeJob: (jobId) => {
                set((state) => ({
                    savedJobs: state.savedJobs.filter((job) => job.id !== jobId),
                }))
            },
            isSaved: (jobId) => {
                return get().savedJobs.some((job) => job.id === jobId)
            },
        }),
        {
            name: STORAGE_KEYS.SAVED_JOBS,
        }
    )
)
