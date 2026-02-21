'use client'

import { memo, useMemo, useRef, useCallback } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
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

interface EmployeeTableProps {
    employees: Employee[]
    onEdit?: (employee: Employee) => void
    onDelete?: (employee: Employee) => void
}

/**
 * Virtualized Employee Row Component
 * Memoized to prevent unnecessary re-renders
 */
const EmployeeRow = memo(function EmployeeRow({
    emp,
    onEdit,
    onDelete
}: {
    emp: Employee
    onEdit?: (employee: Employee) => void
    onDelete?: (employee: Employee) => void
}) {
    const initials = useMemo(
        () => emp.fullName.split(' ').map(n => n[0]).slice(-2).join(''),
        [emp.fullName]
    )

    const handleEdit = useCallback(() => {
        onEdit?.(emp)
    }, [emp, onEdit])

    const handleDelete = useCallback(() => {
        onDelete?.(emp)
    }, [emp, onDelete])

    return (
        <div className="flex border-b border-gray-100 hover:bg-gray-50 transition-colors">
            {/* Avatar & Name */}
            <div className="w-64 px-6 py-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{initials}</span>
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
            </div>

            {/* Employee Code */}
            <div className="w-32 px-6 py-4 flex-shrink-0">
                <span className="text-sm font-mono text-gray-600">{emp.employeeCode}</span>
            </div>

            {/* Department */}
            <div className="w-48 px-6 py-4 flex-shrink-0">
                <span className="text-sm text-gray-600">{emp.departmentName}</span>
            </div>

            {/* Position */}
            <div className="w-48 px-6 py-4 flex-shrink-0">
                <span className="text-sm text-gray-600">{emp.position || '-'}</span>
            </div>

            {/* Status */}
            <div className="w-32 px-6 py-4 flex-shrink-0">
                <span className={cn(
                    'inline-flex px-3 py-1 rounded-full text-xs font-medium',
                    emp.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                )}>
                    {emp.status === 'Active' ? 'Đang làm' : emp.status}
                </span>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 flex-shrink-0 text-right">
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
                            onClick={handleEdit}
                            className="cursor-pointer"
                        >
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Xóa</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
})

/**
 * Virtualized Employee Table Component
 * Renders only visible rows for better performance with large datasets
 */
export const EmployeeTableVirtualized = memo(function EmployeeTableVirtualized({
    employees,
    onEdit,
    onDelete
}: EmployeeTableProps) {
    const parentRef = useRef<HTMLDivElement>(null)

    // Memoize row data to prevent re-renders
    const rowData = useMemo(() => employees, [employees])

    // Set up virtualizer
    // eslint-disable-next-line react-hooks/incompatible-library
    const rowVirtualizer = useVirtualizer({
        count: rowData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80, // Estimated height of each row (px)
        overscan: 5, // Render 5 extra rows above/below viewport for smooth scrolling
    })

    const virtualRows = rowVirtualizer.getVirtualItems()

    if (rowData.length === 0) {
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
            {/* Table Header */}
            <div className="flex border-b border-gray-100 bg-gray-50">
                <div className="w-64 px-6 py-4 text-sm font-semibold text-gray-600">Nhân viên</div>
                <div className="w-32 px-6 py-4 text-sm font-semibold text-gray-600">Mã NV</div>
                <div className="w-48 px-6 py-4 text-sm font-semibold text-gray-600">Phòng ban</div>
                <div className="w-48 px-6 py-4 text-sm font-semibold text-gray-600">Chức vụ</div>
                <div className="w-32 px-6 py-4 text-sm font-semibold text-gray-600 text-center">Trạng thái</div>
                <div className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Thao tác</div>
            </div>

            {/* Virtualized Rows */}
            <div
                ref={parentRef}
                className="h-[600px] overflow-auto relative"
                style={{
                    // Set total height based on virtualizer
                    height: `${rowVirtualizer.getTotalSize()}px`
                }}
            >
                <div
                    style={{
                        height: `${rowVirtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {virtualRows.map((virtualRow) => {
                        const employee = rowData[virtualRow.index]
                        return (
                            <EmployeeRow
                                key={virtualRow.key}
                                emp={employee}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
})
