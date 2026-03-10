'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
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
} from '@/components/ui/dialog'
import { getEmployeeById, type Employee } from '@/features/hr/api/employee-service'
import { useEmployees } from '@/features/hr/hooks/use-employees'
import { useDepartmentOptions } from '@/features/hr/hooks/use-departments'
import { useDebounce } from '@/hooks/use-debounce'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

const STATUS_OPTIONS = [
    { value: '', label: 'Trạng thái' },
    { value: 'Active', label: 'Đang làm việc' },
    { value: 'Probation', label: 'Thử việc' },
    { value: 'OnLeave', label: 'Nghỉ phép' },
    { value: 'Inactive', label: 'Đã nghỉ việc' },
]

const PAGE_SIZE = 7

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

    const { employees, totalCount, totalPages, isLoading } = useEmployees({
        page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch || undefined,
        departmentId: departmentFilter,
        status: statusFilter,
    })

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

            // Ignore stale response: another edit was triggered while this was in-flight
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

    const handleDelete = useCallback((employee: Employee) => {
        console.log('Delete', employee)
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
                <p className="text-[#0C4A6E]/70 text-base">
                    Quản lý {totalCount} nhân viên trong doanh nghiệp.
                </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Tìm kiếm theo tên, mã NV..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-sky-200 focus-visible:border-sky-300"
                        />
                    </div>

                    <Select
                        value={departmentFilter ? String(departmentFilter) : 'all'}
                        onValueChange={(value) => {
                            setDepartmentFilter(value === 'all' ? undefined : Number(value))
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="w-[180px] h-10 rounded-xl bg-slate-50 border-slate-200 text-sm text-slate-700">
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
                        value={statusFilter || 'all'}
                        onValueChange={(value) => {
                            setStatusFilter(value === 'all' ? undefined : value)
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="w-[160px] h-10 rounded-xl bg-slate-50 border-slate-200 text-sm text-slate-700">
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
                        disabled={isLoading}
                        className="p-2.5 text-slate-400 hover:text-[#0369A1] hover:bg-sky-50 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                        title="Làm mới"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

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

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-x-auto">
                    <EmployeeTable
                        employees={employees}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>

                <div className="mt-auto px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                        Trang {page} / {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        Tiếp
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={handleEmployeeDialogChange}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
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
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-4xl">
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
