import { UseFormReturn } from 'react-hook-form'
import { Loader2, Plus } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Form, FormControl, FormField, FormItem, FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import type { CreateDetailValues } from './create-plan-types'

interface PlanDetailFormSectionProps {
    form: UseFormReturn<CreateDetailValues>
    isAddingDetail: boolean
    onSubmit: (values: CreateDetailValues) => void
}

export function PlanDetailFormSection({ form, isAddingDetail, onSubmit }: PlanDetailFormSectionProps) {
    return (
        <div className="bg-white p-4 rounded-lg border shadow-sm shrink-0">
            <h3 className="text-sm font-semibold mb-3">Thêm đề xuất mới</h3>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-12 gap-3 items-end">
                    <FormField control={form.control} name="positionTitle" render={({ field }) => (
                        <FormItem className="col-span-3">
                            <FormLabel className="text-xs">Tên vị trí <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input placeholder="Vd: Senior Dev" {...field} className="h-8" /></FormControl>
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="quantity" render={({ field }) => (
                        <FormItem className="col-span-1">
                            <FormLabel className="text-xs">SL <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input type="number" min={1} {...field} className="h-8 px-2" /></FormControl>
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="priority" render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel className="text-xs">Mức độ</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Normal">Bình thường</SelectItem>
                                    <SelectItem value="High">Cao</SelectItem>
                                    <SelectItem value="Urgent">Khẩn cấp</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="salaryRangeMax" render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel className="text-xs">Lương Max</FormLabel>
                            <FormControl><Input type="number" {...field} className="h-8" placeholder="0" /></FormControl>
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="expectedStartDate" render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel className="text-xs">Ngày cần</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full pl-2 text-left font-normal h-8 text-xs", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                        </FormItem>
                    )} />

                    <Button type="submit" disabled={isAddingDetail} className="col-span-2 h-8 bg-[#0F4C75] text-xs">
                        {isAddingDetail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3 mr-1" />}
                        Thêm
                    </Button>

                    {/* Expanded fields row */}
                    <div className="col-span-12 grid grid-cols-12 gap-3 mt-2 pt-2 border-t border-dashed">
                        <FormField control={form.control} name="minExperience" render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel className="text-[10px] text-gray-500 uppercase">Kinh nghiệm (Năm)</FormLabel>
                                <div className="flex items-center gap-1">
                                    <Input type="number" {...field} className="h-7 text-xs" placeholder="Min" />
                                </div>
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="educationLevel" render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel className="text-[10px] text-gray-500 uppercase">Học vấn</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Chọn" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="DaiHoc">Đại học</SelectItem>
                                        <SelectItem value="CaoDang">Cao đẳng</SelectItem>
                                        <SelectItem value="ThacSi">Thạc sĩ</SelectItem>
                                        <SelectItem value="Khac">Khác</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="requiredSkills" render={({ field }) => (
                            <FormItem className="col-span-8">
                                <FormLabel className="text-[10px] text-gray-500 uppercase">Kỹ năng (Cần thiết)</FormLabel>
                                <Input {...field} className="h-7 text-xs" placeholder="Java, React, SQL..." />
                            </FormItem>
                        )} />
                    </div>
                </form>
            </Form>
        </div>
    )
}
