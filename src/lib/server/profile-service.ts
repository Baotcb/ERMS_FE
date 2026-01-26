/**
 * Server-Side Profile Service
 * Handles user profile data fetching from server
 */

import { serverFetch } from '../server-fetch';

export interface UserProfileDto {
  userName: string;
  email: string;
  fullName: string;
  dateOfBirth?: string;
  hometown?: string;
  phones?: string;
  departmentId?: number;
  departmentName?: string;
  status: number;
  dateJoined: string;
}

export interface ChangeProfileRequest {
  fullName: string;
  dateOfBirth?: string;
  hometown?: string;
  phones?: string;
}

/**
 * Get user profile from server
 */
export async function getProfileServer(): Promise<UserProfileDto> {
  return serverFetch<UserProfileDto>('/api/User/profile', { requireAuth: true });
}

/**
 * Update user profile from server
 */
export async function updateProfileServer(
  data: ChangeProfileRequest
): Promise<UserProfileDto> {
  const sanitizedData = {
    fullName: data.fullName.trim(),
    dateOfBirth: data.dateOfBirth,
    hometown: data.hometown?.trim(),
    phones: data.phones?.trim(),
  };

  return serverFetch<UserProfileDto>('/api/User/profile', {
    method: 'PUT',
    body: JSON.stringify(sanitizedData),
    requireAuth: true,
  });
}

/**
 * Change password from server
 */
export async function changePasswordServer(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return serverFetch<void>('/api/Auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
    requireAuth: true,
  });
}
