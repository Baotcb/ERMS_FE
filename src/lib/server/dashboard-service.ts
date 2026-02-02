/**
 * Server-Side Dashboard Service
 * Handles dashboard stats data fetching from server
 */

import { serverFetch } from '../server-fetch';

export interface DashboardStats {
  totalEmployees: number;
  activeJobs: number;
  newCVs: number;
  interviewsToday: number;
}

/**
 * Get dashboard statistics from server
 */
export async function getDashboardStatsServer(): Promise<DashboardStats> {
  try {
    return serverFetch<DashboardStats>('/api/Dashboard/stats', { requireAuth: true });
  } catch {
    // Return default stats if API fails
    return {
      totalEmployees: 0,
      activeJobs: 0,
      newCVs: 0,
      interviewsToday: 0,
    };
  }
}
