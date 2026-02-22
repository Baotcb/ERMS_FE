import { UseFormReturn } from 'react-hook-form'
import { CalendarIcon, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import type { RecruitmentCampaign } from '@/features/hr/types/recruitment-campaign-types'
import type { CreatePlanValues, Department } from './create-plan-types'

interface PlanFormStepProps {
    form: UseFormReturn<CreatePlanValues>
    campaigns: RecruitmentCampaign[]
    detectedDepartment: Department | null
    isLoadingCampaigns: boolean
    showCampaignField: boolean
    onSubmit: (values: CreatePlanValues) => void
}

export function PlanFormStep({ form, campaigns, detectedDepartment, isLoadingCampaigns, showCampaignField, onSubmit }: PlanFormStepProps) {
    return (
        <Form {...form}>
            <form id="create-plan-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl mx-auto pb-4">
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
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="totalBudget" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ngân sách (VNĐ)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input type="number" className="pl-9" placeholder="0" {...field} />
                                </div>
                            </FormControl>
                        </FormItem>
                    )} />

                    <FormItem>
                        <FormLabel>Phòng ban</FormLabel>
                        <div className="h-10 px-3 py-2 border rounded-md bg-gray-100 text-sm text-gray-500 flex items-center">
                            {detectedDepartment?.departmentName || 'Không xác định'}
                        </div>
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
