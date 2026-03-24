/**
 * Global Constants
 * Centralized source of truth for application keys and configuration
 */

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_ROLE: 'user_role',
    USER_NAME: 'user_name',
    USER_AVATAR: 'user_avatar',
    SAVED_JOBS: 'erms-saved-jobs',
} as const

export const COOKIE_OPTIONS = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
}

// Must match backend AppRoles exactly
export const USER_ROLES = {
    ADMIN: 'Admin',
    DIRECTOR: 'Director',
    HR_MANAGER: 'HRManager',
    HR: 'HR',
    TRAINER: 'Trainer',
    DEPARTMENT_HEAD: 'DepartmentHead',
    EMPLOYEE: 'Employee',
    CANDIDATE: 'Candidate',
} as const

// Role → dashboard redirect mapping
export const ROLE_DASHBOARD_MAP: Record<string, string> = {
    [USER_ROLES.HR_MANAGER]: '/enterprise/hr/dashboard',
    [USER_ROLES.HR]: '/enterprise/hr/dashboard',
    [USER_ROLES.DIRECTOR]: '/enterprise/director/dashboard',
    [USER_ROLES.DEPARTMENT_HEAD]: '/enterprise/dept-head/dashboard',
    [USER_ROLES.EMPLOYEE]: '/enterprise/employee/dashboard',
    // Trainer cũng dùng employee portal (sidebar có section Giảng vụ)
    [USER_ROLES.ADMIN]: '/enterprise/hr/dashboard',
    [USER_ROLES.TRAINER]: '/enterprise/employee/dashboard',
} as const

export const DEFAULT_ENTERPRISE_DASHBOARD =
    ROLE_DASHBOARD_MAP[USER_ROLES.HR_MANAGER]

// Roles that access /enterprise/hr/* portal
export const HR_ROLES = [USER_ROLES.HR_MANAGER, USER_ROLES.HR, USER_ROLES.ADMIN] as const
