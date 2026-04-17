'use client'

import { memo } from 'react'
import {
    Edit2,
    Trash2,
    MoreVertical,
    Building2,
    Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
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
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600">Chưa có phòng ban</h3>
                <p className="text-slate-400 mt-2">Tạo phòng ban đầu tiên để bắt đầu</p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Phòng ban
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Mã
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Nhân viên
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Trạng thái
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Thao tác
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
                {departments.map((dept) => (
                    <TableRow key={dept.id} className="hover:bg-sky-50/30 transition-colors group">
                        <TableCell className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-[#0369A1]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[#0C4A6E] text-sm">{dept.departmentName}</p>
                                    {dept.parentDepartmentName && (
                                        <p className="text-xs text-slate-400 mt-0.5">thuộc {dept.parentDepartmentName}</p>
                                    )}
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-sm text-slate-600">
                            {dept.departmentCode || '-'}
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-center">
                            <div className="flex items-center justify-center gap-1">
                                <Users className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600">{dept.employeeCount}</span>
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-center">
                            <span className={cn(
                                'inline-flex items-center justify-center min-w-[90px] px-2.5 py-1 rounded-full text-xs font-medium border',
                                dept.isActive
                                    ? 'bg-green-100 border-green-200/50 text-green-700'
                                    : 'bg-slate-100 border-slate-200/50 text-slate-600'
                            )}>
                                <span className={cn(
                                    'w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0',
                                    dept.isActive ? 'bg-green-500' : 'bg-slate-400'
                                )} />
                                {dept.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-[#0369A1] p-2 rounded-full hover:bg-sky-50 transition-colors cursor-pointer"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
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
    )
})

