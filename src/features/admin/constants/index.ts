import {
  BarChart3,
  Bot,
  Building2,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'

import type { EnterpriseStatus } from '../types'

export interface AdminNavItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export interface AdminQuickLink {
  title: string
  href: string
  description: string
  icon: LucideIcon
  tone: 'indigo' | 'green' | 'amber' | 'red' | 'gray'
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    title: 'Admin Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Trung tâm xử lý việc hằng ngày',
  },
  {
    title: 'Quản lý doanh nghiệp',
    href: '/admin/enterprises',
    icon: Building2,
    description: 'Danh sách và quản trị tenant',
  },
  {
    title: 'Thanh toán & Gói dịch vụ',
    href: '/admin/payments',
    icon: CreditCard,
    description: 'Lịch sử subscription toàn nền tảng',
  },
  {
    title: 'AI Services',
    href: '/admin/ai-services',
    icon: Bot,
    description: 'Gemini config và usage thực tế',
  },
  {
    title: 'Platform Dashboard',
    href: '/admin/platform',
    icon: BarChart3,
    description: 'KPI kinh doanh và tăng trưởng',
  },
]

export const ADMIN_QUICK_LINKS: AdminQuickLink[] = [
  {
    title: 'Doanh nghiệp',
    href: '/admin/enterprises',
    description: 'Tìm kiếm và xử lý tenant',
    icon: Building2,
    tone: 'indigo',
  },
  {
    title: 'Thanh toán',
    href: '/admin/payments',
    description: 'Xem lịch sử và đối soát gói',
    icon: CreditCard,
    tone: 'green',
  },
  {
    title: 'AI Services',
    href: '/admin/ai-services',
    description: 'Theo dõi Gemini và CV scoring',
    icon: Bot,
    tone: 'amber',
  },
  {
    title: 'Platform KPI',
    href: '/admin/platform',
    description: 'Xem MRR, renewal và churn',
    icon: BarChart3,
    tone: 'gray',
  },
]

export const ENTERPRISE_STATUS_LABELS: Record<EnterpriseStatus, string> = {
  Active: 'Hoạt động',
  Suspended: 'Tạm dừng',
  Locked: 'Đã khóa',
  Inactive: 'Ngừng HĐ',
}

export const ENTERPRISE_STATUS_COLORS: Record<
  EnterpriseStatus,
  { bg: string; text: string; dot: string }
> = {
  Active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  Suspended: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  Locked: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  Inactive: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' },
}

export const QUICK_LINK_TARGETS = {
  dashboard: '/admin/dashboard',
  enterprises: '/admin/enterprises',
  payments: '/admin/payments',
  aiServices: '/admin/ai-services',
  platform: '/admin/platform',
} as const
