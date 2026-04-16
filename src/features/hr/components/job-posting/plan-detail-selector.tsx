'use client'

import { Loader2 } from 'lucide-react'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import type { UseFormReturn } from 'react-hook-form'
import type { JobPostingFormValues } from './job-posting-wizard-dialog'
import {
    useApprovedPlanDetails,
    type ApprovedPlanDetail,
} from '../../hooks/use-approved-plan-details'

interface PlanDetailSelectorProps {
    form: UseFormReturn<JobPostingFormValues>
    onSelect?: (detail: ApprovedPlanDetail) => void
}

export function PlanDetailSelector({ form, onSelect }: PlanDetailSelectorProps) {
    const { data: planDetails, isLoading } = useApprovedPlanDetails()

    const handleValueChange = (planDetailId: string) => {
        form.setValue('planDetailId', planDetailId, { shouldValidate: true })

        if (!planDetails) return
        const selected = planDetails.find((d) => d.id === planDetailId)
        if (!selected) return

        // Auto-fill các trường liên quan từ PlanDetail
        form.setValue('jobTitle', selected.positionTitle, { shouldValidate: true })
        form.setValue('quantity', selected.quantity, { shouldValidate: true })
        form.setValue('salaryRangeMin', selected.salaryRangeMin ?? 0, { shouldValidate: true })
        form.setValue('salaryRangeMax', selected.salaryRangeMax ?? 0, { shouldValidate: true })

        if (selected.requiredSkills) {
            form.setValue('requirements', selected.requiredSkills)
        }

        if (selected.endDate) {
            const deadline = selected.endDate.split('T')[0]
            form.setValue('applicationDeadline', deadline)
        }

        onSelect?.(selected)
    }

    const priorityLabel = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return '🔴 Khẩn cấp'
            case 'High':
                return '🟠 Cao'
            case 'Normal':
                return '🟢 Bình thường'
            case 'Low':
                return '🔵 Thấp'
            default:
                return priority
        }
    }

    if (isLoading) {
        return (
            <FormItem className="col-span-2">
                <FormLabel className="text-slate-700">
                    Kế hoạch tuyển dụng <span className="text-red-500">*</span>
                </FormLabel>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải danh sách...
                </div>
            </FormItem>
        )
    }

    const hasNoPlanDetails = !planDetails || planDetails.length === 0

    return (
        <FormField
            control={form.control}
            name="planDetailId"
            render={({ field }) => (
                <FormItem className="col-span-2">
                    <FormLabel className="text-slate-700">
                        Kế hoạch tuyển dụng{' '}
                        <span className="text-red-500">*</span>
                    </FormLabel>
                    <Select
                        onValueChange={handleValueChange}
                        value={field.value}
                        disabled={hasNoPlanDetails}
                    >
                        <FormControl>
                            <SelectTrigger className="transition-all focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400">
                                <SelectValue
                                    placeholder={
                                        hasNoPlanDetails
                                            ? 'Không có kế hoạch nào đã duyệt'
                                            : 'Chọn vị trí từ kế hoạch đã duyệt...'
                                    }
                                />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {planDetails?.map((detail) => (
                                <SelectItem
                                    key={detail.id}
                                    value={detail.id}
                                    className="py-3"
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium">
                                            {detail.positionTitle}
                                            <span className="text-slate-400 font-normal ml-2">
                                                ×{detail.quantity}
                                            </span>
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {detail.planName}
                                            {detail.planCode
                                                ? ` (${detail.planCode})`
                                                : ''}
                                            {' · '}
                                            {priorityLabel(detail.priority)}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
