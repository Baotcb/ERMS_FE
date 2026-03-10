'use client'

import { memo } from 'react'
import { Edit2, User } from 'lucide-react'
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
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    Active: {
        bg: 'bg-green-100 border-green-200/50',
        text: 'text-green-700',
        dot: 'bg-green-500',
        label: 'Đang làm',
    },
    Probation: {
        bg: 'bg-amber-100 border-amber-200/50',
        text: 'text-amber-700',
        dot: 'bg-amber-500',
        label: 'Thử việc',
    },
    OnLeave: {
        bg: 'bg-red-100 border-red-200/50',
        text: 'text-red-700',
        dot: 'bg-red-500',
        label: 'Nghỉ phép',
    },
    Inactive: {
        bg: 'bg-slate-100 border-slate-200/50',
        text: 'text-slate-600',
        dot: 'bg-slate-400',
        label: 'Đã nghỉ',
    },
}

function getStatusConfig(status: string) {
    return STATUS_CONFIG[status] || {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        dot: 'bg-gray-400',
        label: status,
    }
}

function getInitials(fullName: string): string {
    return fullName
        .split(' ')
        .map((name) => name[0])
        .slice(-2)
        .join('')
        .toUpperCase()
}

export const EmployeeTable = memo(function EmployeeTable({
    employees,
    onEdit,
}: EmployeeTableProps) {
    if (employees.length === 0) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
                <User className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-600">Chưa có nhân viên</h3>
                <p className="mt-2 text-slate-400">Thêm nhân viên đầu tiên để bắt đầu</p>
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="overflow-x-auto">
                <Table className="min-w-[1020px]">
                    <TableHeader>
                        <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                            <TableHead className="min-w-[280px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Nhân viên
                            </TableHead>
                            <TableHead className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Mã NV
                            </TableHead>
                            <TableHead className="min-w-[150px] whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Phòng ban
                            </TableHead>
                            <TableHead className="min-w-[150px] whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Chức vụ
                            </TableHead>
                            <TableHead className="whitespace-nowrap px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                                Trạng thái
                            </TableHead>
                            <TableHead className="min-w-[110px] whitespace-nowrap px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                                Thao tác
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-50 text-sm">
                        {employees.map((employee) => {
                            const statusConfig = getStatusConfig(employee.status)

                            return (
                                <TableRow
                                    key={employee.id}
                                    className="group transition-colors hover:bg-sky-50/30"
                                >
                                    <TableCell className="px-6 py-4 align-middle">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#0369A1] to-[#0EA5E9] ring-2 ring-white">
                                                <span className="text-xs font-bold text-white">
                                                    {getInitials(employee.fullName)}
                                                </span>
                                            </div>
                                            <div className="flex min-w-0 flex-col">
                                                <span className="text-sm font-semibold text-[#0C4A6E]">
                                                    {employee.fullName}
                                                </span>
                                                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="truncate">{employee.email}</span>
                                                    {employee.phone && (
                                                        <>
                                                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                                                            <span className="whitespace-nowrap">{employee.phone}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-600">
                                        {employee.employeeCode}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                        {employee.departmentName || '-'}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                        {employee.position || '-'}
                                    </TableCell>
                                    <TableCell className="px-6 py-4 align-middle">
                                        <span
                                            className={cn(
                                                'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
                                                statusConfig.bg,
                                                statusConfig.text
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'mr-1.5 h-1.5 w-1.5 rounded-full',
                                                    statusConfig.dot
                                                )}
                                            />
                                            {statusConfig.label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right align-middle">
                                        <div className="flex items-center justify-end gap-2 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() => onEdit?.(employee)}
                                                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-sky-50 hover:text-[#0369A1] cursor-pointer"
                                            >
                                                <Edit2 className="h-4 w-4" />
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
