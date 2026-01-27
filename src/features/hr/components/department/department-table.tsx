'use client'

import { memo, useState, useCallback } from 'react'
import {
    Edit2,
    Trash2,
    MoreHorizontal,
    Building2,
    Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Department } from '@/features/hr/api/department-service'

interface DepartmentTableProps {
    departments: Department[]
    onEdit?: (department: Department) => void
    onDelete?: (department: Department) => void
}

export const DepartmentTable = memo(function DepartmentTable({
    departments,
    onEdit,
    onDelete
}: DepartmentTableProps) {
    const [activeMenu, setActiveMenu] = useState<number | null>(null)

    const toggleMenu = useCallback((id: number) => {
        setActiveMenu(prev => prev === id ? null : id)
    }, [])

    if (departments.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center">
                <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">Chưa có phòng ban</h3>
                <p className="text-gray-400 mt-2">Tạo phòng ban đầu tiên để bắt đầu</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phòng ban</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Mã</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Quản lý</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Nhân viên</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Trạng thái</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {departments.map((dept) => (
                            <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#BBE1FA] to-[#BBE1FA]/50 flex items-center justify-center">
                                            <Building2 className="w-5 h-5 text-[#0F4C75]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{dept.departmentName}</p>
                                            {dept.parentDepartmentName && (
                                                <p className="text-xs text-gray-400">thuộc {dept.parentDepartmentName}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">{dept.departmentCode || '-'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">{dept.managerName || '-'}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-600">{dept.employeeCount}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={cn(
                                        'inline-flex px-3 py-1 rounded-full text-xs font-medium',
                                        dept.isActive
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                    )}>
                                        {dept.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleMenu(dept.id)}
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>

                                        {activeMenu === dept.id && (
                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                                                <button
                                                    onClick={() => {
                                                        onEdit?.(dept)
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onDelete?.(dept)
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Xóa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
})
