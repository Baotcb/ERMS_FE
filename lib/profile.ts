import { api } from './api'
import type { UserProfile, UpdateProfileData } from '@/types'

export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    return api.get<UserProfile>('/User/profile')
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    return api.put<UserProfile>('/User/profile', data)
  },
}
