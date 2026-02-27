'use client'

import { memo } from 'react'
import {
    Edit2,
    Trash2,
    User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Employee } from '@/features/hr/api/employee-service'

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

// Status badge configuration
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    'Active': { bg: 'bg-green-100 border-green-200/50', text: 'text-green-700', dot: 'bg-green-500', label: 'Đang làm' },
    'Probation': { bg: 'bg-amber-100 border-amber-200/50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Thử việc' },
    'OnLeave': { bg: 'bg-red-100 border-red-200/50', text: 'text-red-700', dot: 'bg-red-500', label: 'Nghỉ phép' },
    'Inactive': { bg: 'bg-slate-100 border-slate-200/50', text: 'text-slate-600', dot: 'bg-slate-400', label: 'Đã nghỉ' },
}

function getStatusConfig(status: string) {
    return STATUS_CONFIG[status] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: status }
}

// Get initials from full name (last 2 parts)
function getInitials(fullName: string): string {
    return fullName.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
}

export const EmployeeTable = memo(function EmployeeTable({
    employees,
    onEdit,
    onDelete
}: EmployeeTableProps) {

    if (employees.length === 0) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600">Chưa có nhân viên</h3>
                <p className="text-slate-400 mt-2">Thêm nhân viên đầu tiên để bắt đầu</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="px-6 py-4 min-w-[280px] text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Nhân viên
                            </TableHead>
                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Mã NV
                            </TableHead>
                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Phòng ban
                            </TableHead>
                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Chức vụ
                            </TableHead>
                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Trạng thái
                            </TableHead>
                            <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-50 text-sm">
                        {employees.map((emp) => {
                            const statusCfg = getStatusConfig(emp.status)

                            return (
                                <TableRow
                                    key={emp.id}
                                    className="group hover:bg-sky-50/30 transition-colors"
                                >
                                    <TableCell className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0369A1] to-[#0EA5E9] flex items-center justify-center ring-2 ring-white">
                                                <span className="text-white font-bold text-xs">
                                                    {getInitials(emp.fullName)}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[#0C4A6E] font-semibold text-sm">{emp.fullName}</span>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    <span>{emp.email}</span>
                                                    {emp.phone && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                            <span>{emp.phone}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 align-middle font-medium text-slate-600 text-sm">
                                        {emp.employeeCode}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 align-middle text-sm text-slate-600">
                                        {emp.departmentName}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 align-middle text-sm text-slate-600">
                                        {emp.position || '-'}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 align-middle">
                                        <span className={cn(
                                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                                            statusCfg.bg, statusCfg.text
                                        )}>
                                            <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', statusCfg.dot)} />
                                            {statusCfg.label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 align-middle text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => onEdit?.(emp)}
                                                className="p-2 text-slate-400 hover:text-[#0369A1] hover:bg-sky-50 rounded-full transition-colors cursor-pointer"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete?.(emp)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
})
