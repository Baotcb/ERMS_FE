import { useFormContext } from 'react-hook-form'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { Department } from '@/features/hr/api/department-service'
import type { EmployeeFormValues } from './employee-form-schema'

interface EmployeeJobInfoProps {
    isEdit: boolean
    departments: Department[]
}

export function EmployeeJobInfo({ isEdit, departments }: EmployeeJobInfoProps) {
    const { register, setValue, watch, formState: { errors } } = useFormContext<EmployeeFormValues>()

    const selectedDepartmentId = watch('departmentId')
    const selectedDepartment = departments.find((department) => department.id.toString() === selectedDepartmentId)
    const hireDate = watch('hireDate')

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="w-1 h-6 bg-[#0F4C75] rounded-full" />
                <h3 className="text-lg font-semibold text-gray-800">Thông tin công việc</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Phòng ban <span className="text-red-500">*</span></Label>
                    <Select
                        value={selectedDepartmentId}
                        onValueChange={(value) => setValue('departmentId', value)}
                    >
                        <SelectTrigger className={errors.departmentId ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Chọn phòng ban">
                                {selectedDepartment
                                    ? selectedDepartment.departmentCode
                                        ? `${selectedDepartment.departmentName} (${selectedDepartment.departmentCode})`
                                        : selectedDepartment.departmentName
                                    : selectedDepartmentId || 'Chọn phòng ban'}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((department) => (
                                <SelectItem key={department.id} value={department.id.toString()}>
                                    {department.departmentCode
                                        ? `${department.departmentName} (${department.departmentCode})`
                                        : department.departmentName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.departmentId && (
                        <p className="text-sm text-red-500">{errors.departmentId.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="position">Chức vụ</Label>
                    <Input
                        id="position"
                        placeholder="Ví dụ: Nhân viên kinh doanh"
                        {...register('position')}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Loại hợp đồng</Label>
                    <Select
                        value={watch('employmentType')}
                        onValueChange={(value) => setValue('employmentType', value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn loại hợp đồng" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="FullTime">Toàn thời gian</SelectItem>
                            <SelectItem value="PartTime">Bán thời gian</SelectItem>
                            <SelectItem value="Contract">Hợp đồng</SelectItem>
                            <SelectItem value="Intern">Thực tập</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Ngày vào làm</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !hireDate && 'text-muted-foreground'
                                )}
                                disabled={isEdit}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {hireDate ? format(hireDate, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={hireDate}
                                onSelect={(date) => setValue('hireDate', date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {isEdit && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Trạng thái</Label>
                        <Select
                            value={watch('status')}
                            onValueChange={(value) => setValue('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Đang hoạt động</SelectItem>
                                <SelectItem value="Inactive">Ngưng hoạt động</SelectItem>
                                <SelectItem value="OnLeave">Nghỉ phép</SelectItem>
                                <SelectItem value="Terminated">Đã nghỉ việc</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Vai trò</Label>
                        <Select
                            value={watch('role') || '__none__'}
                            onValueChange={(value) => setValue('role', value === '__none__' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">Không thay đổi</SelectItem>
                                <SelectItem value="Employee">Nhân viên</SelectItem>
                                <SelectItem value="Trainer">Đào tạo viên</SelectItem>
                                <SelectItem value="DepartmentHead">Trưởng phòng</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    )
}
