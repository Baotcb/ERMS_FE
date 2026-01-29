/**
 * User Profile API Service
 * Handles user profile API calls with proper error handling and sanitization
 */

import { config } from '@/config'
import { handleApiResponse } from '@/utils/error-handler'
import { apiClient } from '@/lib/api-client'

export interface UserProfileDto {
  userName: string
  email: string
  fullName: string
  dateOfBirth?: string
  hometown?: string
  phones?: string
  departmentId?: number
  departmentName?: string
  status: number
  dateJoined: string
}

export interface ChangeProfileRequest {
  fullName: string
  dateOfBirth?: string
  hometown?: string
  phones?: string
}



/**
 * Get user profile
 */
export async function getProfile(): Promise<UserProfileDto> {
  const response = await apiClient.get('/api/User/profile')
  return handleApiResponse<UserProfileDto>(response, 'Failed to fetch profile')
}

/**
 * Update user profile
 */
export async function updateProfile(
  data: ChangeProfileRequest
): Promise<UserProfileDto> {
  // Sanitize input data - only send necessary fields
  const sanitizedData = {
    fullName: data.fullName.trim(),
    dateOfBirth: data.dateOfBirth,
    hometown: data.hometown?.trim(),
    phones: data.phones?.trim(),
  }

  const response = await apiClient.put('/api/User/profile', sanitizedData)

  return handleApiResponse<UserProfileDto>(
    response,
    'Failed to update profile'
  )
}
