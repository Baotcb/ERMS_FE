import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { UserProfile, UpdateProfileData } from '@/types'
import { profileApi } from '@/lib/profile'

interface ProfileState {
    profile: UserProfile | null
    isLoading: boolean
    isUpdating: boolean
    error: string | null

    // Actions
    fetchProfile: () => Promise<void>
    updateProfile: (data: UpdateProfileData) => Promise<void>
    clearError: () => void
    reset: () => void
}

export const useProfileStore = create<ProfileState>()(
    devtools(
        (set, get) => ({
            profile: null,
            isLoading: false,
            isUpdating: false,
            error: null,

            fetchProfile: async () => {
                set({ isLoading: true, error: null })
                try {
                    const profile = await profileApi.getProfile()
                    set({ profile, isLoading: false })
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile'
                    set({ error: errorMessage, isLoading: false })
                    throw error
                }
            },

            updateProfile: async (data: UpdateProfileData) => {
                set({ isUpdating: true, error: null })
                try {
                    const updatedProfile = await profileApi.updateProfile(data)
                    set({ profile: updatedProfile, isUpdating: false })
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Failed to update profile'
                    set({ error: errorMessage, isUpdating: false })
                    throw error
                }
            },

            clearError: () => set({ error: null }),

            reset: () => set({
                profile: null,
                isLoading: false,
                isUpdating: false,
                error: null
            }),
        }),
        {
            name: 'profile-store',
        }
    )
)
