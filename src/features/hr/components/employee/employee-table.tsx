'use client'

import { memo, useState, useCallback } from 'react'
import {
    Edit2,
    Trash2,
    MoreHorizontal,
    User,
    Mail,
    Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Employee } from '@/features/hr/api/employee-service'

interface EmployeeTableProps {
    employees: Employee[]
    onEdit?: (employee: Employee) => void
    onDelete?: (employee: Employee) => void
}

export const EmployeeTable = memo(function EmployeeTable({
    employees,
    onEdit,
    onDelete
}: EmployeeTableProps) {
    const [activeMenu, setActiveMenu] = useState<string | null>(null)

    const toggleMenu = useCallback((id: string) => {
        setActiveMenu(prev => prev === id ? null : id)
    }, [])

    if (employees.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center">
                <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">Chưa có nhân viên</h3>
                <p className="text-gray-400 mt-2">Thêm nhân viên đầu tiên để bắt đầu</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Nhân viên</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Mã NV</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phòng ban</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Chức vụ</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Trạng thái</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center">
                                            <span className="text-white font-semibold text-sm">
                                                {emp.fullName.split(' ').map(n => n[0]).slice(-2).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{emp.fullName}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {emp.email}
                                                </span>
                                                {emp.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {emp.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-mono text-gray-600">{emp.employeeCode}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">{emp.departmentName}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-gray-600">{emp.position || '-'}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={cn(
                                        'inline-flex px-3 py-1 rounded-full text-xs font-medium',
                                        emp.status === 'Active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                    )}>
                                        {emp.status === 'Active' ? 'Đang làm' : emp.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleMenu(emp.id)}
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>

                                        {activeMenu === emp.id && (
                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                                                <button
                                                    onClick={() => {
                                                        onEdit?.(emp)
                                                        setActiveMenu(null)
                                                    }}
                                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Chỉnh sửa
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        onDelete?.(emp)
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
