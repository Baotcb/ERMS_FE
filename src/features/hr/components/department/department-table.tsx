'use client'

import { memo } from 'react'
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
            <Table>
                <TableHeader className="bg-gray-50">
                    <TableRow>
                        <TableHead className="px-6">Phòng ban</TableHead>
                        <TableHead className="px-6">Mã</TableHead>
                        <TableHead className="px-6">Quản lý</TableHead>
                        <TableHead className="px-6 text-center">Nhân viên</TableHead>
                        <TableHead className="px-6 text-center">Trạng thái</TableHead>
                        <TableHead className="px-6 text-right">Thao tác</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {departments.map((dept) => (
                        <TableRow key={dept.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="px-6 py-4">
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
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <span className="text-sm text-gray-600">{dept.departmentCode || '-'}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                                <span className="text-sm text-gray-600">{dept.managerName || '-'}</span>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">{dept.employeeCount}</span>
                                </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-center">
                                <span className={cn(
                                    'inline-flex px-3 py-1 rounded-full text-xs font-medium',
                                    dept.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                )}>
                                    {dept.isActive ? 'Hoạt động' : 'Tạm dừng'}
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
                                            onClick={() => onEdit?.(dept)}
                                            className="cursor-pointer"
                                        >
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            <span>Chỉnh sửa</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => onDelete?.(dept)}
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
