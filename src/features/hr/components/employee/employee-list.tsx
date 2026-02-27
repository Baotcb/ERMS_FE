'use client'

import { memo, useState, useCallback, useMemo } from 'react'
import { Plus, Search, RefreshCw, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
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
import { useEmployees, employeesKeys } from '@/features/hr/hooks/use-employees'
import { useDepartmentOptions } from '@/features/hr/hooks/use-departments'
import { useDebounce } from '@/hooks/use-debounce'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

// Status options for filter
const STATUS_OPTIONS = [
    { value: '', label: 'Trạng thái' },
    { value: 'Active', label: 'Đang làm việc' },
    { value: 'Probation', label: 'Thử việc' },
    { value: 'OnLeave', label: 'Nghỉ phép' },
    { value: 'Inactive', label: 'Đã nghỉ việc' },
]

const PAGE_SIZE = 7

export const EmployeeList = memo(function EmployeeList() {
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [prevSearch, setPrevSearch] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined)
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
    const debouncedSearch = useDebounce(searchQuery, 300)

    // Fetch department options for dropdown
    const { options: departmentOptions } = useDepartmentOptions()

    // Reset page when debounced search changes (and differs from previous)
    if (debouncedSearch !== prevSearch && debouncedSearch !== searchQuery) {
        setPrevSearch(debouncedSearch)
        if (debouncedSearch && page !== 1) {
            setPage(1)
        }
    }

    // Use SWR hook for data fetching
    const { data, employees, totalCount: hookedTotalCount, totalPages: hookedTotalPages, isLoading } = useEmployees({
        page: page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        departmentId: departmentFilter,
        status: statusFilter,
    })

    const displayEmployees = employees
    const displayTotalCount = hookedTotalCount
    const displayTotalPages = hookedTotalPages

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
        mutate(employeesKeys.lists(), undefined, { revalidate: true })
    }, [])

    const handleImportSuccess = useCallback(() => {
        setIsImportOpen(false)
        mutate(employeesKeys.lists(), undefined, { revalidate: true })
    }, [])

    const handleRefresh = useCallback(() => {
        mutate(employeesKeys.lists(), undefined, { revalidate: true })
    }, [])

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#0C4A6E]">
                    Nhân viên
                </h1>
                <p className="text-[#0C4A6E]/70 text-base">
                    Quản lý {displayTotalCount} nhân viên trong doanh nghiệp.
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã NV..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-sky-200 focus-visible:border-sky-300"
                        />
                    </div>

                    {/* Department Filter */}
                    <Select
                        value={departmentFilter ? String(departmentFilter) : 'all'}
                        onValueChange={(val) => {
                            setDepartmentFilter(val === 'all' ? undefined : Number(val))
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="w-[180px] h-10 rounded-xl bg-slate-50 border-slate-200 text-sm text-slate-700">
                            <SelectValue placeholder="Tất cả phòng ban" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả phòng ban</SelectItem>
                            {departmentOptions.map(dept => (
                                <SelectItem key={dept.id} value={String(dept.id)}>
                                    {dept.departmentName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Status Filter */}
                    <Select
                        value={statusFilter || 'all'}
                        onValueChange={(val) => {
                            setStatusFilter(val === 'all' ? undefined : val)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="w-[160px] h-10 rounded-xl bg-slate-50 border-slate-200 text-sm text-slate-700">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map(opt => (
                                <SelectItem key={opt.value || 'all'} value={opt.value || 'all'}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        onClick={handleImport}
                        className="rounded-xl h-10 px-4 border-slate-200 text-slate-700 font-semibold text-sm cursor-pointer"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Import Excel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        className="bg-[#22C55E] hover:bg-green-600 text-white rounded-xl h-10 px-6 font-semibold text-sm shadow-md shadow-green-200 active:scale-95 transition-all cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm nhân viên
                    </Button>
                </div>
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-x-auto">
                    <EmployeeTable
                        employees={displayEmployees}
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

