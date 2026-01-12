/**
 * User Profile API Service
 * Handles user profile API calls with proper error handling and sanitization
 */

import { config } from '@/config'
import { handleApiResponse } from '@/utils/error-handler'

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

const API_BASE = config.apiUrl

/**
 * Get user profile
 */
export async function getProfile(token: string): Promise<UserProfileDto> {
  const response = await fetch(`${API_BASE}/api/User/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  return handleApiResponse<UserProfileDto>(response, 'Failed to fetch profile')
}

/**
 * Update user profile
 */
export async function updateProfile(
  token: string,
  data: ChangeProfileRequest
): Promise<UserProfileDto> {
  // Sanitize input data - only send necessary fields
  const sanitizedData = {
    fullName: data.fullName.trim(),
    dateOfBirth: data.dateOfBirth,
    hometown: data.hometown?.trim(),
    phones: data.phones?.trim(),
  }

  const response = await fetch(`${API_BASE}/api/User/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(sanitizedData),
  })

  return handleApiResponse<UserProfileDto>(
    response,
    'Failed to update profile'
  )
}
