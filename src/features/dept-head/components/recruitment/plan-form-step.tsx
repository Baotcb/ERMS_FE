import { UseFormReturn, useWatch } from 'react-hook-form'
import { CalendarIcon, DollarSign, AlertTriangle, Info } from 'lucide-react'
import { format, startOfDay } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import type { RecruitmentCampaign } from '@/features/hr/types/recruitment-campaign-types'
import type { CreatePlanValues, Department, CampaignBudgetInfo } from './create-plan-types'

// Format VND
function formatVND(value: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

interface PlanFormStepProps {
    form: UseFormReturn<CreatePlanValues>
    campaigns: RecruitmentCampaign[]
    detectedDepartment: Department | null
    isLoadingCampaigns: boolean
    showCampaignField: boolean
    onSubmit: (values: CreatePlanValues) => void
    budgetInfo: CampaignBudgetInfo | null
}

export function PlanFormStep({ form, campaigns, detectedDepartment, isLoadingCampaigns, showCampaignField, onSubmit, budgetInfo }: PlanFormStepProps) {
    // Watch totalBudget field để kiểm tra realtime
    const totalBudget = useWatch({ control: form.control, name: 'totalBudget' })
    const isOverBudget = Boolean(budgetInfo && (totalBudget ?? 0) > budgetInfo.remainingBudget)

    return (
        <Form {...form}>
            <form id="create-plan-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto pb-4">
                {/* Budget Info Banner */}
                {budgetInfo && (
                    <div className={cn(
                        "rounded-lg border p-4 space-y-3",
                        isOverBudget
                            ? "bg-amber-50 border-amber-200"
                            : "bg-blue-50 border-blue-200"
                    )}>
                        <div className="flex items-center gap-2">
                            {isOverBudget
                                ? <AlertTriangle className="w-4 h-4 text-amber-600" />
                                : <Info className="w-4 h-4 text-blue-600" />
                            }
                            <span className={cn(
                                "text-sm font-semibold",
                                isOverBudget ? "text-amber-700" : "text-blue-700"
                            )}>
                                Thông tin ngân sách chiến dịch
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white rounded-md p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Tổng ngân sách</p>
                                <p className="text-sm font-bold text-gray-900">{formatVND(budgetInfo.totalBudgetCeiling)}</p>
                            </div>
                            <div className="bg-white rounded-md p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Đã phân bổ</p>
                                <p className="text-sm font-bold text-green-700">{formatVND(budgetInfo.usedBudget)}</p>
                                {budgetInfo.pendingBudget > 0 && (
                                    <p className="text-xs text-amber-600 mt-0.5">
                                        + {formatVND(budgetInfo.pendingBudget)} đang chờ duyệt
                                    </p>
                                )}
                            </div>
                            <div className="bg-white rounded-md p-3 border border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Còn lại</p>
                                <p className={cn(
                                    "text-sm font-bold",
                                    isOverBudget ? "text-amber-600" : "text-blue-700"
                                )}>
                                    {formatVND(budgetInfo.remainingBudget)}
                                </p>
                            </div>
                        </div>
                        {isOverBudget && (
                            <div className="flex items-start gap-2 bg-amber-100/60 rounded-md p-2.5">
                                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-700">
                                    Ngân sách yêu cầu ({formatVND(totalBudget || 0)}) vượt hạn mức còn lại ({formatVND(budgetInfo.remainingBudget)}).
                                    Kế hoạch vẫn được gửi nhưng có thể bị từ chối bởi Director.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-lg border shadow-sm">
                    {showCampaignField && (
                        <FormField control={form.control} name="campaignId" render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Chiến dịch <span className="text-red-500">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCampaigns}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Chọn chiến dịch" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {campaigns.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.campaignName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )} />
                    )}

                    <FormField control={form.control} name="planName" render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>Tên kế hoạch <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input placeholder="Vd: Kế hoạch Tuyển dụng Q1" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="startDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Ngày bắt đầu</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="endDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Ngày kết thúc</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < startOfDay(new Date())} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="totalBudget" render={({ field }) => (
                        <FormItem className="grid grid-rows-[auto_auto_minmax(1.25rem,_auto)] items-start">
                            <FormLabel>Ngân sách (VNĐ)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <CurrencyInput
                                        className={cn("pl-9", isOverBudget && "border-amber-400 focus-visible:ring-amber-400")}
                                        placeholder="VD: 300.000.000"
                                        {...field}
                                        onChange={(v) => field.onChange(v)}
                                    />
                                </div>
                            </FormControl>
                            <div className="min-h-5">
                                {isOverBudget && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Vượt hạn mức còn lại {formatVND(budgetInfo?.remainingBudget ?? 0)}
                                    </p>
                                )}
                            </div>
                        </FormItem>
                    )} />

                    <FormItem className="grid grid-rows-[auto_auto_minmax(1.25rem,_auto)] items-start">
                        <FormLabel>Phòng ban</FormLabel>
                        <div className="h-10 px-3 py-2 border rounded-md bg-gray-100 text-sm text-gray-500 flex items-center">
                            {detectedDepartment?.departmentName || 'Không xác định'}
                        </div>
                        <div className="min-h-5" aria-hidden="true" />
                    </FormItem>

                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem className="col-span-2">
                            <FormLabel>Ghi chú</FormLabel>
                            <FormControl><Textarea placeholder="..." className="min-h-[80px]" {...field} /></FormControl>
                        </FormItem>
                    )} />
                </div>
            </form>
        </Form>
    )
}
