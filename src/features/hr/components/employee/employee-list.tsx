'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmployeeTable } from '@/features/hr/components/employee/employee-table'
import type { Employee } from '@/features/hr/api/employee-service'

interface EmployeeListProps {
    initialEmployees: Employee[]
    totalCount: number
    currentPage: number
    totalPages: number
}

export const EmployeeList = memo(function EmployeeList({
    initialEmployees,
    totalCount,
    currentPage,
    totalPages
}: EmployeeListProps) {
    const [employees] = useState(initialEmployees)
    const [searchQuery, setSearchQuery] = useState('')

    const handleEdit = useCallback((emp: Employee) => {
        console.log('Edit', emp)
    }, [])

    const handleDelete = useCallback((emp: Employee) => {
        console.log('Delete', emp)
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F4C75]">Nhân viên</h1>
                    <p className="text-gray-500 mt-1">Quản lý {totalCount} nhân viên</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/hr/employees/import">
                        <Button variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Import Excel
                        </Button>
                    </Link>
                    <Link href="/hr/employees/create">
                        <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                            <Plus className="w-4 h-4 mr-2" />
                            Thêm nhân viên
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm nhân viên..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Làm mới
                </Button>
            </div>

            {/* Table */}
            <EmployeeTable
                employees={employees}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={`/hr/employees?page=${page}`}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                ? 'bg-[#0F4C75] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {page}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
})
