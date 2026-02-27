'use client'

import { memo, useState, useCallback } from 'react'
import { Plus, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DepartmentTable } from '@/features/hr/components/department/department-table'
import { DepartmentForm } from '@/features/hr/components/department/department-form'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import type { Department } from '@/features/hr/api/department-service'
import { useDepartments } from '@/features/hr/hooks/use-departments'

export const DepartmentList = memo(function DepartmentList() {
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')

    const { data, departments, totalCount, totalPages, isLoading } = useDepartments({
        page: page,
        pageSize: 7,
        search: searchQuery || undefined
    })

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
        console.log('Delete', dept)
    }, [])

    const handleSuccess = useCallback(() => {
        setIsOpen(false)
        mutate(() => true, undefined, { revalidate: true })
    }, [])

    const handleRefresh = () => {
        mutate(() => true, undefined, { revalidate: true })
    }

    const displayDepartments = departments
    const displayTotalCount = totalCount
    const displayTotalPages = totalPages

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#0C4A6E]">
                    Phòng ban
                </h1>
                <p className="text-[#0C4A6E]/70 text-base">
                    Quản lý {displayTotalCount} phòng ban trong doanh nghiệp.
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder="Tìm kiếm phòng ban..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value)
                                setPage(1)
                            }}
                            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-sky-200 focus-visible:border-sky-300"
                        />
                    </div>

                    {/* Refresh */}
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="p-2.5 text-slate-400 hover:text-[#0369A1] hover:bg-sky-50 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                        title="Làm mới"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* CTA Button */}
                <Button
                    onClick={handleCreate}
                    className="bg-[#22C55E] hover:bg-green-600 text-white rounded-xl h-10 px-6 font-semibold text-sm shadow-md shadow-green-200 active:scale-95 transition-all w-full md:w-auto cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm phòng ban
                </Button>
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-x-auto">
                    <DepartmentTable
                        departments={displayDepartments}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                {/* Pagination - inside card */}
                <div className="mt-auto px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                        Trang {page} / {displayTotalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.min(displayTotalPages, p + 1))}
                        disabled={page === displayTotalPages}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedDepartment ? 'Chỉnh sửa phòng ban' : 'Thêm phòng ban mới'}</DialogTitle>
                        <DialogDescription className="hidden">
                            {selectedDepartment ? 'Chỉnh sửa thông tin phòng ban' : 'Điền thông tin để tạo phòng ban mới'}
                        </DialogDescription>
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

