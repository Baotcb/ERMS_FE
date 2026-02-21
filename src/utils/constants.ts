/**
 * Global Constants
 * Centralized source of truth for application keys and configuration
 */

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_ROLE: 'user_role',
    USER_NAME: 'user_name',
    SAVED_JOBS: 'erms-saved-jobs',
} as const

export const COOKIE_OPTIONS = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
}

export const USER_ROLES = {
    CANDIDATE: 'Candidate',
    HR_MANAGER: 'HRManager',
    DIRECTOR: 'Director',
    HR: 'HR',
    DEPT_HEAD: 'DeptHead',
} as const

export const HR_ROLES = [USER_ROLES.HR_MANAGER, USER_ROLES.DIRECTOR, USER_ROLES.HR] as const
