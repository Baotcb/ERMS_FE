'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, RefreshCw, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmployeeTable } from '@/features/hr/components/employee/employee-table'
import { EmployeeForm } from '@/features/hr/components/employee/employee-form'
import { EmployeeImport } from '@/features/hr/components/employee/employee-import'
import { mutate } from 'swr'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import type { Employee } from '@/features/hr/api/employee-service'
import { useEmployees } from '@/features/hr/hooks/use-employees'

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
    const [page, setPage] = useState(currentPage)
    const [searchQuery, setSearchQuery] = useState('')

    // Use SWR hook for data fetching
    const { data, employees, totalCount: hookedTotalCount, totalPages: hookedTotalPages, isLoading } = useEmployees({
        page: page,
        pageSize: 20,
        search: searchQuery || undefined
    })

    const displayEmployees = data ? employees : initialEmployees
    const displayTotalCount = data ? hookedTotalCount : totalCount
    const displayTotalPages = data ? hookedTotalPages : totalPages

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
        // Revalidate SWR cache - handled by hook's mutate/SWR
        mutate(() => true, undefined, { revalidate: true })
    }, [])

    const handleImportSuccess = useCallback(() => {
        setIsImportOpen(false)
        // Revalidate SWR cache
        mutate(() => true, undefined, { revalidate: true })
    }, [])

    const handleRefresh = () => {
        mutate(() => true, undefined, { revalidate: true })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#0F4C75]">Nhân viên</h1>
                    <p className="text-gray-500 mt-1">Quản lý {displayTotalCount} nhân viên</p>
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
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setPage(1)
                        }}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Làm mới
                </Button>
            </div>

            {/* Table */}
            <EmployeeTable
                employees={displayEmployees}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Pagination */}
            {displayTotalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: displayTotalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                            key={p}
                            variant={p === page ? "default" : "outline"}
                            className={p === page ? "bg-[#0F4C75]" : ""}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </Button>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
                        <DialogDescription className="hidden">
                            {selectedEmployee ? 'Cập nhật thông tin nhân viên' : 'Nhập thông tin nhân viên mới'}
                        </DialogDescription>
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
                        <DialogDescription className="hidden">
                            Tải lên file Excel để import nhân viên
                        </DialogDescription>
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
