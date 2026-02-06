'use client'

import { memo } from 'react'
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
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

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
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="px-6">Nhân viên</TableHead>
                        <TableHead className="px-6">Mã NV</TableHead>
                        <TableHead className="px-6">Phòng ban</TableHead>
                        <TableHead className="px-6">Chức vụ</TableHead>
                        <TableHead className="px-6 text-center">Trạng thái</TableHead>
                        <TableHead className="px-6 text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((emp) => (
                        <TableRow key={emp.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="px-6 py-4">
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
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <span className="text-sm font-mono text-gray-600">{emp.employeeCode}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <span className="text-sm text-gray-600">{emp.departmentName}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <span className="text-sm text-gray-600">{emp.position || '-'}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center">
                                <span className={cn(
                                    'inline-flex px-3 py-1 rounded-full text-xs font-medium',
                                    emp.status === 'Active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                )}>
                                    {emp.status === 'Active' ? 'Đang làm' : emp.status}
                                </span>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                        >
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem
                                            onClick={() => onEdit?.(emp)}
                                            className="cursor-pointer"
                                        >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            <span>Chỉnh sửa</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete?.(emp)}
                                            className="cursor-pointer text-red-600 focus:text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Xóa</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
})
