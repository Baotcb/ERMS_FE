'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DepartmentTable } from '@/features/hr/components/department/department-table'
import type { Department } from '@/features/hr/api/department-service'

interface DepartmentListProps {
    initialDepartments: Department[]
    totalCount: number
    currentPage: number
    totalPages: number
}

export const DepartmentList = memo(function DepartmentList({
    initialDepartments,
    totalCount,
    currentPage,
    totalPages
}: DepartmentListProps) {
    const [departments] = useState(initialDepartments)
    const [searchQuery, setSearchQuery] = useState('')

    const handleEdit = useCallback((dept: Department) => {
        // TODO: Open edit modal
        console.log('Edit', dept)
    }, [])

    const handleDelete = useCallback((dept: Department) => {
        // TODO: Confirm and delete
        console.log('Delete', dept)
    }, [])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F4C75]">Phòng ban</h1>
                    <p className="text-gray-500 mt-1">Quản lý {totalCount} phòng ban</p>
                </div>
                <Link href="/hr/departments/create">
                    <Button className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm phòng ban
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm phòng ban..."
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
            <DepartmentTable
                departments={departments}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={`/hr/departments?page=${page}`}
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
