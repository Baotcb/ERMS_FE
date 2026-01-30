'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DepartmentTable } from '@/features/hr/components/department/department-table'
import { DepartmentForm } from '@/features/hr/components/department/department-form'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
    const router = useRouter()
    const [departments] = useState(initialDepartments)
    const [searchQuery, setSearchQuery] = useState('')

    // Modal state
    const [isOpen, setIsOpen] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(undefined)

    const handleCreate = useCallback(() => {
        setSelectedDepartment(undefined)
        setIsOpen(true)
    }, [])

    const handleEdit = useCallback((dept: Department) => {
        setSelectedDepartment(dept)
        setIsOpen(true)
    }, [])

    const handleDelete = useCallback((dept: Department) => {
        // TODO: Confirm and delete
        console.log('Delete', dept)
    }, [])

    const handleSuccess = useCallback(() => {
        setIsOpen(false)
        router.refresh()
    }, [router])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F4C75]">Phòng ban</h1>
                    <p className="text-gray-500 mt-1">Quản lý {totalCount} phòng ban</p>
                </div>
                <Button onClick={handleCreate} className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm phòng ban
                </Button>
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
                departments={initialDepartments} // Use initialDepartments directly as it comes from server
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={`/enterprise/departments?page=${page}`} // Fix href to be correct
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

            {/* Create/Edit Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedDepartment ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}</DialogTitle>
                    </DialogHeader>
                    <DepartmentForm
                        initialData={selectedDepartment}
                        isEdit={!!selectedDepartment}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
})
