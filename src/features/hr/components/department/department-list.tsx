'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, RefreshCw, Loader2 } from 'lucide-react'
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

interface DepartmentListProps {
    initialDepartments: Department[]
    totalCount: number
    currentPage: number
    totalPages: number
}

export const DepartmentList = memo(function DepartmentList({
    initialDepartments,
    totalCount: initialTotalCount,
    currentPage: initialPage,
    totalPages: initialTotalPages
}: DepartmentListProps) {
    const [page, setPage] = useState(initialPage)
    const [searchQuery, setSearchQuery] = useState('')

    // Use SWR hook for data fetching and caching
    // We don't pass fallbackData here because useData in the hook handles it differently,
    // but the hook will fetch fresh data on mount/update. 
    // To make it instant on first load we could use fallbackData but the hook interface might need tweak.
    // For now, let's just use the hook.

    // Note: To properly support SSR hydration with SWR, we'd typically pass fallbackData to SWRConfig or useData options.
    // However, given the current hook structure, we'll try to use the hook's return values which fallback to empty, 
    // effectively doing a client-side fetch. 
    // To prevent layout shift, we can initialize state with props, but SWR is better source of truth.

    // Better approach: Since we have initial data, we can just fetch.
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
        // TODO: Confirm and delete
        console.log('Delete', dept)
    }, [])

    const handleSuccess = useCallback(() => {
        setIsOpen(false)
        // Revalidate SWR cache - handled by hook's mutate/SWR
        mutate(() => true, undefined, { revalidate: true })
    }, [])

    const handleRefresh = () => {
        mutate(() => true, undefined, { revalidate: true })
    }

    // Determine which departments to display
    // If SWR has fetched data (data is not undefined), use it (even if empty)
    // Otherwise, fallback to initialDepartments (SSR data)
    const displayDepartments = data ? departments : initialDepartments

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F4C75] leading-tight">Phòng ban</h1>
                    <p className="text-gray-500 text-sm">Quản lý {totalCount ?? initialTotalCount} phòng ban</p>
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
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setPage(1) // Reset to page 1 on search
                        }}
                        className="pl-10"
                    />
                </div>
                <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Làm mới
                </Button>
            </div>

            {/* Table */}
            <div className="relative min-h-[500px]">
                {isLoading && !data && (
                    <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
                    </div>
                )}
                <DepartmentTable
                    departments={displayDepartments}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
