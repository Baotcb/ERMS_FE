import {
    CalendarCheck,
    CalendarRange,
    FileText,
    GraduationCap,
    LayoutDashboard,
    PenSquare,
    Search,
    Users,
    type LucideIcon,
} from 'lucide-react'
import { USER_ROLES } from '@/utils/constants'

export interface HRNavItem {
    label: string
    href?: string
    icon: LucideIcon
    children?: { label: string; href: string }[]
    roles?: string[]
}

export interface HRQuickAction {
    href: string
    icon: LucideIcon
    label: string
    roles?: string[]
}

export const HR_NAV_ITEMS: HRNavItem[] = [
    {
        label: 'Dashboard',
        href: '/enterprise/hr/dashboard',
        icon: LayoutDashboard,
        roles: [],
    },
    {
        label: 'Nhân sự',
        icon: Users,
        roles: [USER_ROLES.HR_MANAGER, USER_ROLES.DIRECTOR, USER_ROLES.DEPARTMENT_HEAD],
        children: [
            { label: 'Phòng ban', href: '/enterprise/hr/departments' },
            { label: 'Nhân viên', href: '/enterprise/hr/employees' },
        ],
    },
    {
        label: 'Tuyển dụng',
        icon: CalendarRange,
        roles: [USER_ROLES.HR_MANAGER, USER_ROLES.DIRECTOR],
        children: [
            { label: 'Tin tuyển dụng', href: '/enterprise/hr/job-postings' },
            { label: 'Chiến dịch tuyển dụng', href: '/enterprise/hr/recruitment-campaigns' },
        ],
    },
    {
        label: 'Phỏng vấn',
        href: '/enterprise/hr/interviews',
        icon: CalendarCheck,
        roles: [USER_ROLES.HR_MANAGER],
    },
    {
        label: 'Quản lý Offer',
        href: '/enterprise/hr/offers',
        icon: FileText,
        roles: [USER_ROLES.HR_MANAGER],
    },
    {
        label: 'Đào tạo',
        icon: GraduationCap,
        roles: [USER_ROLES.HR_MANAGER, USER_ROLES.HR, USER_ROLES.DIRECTOR, USER_ROLES.ADMIN],
        children: [
            { label: 'Kế hoạch đào tạo', href: '/enterprise/hr/training/plans' },
            { label: 'Danh sách khóa học', href: '/enterprise/hr/training/courses' },
            { label: 'Yêu cầu đào tạo', href: '/enterprise/hr/training/requests' },
            { label: 'Thông báo & Mở lịch', href: '/enterprise/hr/training/schedule' },
            { label: 'Quản lý Workshop', href: '/enterprise/hr/training/workshop' },
            { label: 'Quản lý bài giảng', href: '/enterprise/hr/teaching' },
        ],
    },
]

export const HR_QUICK_ACTIONS: HRQuickAction[] = [
    {
        href: '/enterprise/hr/job-postings',
        icon: PenSquare,
        label: 'Đăng tin',
        roles: [USER_ROLES.HR_MANAGER, USER_ROLES.DIRECTOR],
    },
    {
        href: '/enterprise/hr/employees',
        icon: Search,
        label: 'Tìm CV',
        roles: [USER_ROLES.HR_MANAGER, USER_ROLES.DIRECTOR, USER_ROLES.DEPARTMENT_HEAD],
    },
    {
        href: '/enterprise/hr/departments',
        icon: Users,
        label: 'Phòng ban',
        roles: [USER_ROLES.HR_MANAGER, USER_ROLES.DIRECTOR, USER_ROLES.DEPARTMENT_HEAD],
    },
]

export function filterItemsByRole<T extends { roles?: string[] }>(
    items: readonly T[],
    role?: string
): T[] {
    const currentRole = role || ''

    return items.filter((item) => {
        if (!item.roles || item.roles.length === 0) {
            return true
        }

        return item.roles.includes(currentRole)
    })
}
