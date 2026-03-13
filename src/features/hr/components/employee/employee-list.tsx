'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus, Search, RefreshCw, Upload, ChevronLeft, ChevronRight } from 'lucide-react'
import { mutate } from 'swr'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getEmployeeById, type Employee } from '@/features/hr/api/employee-service'
import { EmployeeForm } from '@/features/hr/components/employee/employee-form'
import { EmployeeImport } from '@/features/hr/components/employee/employee-import'
import { EmployeeTable } from '@/features/hr/components/employee/employee-table'
import { useDepartmentOptions } from '@/features/hr/hooks/use-departments'
import { useEmployees } from '@/features/hr/hooks/use-employees'
import { useDebounce } from '@/hooks/use-debounce'
import { useToast } from '@/hooks/use-toast'

const STATUS_OPTIONS = [
    { value: '', label: 'Trạng thái' },
    { value: 'Active', label: 'Đang làm việc' },
    { value: 'Probation', label: 'Thử việc' },
    { value: 'OnLeave', label: 'Nghỉ phép' },
    { value: 'Inactive', label: 'Đã nghỉ việc' },
]

const ROLE_OPTIONS = [
    { value: 'Employee', label: 'Nhân viên' },
    { value: 'Trainer', label: 'Đào tạo viên' },
    { value: 'DepartmentHead', label: 'Trưởng phòng' },
    { value: 'Director', label: 'Giám đốc' },
]

const PAGE_SIZE = 7
const FILTER_OPTIONS_PAGE_SIZE = 1000

function normalizeRole(role: string | null | undefined) {
    return role?.trim().toLocaleLowerCase('vi-VN') ?? ''
}

function revalidateEmployeeLists() {
    return mutate(
        (key) => Array.isArray(key) && key[0] === 'employees' && key[1] === 'list',
        undefined,
        { revalidate: true }
    )
}

