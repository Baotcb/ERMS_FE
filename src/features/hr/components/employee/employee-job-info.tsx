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
                        value={watch('departmentId')}
                        onValueChange={(value) => setValue('departmentId', value)}
                    >
                        <SelectTrigger className={errors.departmentId ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Chọn phòng ban">
                                {(() => {
                                    const deptId = watch('departmentId');
                                    const found = departments.find(d => d.id.toString() === deptId);
                                    if (found) {
                                        return found.departmentCode ? `${found.departmentName} (${found.departmentCode})` : found.departmentName;
                                    }
                                    return deptId ? deptId : "Chọn phòng ban";
                                })()}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                    {dept.departmentCode ? `${dept.departmentName} (${dept.departmentCode})` : dept.departmentName}
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
                        onValueChange={(value) => setValue('employmentType', value)}
                        defaultValue={watch('employmentType')}
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

                <div className="space-y-2">
                    <Label>Ngày vào làm</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !watch('hireDate') && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {watch('hireDate') ? format(watch('hireDate')!, 'dd/MM/yyyy') : <span>Chọn ngày</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={watch('hireDate')}
                                onSelect={(date) => setValue('hireDate', date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {isEdit && (
                <div className="max-w-[50%] space-y-2">
                    <Label>Trạng thái</Label>
                    <Select
                        onValueChange={(value) => setValue('status', value)}
                        defaultValue={watch('status')}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Active">Đang hoạt động</SelectItem>
                            <SelectItem value="Inactive">Ngừng hoạt động</SelectItem>
                            <SelectItem value="OnLeave">Nghỉ phép</SelectItem>
                            <SelectItem value="Terminated">Đã nghỉ việc</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}
