'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import type { RecruitmentCampaign } from '../../types/recruitment-campaign-types'
import { createRecruitmentCampaign } from '../../api/recruitment-campaign-service'

// Schema
const campaignSchema = z.object({
    campaignName: z.string().min(1, 'Tên chiến dịch là bắt buộc'),
    campaignCode: z.string().min(1, 'Mã chiến dịch là bắt buộc'),
    description: z.string().optional(),
    fiscalYear: z.coerce.number().min(2000).max(2100),
    fiscalQuarter: z.coerce.number().min(1).max(4).optional(),
    submissionStartDate: z.date({ message: 'Ngày bắt đầu nhận là bắt buộc' }),
    submissionEndDate: z.date({ message: 'Ngày kết thúc nhận là bắt buộc' }),
    targetHireStartDate: z.date().optional(),
    targetHireEndDate: z.date().optional(),
    totalBudgetCeiling: z.coerce.number().min(0, 'Ngân sách không được âm').optional(),
    maxTotalPositions: z.coerce.number().min(0).optional(),
    status: z.string().default('Draft'),
}).refine(data => data.submissionEndDate >= data.submissionStartDate, {
    message: "Ngày kết thúc phải sau ngày bắt đầu",
    path: ["submissionEndDate"]
}).refine(data => {
    if (data.targetHireStartDate && data.targetHireEndDate) {
        return data.targetHireEndDate >= data.targetHireStartDate
    }
    return true
}, {
    message: "Ngày kết thúc tuyển dụng phải sau ngày bắt đầu tuyển dụng",
    path: ["targetHireEndDate"]
})

type CampaignFormValues = z.infer<typeof campaignSchema>

interface RecruitmentCampaignFormProps {
    campaign?: RecruitmentCampaign | null
    onSuccess?: () => void
    onCancel?: () => void
}

export function RecruitmentCampaignForm({
    campaign,
    onSuccess,
    onCancel
}: RecruitmentCampaignFormProps) {
    const { toast } = useToast()
    const isEdit = !!campaign

    const form = useForm<CampaignFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(campaignSchema) as any,
        defaultValues: {
            campaignName: '',
            campaignCode: '',
            description: '',
            fiscalYear: new Date().getFullYear(),
            fiscalQuarter: undefined,
            totalBudgetCeiling: undefined,
            maxTotalPositions: undefined,
            status: 'Draft',
        }
    })

    // Reset form when campaign changes
    useEffect(() => {
        form.reset({
            campaignName: campaign?.campaignName || '',
            campaignCode: campaign?.campaignCode || '',
            description: campaign?.description || '',
            fiscalYear: campaign?.fiscalYear || new Date().getFullYear(),
            fiscalQuarter: campaign?.fiscalQuarter || undefined,
            submissionStartDate: campaign ? new Date(campaign.submissionStartDate) : undefined,
            submissionEndDate: campaign ? new Date(campaign.submissionEndDate) : undefined,
            targetHireStartDate: campaign?.targetHireStartDate ? new Date(campaign.targetHireStartDate) : undefined,
            targetHireEndDate: campaign?.targetHireEndDate ? new Date(campaign.targetHireEndDate) : undefined,
            totalBudgetCeiling: campaign?.totalBudgetCeiling || undefined,
            maxTotalPositions: campaign?.maxTotalPositions || undefined,
            status: campaign?.status || 'Draft',
        })
    }, [campaign, form])

    async function onSubmit(data: CampaignFormValues) {
        try {
            const payload = {
                ...data,
                submissionStartDate: data.submissionStartDate.toISOString(),
                submissionEndDate: data.submissionEndDate.toISOString(),
                targetHireStartDate: data.targetHireStartDate?.toISOString(),
                targetHireEndDate: data.targetHireEndDate?.toISOString(),
            }

            if (isEdit && campaign) {
                // ⚠️ Backend KHÔNG CÓ route PUT /{id} cho update campaign
                // Hiện tại chỉ hỗ trợ tạo mới
                throw new Error('Backend chưa hỗ trợ cập nhật chiến dịch. Vui lòng tạo chiến dịch mới.')
            } else {
                await createRecruitmentCampaign(payload)
                toast({
                    title: 'Thành công',
                    description: 'Tạo chiến dịch mới thành công',
                })
            }

            onSuccess?.()
        } catch (error) {
            console.error(error)
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'

            if (errorMessage.toLowerCase().includes('mã chiến dịch') && errorMessage.toLowerCase().includes('đã tồn tại')) {
                form.setError('campaignCode', {
                    type: 'manual',
                    message: errorMessage
                })
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Thất bại',
                    description: errorMessage || (isEdit ? 'Cập nhật thất bại' : 'Tạo mới thất bại'),
                })
            }
        }
    }

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Section 1: General Information */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <div className="w-1 h-6 bg-[#0F4C75] rounded-full" />
                            <h3 className="text-lg font-semibold text-gray-800">Thông tin chung</h3>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <FormField
                                control={form.control}
                                name="campaignName"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={({ field }: { field: any }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Tên chiến dịch <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: Chiến dịch tuyển dụng Q1/2025" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="campaignCode"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Mã chiến dịch <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="VD: RC-2025-01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="fiscalYear"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Năm <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="fiscalQuarter"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Quý</FormLabel>
                                        <Select
                                            onValueChange={(value) => field.onChange((value && value !== "0") ? Number(value) : undefined)}
                                            value={field.value ? String(field.value) : ''}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn quý" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="0">Không chọn</SelectItem>
                                                <SelectItem value="1">Quý 1</SelectItem>
                                                <SelectItem value="2">Quý 2</SelectItem>
                                                <SelectItem value="3">Quý 3</SelectItem>
                                                <SelectItem value="4">Quý 4</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Section 2: Timeline */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <div className="w-1 h-6 bg-[#0F4C75] rounded-full" />
                            <h3 className="text-lg font-semibold text-gray-800">Thời hạn nhận hồ sơ & Tuyển dụng</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="submissionStartDate"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={({ field }: { field: any }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Ngày bắt đầu nhận <span className="text-red-500">*</span></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Chọn ngày</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                    className="p-2 [--cell-size:28px] [&_th]:text-[10px]"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="submissionEndDate"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={({ field }: { field: any }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Ngày kết thúc nhận <span className="text-red-500">*</span></FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Chọn ngày</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                    className="p-2 [--cell-size:28px] [&_th]:text-[10px]"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="targetHireStartDate"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={({ field }: { field: any }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Bắt đầu tuyển</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Chọn ngày</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                    className="p-2 [--cell-size:28px] [&_th]:text-[10px]"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="targetHireEndDate"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={({ field }: { field: any }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Kết thúc tuyển</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "dd/MM/yyyy")
                                                        ) : (
                                                            <span>Chọn ngày</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                    className="p-2 [--cell-size:28px] [&_th]:text-[10px]"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Section 3: Budget & Positions */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <div className="w-1 h-6 bg-[#0F4C75] rounded-full" />
                            <h3 className="text-lg font-semibold text-gray-800">Thông tin bổ sung</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="totalBudgetCeiling"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Tổng ngân sách dự kiến</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="maxTotalPositions"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                render={({ field }: { field: any }) => (
                                    <FormItem>
                                        <FormLabel>Tổng số vị trí cần tuyển</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Mô tả chi tiết</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Nhập mô tả chi tiết cho chiến dịch này..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
