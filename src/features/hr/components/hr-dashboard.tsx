'use client'

import { memo } from 'react'
import {
    Users,
    Building2,
    TrendingUp,
    UserPlus,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
    title: string
    value: string | number
    change?: number
    icon: React.ReactNode
    trend?: 'up' | 'down'
}

const StatCard = memo(function StatCard({ title, value, change, icon, trend }: StatCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-[#0F4C75] mt-2">{value}</p>
                    {change !== undefined && (
                        <div className={cn(
                            'flex items-center gap-1 mt-2 text-sm font-medium',
                            trend === 'up' ? 'text-green-600' : 'text-red-500'
                        )}>
                            {trend === 'up' ? (
                                <ArrowUpRight className="w-4 h-4" />
                            ) : (
                                <ArrowDownRight className="w-4 h-4" />
                            )}
                            <span>{Math.abs(change)}% so với tháng trước</span>
                        </div>
                    )}
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#BBE1FA] to-[#BBE1FA]/50">
                    <div className="text-[#0F4C75]">{icon}</div>
                </div>
            </div>
        </div>
    )
})

interface HRDashboardProps {
    stats?: {
        totalEmployees: number
        totalDepartments: number
        newHires: number
        turnoverRate: number
    }
}

export const HRDashboard = memo(function HRDashboard({ stats }: HRDashboardProps) {
    const defaultStats = {
        totalEmployees: stats?.totalEmployees ?? 0,
        totalDepartments: stats?.totalDepartments ?? 0,
        newHires: stats?.newHires ?? 0,
        turnoverRate: stats?.turnoverRate ?? 0
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[#0F4C75]">Dashboard</h1>
                <p className="text-gray-500 mt-1">Tổng quan quản lý nhân sự</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Tổng nhân viên"
                    value={defaultStats.totalEmployees}
                    change={12}
                    trend="up"
                    icon={<Users className="w-6 h-6" />}
                />
                <StatCard
                    title="Phòng ban"
                    value={defaultStats.totalDepartments}
                    icon={<Building2 className="w-6 h-6" />}
                />
                <StatCard
                    title="Nhân viên mới"
                    value={defaultStats.newHires}
                    change={8}
                    trend="up"
                    icon={<UserPlus className="w-6 h-6" />}
                />
                <StatCard
                    title="Tỷ lệ nghỉ việc"
                    value={`${defaultStats.turnoverRate}%`}
                    change={2}
                    trend="down"
                    icon={<TrendingUp className="w-6 h-6" />}
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-[#0F4C75] mb-4">Thao tác nhanh</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/employees/create"
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#0F4C75] to-[#3282B8] text-white hover:shadow-lg transition-all duration-300"
                    >
                        <UserPlus className="w-8 h-8" />
                        <div>
                            <p className="font-semibold">Thêm nhân viên</p>
                            <p className="text-sm opacity-80">Tạo hồ sơ mới</p>
                        </div>
                    </a>
                    <a
                        href="/employees/import"
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#FF7E67] to-[#FF9B8E] text-white hover:shadow-lg transition-all duration-300"
                    >
                        <Users className="w-8 h-8" />
                        <div>
                            <p className="font-semibold">Import Excel</p>
                            <p className="text-sm opacity-80">Nhập hàng loạt</p>
                        </div>
                    </a>
                    <a
                        href="/departments"
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#3282B8] to-[#BBE1FA] text-white hover:shadow-lg transition-all duration-300"
                    >
                        <Building2 className="w-8 h-8" />
                        <div>
                            <p className="font-semibold">Quản lý phòng ban</p>
                            <p className="text-sm opacity-80">Xem & chỉnh sửa</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
})
