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
  avatarUrl?: string | null;
  dateJoined: string;
}

export interface ChangeProfileRequest {
  fullName: string;
  dateOfBirth?: string;
  hometown?: string;
  phones?: string;
  avatarUrl?: string | null;
}

/**
 * Get user profile from server
 */
export async function getProfileServer(): Promise<UserProfileDto> {
  return serverFetch<UserProfileDto>('/api/User/profile', { requireAuth: true });
}

