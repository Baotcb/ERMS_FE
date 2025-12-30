import { api } from '@/lib/api'
import type { UserProfile, UpdateProfileData } from '@/types'

export const profileApi = {
    // Get user profile
    getProfile: async (): Promise<UserProfile> => {
        return api.get<UserProfile>('/api/User/profile')
    },

    // Update user profile
    updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
        return api.put<UserProfile>('/api/User/profile', data)
    },
}