export const EmployeeList = memo(function EmployeeList() {
    const { toast } = useToast()
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [prevSearch, setPrevSearch] = useState('')
    const [departmentFilter, setDepartmentFilter] = useState<number | undefined>(undefined)
    const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined)
    const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isImportOpen, setIsImportOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined)
    const [isEditLoading, setIsEditLoading] = useState(false)
    const [editLoadError, setEditLoadError] = useState<string | null>(null)
    const editRequestIdRef = useRef(0)
    const debouncedSearch = useDebounce(searchQuery, 300)

    const { options: departmentOptions } = useDepartmentOptions()

    useEffect(() => {
        if (debouncedSearch !== prevSearch) {
            setPrevSearch(debouncedSearch)
            if (page !== 1) {
                setPage(1)
            }
        }
    }, [debouncedSearch, page, prevSearch])

    const baseFilterParams = useMemo(
        () => ({
            search: debouncedSearch || undefined,
            departmentId: departmentFilter,
            status: statusFilter,
        }),
        [debouncedSearch, departmentFilter, statusFilter]
    )

    const { employees, totalCount, totalPages, isLoading } = useEmployees({
        page,
        pageSize: PAGE_SIZE,
        ...baseFilterParams,
    })

    const {
        employees: employeesForFilters,
        isLoading: isFilterOptionsLoading,
    } = useEmployees({
        page: 1,
        pageSize: FILTER_OPTIONS_PAGE_SIZE,
        ...baseFilterParams,
    })

    const filteredEmployeesForRole = useMemo(() => {
        if (!roleFilter) {
            return employees
        }

        const normalizedFilter = normalizeRole(roleFilter)

        return employeesForFilters.filter(
            (employee) => employee.roles?.some((r) => normalizeRole(r) === normalizedFilter)
        )
    }, [employees, employeesForFilters, roleFilter])

    const effectiveTotalCount = roleFilter
        ? filteredEmployeesForRole.length
        : totalCount
    const effectiveTotalPages = roleFilter
        ? Math.max(1, Math.ceil(filteredEmployeesForRole.length / PAGE_SIZE))
        : totalPages
    const effectiveEmployees = roleFilter
        ? filteredEmployeesForRole.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
        : employees
    const isTableLoading = isLoading || (Boolean(roleFilter) && isFilterOptionsLoading)

    useEffect(() => {
        if (page > effectiveTotalPages) {
            setPage(effectiveTotalPages)
        }
    }, [effectiveTotalPages, page])

    const handleCreate = useCallback(() => {
        editRequestIdRef.current = 0
        setSelectedEmployee(undefined)
        setEditLoadError(null)
        setIsEditLoading(false)
        setIsCreateOpen(true)
    }, [])

    const handleEdit = useCallback(async (employee: Employee) => {
        const requestId = ++editRequestIdRef.current

        setSelectedEmployee(employee)
        setEditLoadError(null)
        setIsEditLoading(true)
        setIsCreateOpen(true)

        try {
            const detailedEmployee = await getEmployeeById(employee.id)

            if (requestId !== editRequestIdRef.current) return

            setSelectedEmployee(detailedEmployee)
        } catch (error) {
            if (requestId !== editRequestIdRef.current) return

            const message = error instanceof Error ? error.message : 'Không thể tải thông tin nhân viên'
            setEditLoadError(message)
            toast({
                title: 'Không thể tải chi tiết nhân viên',
                description: 'Form sẽ dùng dữ liệu từ danh sách. Một số trường có thể chưa đầy đủ.',
                variant: 'destructive',
            })
        } finally {
            if (requestId === editRequestIdRef.current) {
                setIsEditLoading(false)
            }
        }
    }, [toast])

    const handleImport = useCallback(() => {
        setIsImportOpen(true)
    }, [])

    const handleSuccess = useCallback(() => {
        setIsCreateOpen(false)
        setSelectedEmployee(undefined)
        setEditLoadError(null)
        setIsEditLoading(false)
        void revalidateEmployeeLists()
    }, [])

    const handleImportSuccess = useCallback(() => {
        setIsImportOpen(false)
        void revalidateEmployeeLists()
    }, [])

    const handleRefresh = useCallback(() => {
        setSearchQuery('')
        setDepartmentFilter(undefined)
        setRoleFilter(undefined)
        setStatusFilter(undefined)
        setPage(1)
        void revalidateEmployeeLists()
    }, [])

    const handleEmployeeDialogChange = useCallback((open: boolean) => {
        setIsCreateOpen(open)

        if (!open) {
            editRequestIdRef.current = 0
            setSelectedEmployee(undefined)
            setEditLoadError(null)
            setIsEditLoading(false)
        }
    }, [])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#0C4A6E]">
                    Nhân viên
                </h1>
                <p className="text-base text-[#0C4A6E]/70">
                    Quản lý {effectiveTotalCount} nhân viên trong doanh nghiệp.
                </p>
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                        <div className="relative w-full sm:w-auto sm:min-w-[200px] lg:max-w-72">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo tên, mã NV..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-10 focus-visible:border-sky-300 focus-visible:ring-sky-200"
                            />
                        </div>

                        <Select
                            value={departmentFilter ? String(departmentFilter) : 'all'}
                            onValueChange={(value) => {
                                setDepartmentFilter(value === 'all' ? undefined : Number(value))
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-700 sm:w-[170px]">
                                <SelectValue placeholder="Tất cả phòng ban" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả phòng ban</SelectItem>
                                {departmentOptions.map((department) => (
                                    <SelectItem key={department.id} value={String(department.id)}>
                                        {department.departmentName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={roleFilter || 'all'}
                            onValueChange={(value) => {
                                setRoleFilter(value === 'all' ? undefined : value)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-700 sm:w-[170px]">
                                <SelectValue placeholder="Tất cả vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả vai trò</SelectItem>
                                {ROLE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={statusFilter || 'all'}
                            onValueChange={(value) => {
                                setStatusFilter(value === 'all' ? undefined : value)
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-slate-50 text-sm text-slate-700 sm:w-[150px]">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value || 'all'} value={option.value || 'all'}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={isTableLoading}
                            className="self-start rounded-full p-2.5 text-slate-400 transition-colors hover:bg-sky-50 hover:text-[#0369A1] disabled:opacity-50 lg:self-auto"
                            title="Làm mới"
                        >
                            <RefreshCw className={`h-4 w-4 ${isTableLoading ? 'animate-spin' : ''}`} />
                        </button>

                        <div className="ml-auto flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleImport}
                            className="h-10 rounded-xl border-slate-200 px-4 text-sm font-semibold text-slate-700 cursor-pointer"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Import Excel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            className="h-10 rounded-xl bg-[#22C55E] px-6 text-sm font-semibold text-white shadow-md shadow-green-200 transition-all active:scale-95 hover:bg-green-600 cursor-pointer"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Thêm nhân viên
                        </Button>
                        </div>
                </div>
            </div>

            <div className="flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex-1 overflow-x-auto">
                    <EmployeeTable employees={effectiveEmployees} onEdit={handleEdit} />
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-slate-100 px-6 py-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 text-slate-500 hover:bg-slate-50 hover:text-[#0369A1] cursor-pointer"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Trước
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                        Trang {page} / {effectiveTotalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((currentPage) => Math.min(effectiveTotalPages, currentPage + 1))}
                        disabled={page === effectiveTotalPages}
                        className="flex items-center gap-1 text-slate-500 hover:bg-slate-50 hover:text-[#0369A1] cursor-pointer"
                    >
                        Tiếp
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={handleEmployeeDialogChange}>
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedEmployee ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</DialogTitle>
                        <DialogDescription className="hidden">
                            {selectedEmployee ? 'Cập nhật thông tin nhân viên' : 'Nhập thông tin nhân viên mới'}
                        </DialogDescription>
                    </DialogHeader>

                    {isEditLoading && selectedEmployee ? (
                        <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-10 text-slate-600">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Đang tải thông tin chi tiết nhân viên...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {editLoadError && selectedEmployee && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    {editLoadError}
                                </div>
                            )}
                            <EmployeeForm
                                key={selectedEmployee?.id ?? 'create'}
                                initialData={selectedEmployee}
                                isEdit={!!selectedEmployee}
                                onSuccess={handleSuccess}
                                onCancel={() => handleEmployeeDialogChange(false)}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Import nhân viên</DialogTitle>
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
