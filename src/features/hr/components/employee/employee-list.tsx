'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmployeeTable } from '@/features/hr/components/employee/employee-table'
import { EmployeeForm } from '@/features/hr/components/employee/employee-form'
import { EmployeeImport } from '@/features/hr/components/employee/employee-import'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
    const router = useRouter()
    const [employees] = useState(initialEmployees)
    const [searchQuery, setSearchQuery] = useState('')

    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined)

    const handleCreate = useCallback(() => {
        setSelectedEmployee(undefined)
        setIsCreateOpen(true)
    }, [])

    const handleEdit = useCallback((emp: Employee) => {
        setSelectedEmployee(emp)
        setIsCreateOpen(true)
    }, [])

    const handleImport = useCallback(() => {
        setIsImportOpen(true)
    }, [])

    const handleDelete = useCallback((emp: Employee) => {
        console.log('Delete', emp)
    }, [])

    const handleSuccess = useCallback(() => {
        setIsCreateOpen(false)
        router.refresh()
    }, [router])

    const handleImportSuccess = useCallback(() => {
        setIsImportOpen(false)
        router.refresh()
    }, [router])

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F4C75]">Nhân viên</h1>
                    <p className="text-gray-500 mt-1">Quản lý {totalCount} nhân viên</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleImport}>
                        <Upload className="w-4 h-4 mr-2" />
                        Import Excel
                    </Button>
                    <Button onClick={handleCreate} className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm nhân viên
                    </Button>
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
                employees={initialEmployees}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Link
                            key={page}
                            href={`/enterprise/employees?page=${page}`}
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
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
                    </DialogHeader>
                    <EmployeeForm
                        initialData={selectedEmployee}
                        isEdit={!!selectedEmployee}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Import Modal */}
            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Import Nhân viên</DialogTitle>
                    </DialogHeader>
                    <EmployeeImport
                        onSuccess={handleImportSuccess}
                        onCancel={() => setIsImportOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
})
