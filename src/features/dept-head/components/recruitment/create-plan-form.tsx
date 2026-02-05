'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import type { RecruitmentCampaign } from '@/features/hr/types/recruitment-campaign-types'
import { getCookie } from '@/features/core/auth/utils/auth-cookies'
import { STORAGE_KEYS } from '@/utils/constants'

// Define schema for form validation
const createPlanSchema = z.object({
    campaignId: z.string().min(1, 'Vui lòng chọn chiến dịch'),
    departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'), // Still required for payload
    planName: z.string().min(5, 'Tên kế hoạch phải có ít nhất 5 ký tự'),
    description: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    totalBudget: z.coerce.number().min(0, 'Ngân sách phải lớn hơn hoặc bằng 0').optional(),
})

type CreatePlanValues = z.infer<typeof createPlanSchema>

interface CreatePlanFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    defaultCampaignId?: string
}

interface Department {
    id: number
    departmentName: string
    departmentCode: string
}

interface Employee {
    id: number
    fullName: string
    departmentId: number
    departmentName: string
}

export function CreatePlanForm({ open, onOpenChange, onSuccess, defaultCampaignId }: CreatePlanFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)
    const [isDetectingDepartment, setIsDetectingDepartment] = useState(false)
    const [detectedDepartment, setDetectedDepartment] = useState<Department | null>(null)

    // Form definition
    const form = useForm<CreatePlanValues>({
        resolver: zodResolver(createPlanSchema) as unknown,
        defaultValues: {
            campaignId: defaultCampaignId || '',
            departmentId: '',
            planName: '',
            description: '',
            totalBudget: 0,
        },
    })

    // Fetch Data when dialog opens
    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                // 1. Fetch Campaigns (if needed)
                if (!defaultCampaignId) {
                    setIsLoadingCampaigns(true)
                    try {
                        const res = await apiClient.get('/api/RecruitmentCampaigns?Status=Open&PageSize=100')
                        if (res.ok) {
                            const data = await res.json()
                            setCampaigns(data.items || [])
                        }
                    } catch (error) {
                        console.error(error)
                    } finally {
                        setIsLoadingCampaigns(false)
                    }
                }

                // 2. Auto-detect User's Department
                setIsDetectingDepartment(true)
                try {
                    // Strategy: Search employee by User Name (from cookie)
                    const userNameEncoded = getCookie(STORAGE_KEYS.USER_NAME)
                    if (userNameEncoded) {
                        const userName = decodeURIComponent(userNameEncoded)
                        // Fetch employees filtering by name
                        const res = await apiClient.get(`/api/Employees?Search=${encodeURIComponent(userName)}&PageSize=10`)
                        if (res.ok) {
                            const data = await res.json()
                            // Find exact match or best guess
                            // The API searches specific fields, so the result list should be relevant.
                            // We take the first one that matches the name.
                            const employee = data.items?.find((e: Employee) => e.fullName === userName) || data.items?.[0]

                            if (employee && employee.departmentId) {
                                setDetectedDepartment({
                                    id: employee.departmentId,
                                    departmentName: employee.departmentName,
                                    departmentCode: '' // Not critical
                                })
                                // Auto-set form value
                                form.setValue('departmentId', employee.departmentId.toString())
                            }
                        }
                    }
                } catch (error) {
                    console.error('Failed to detect department', error)
                } finally {
                    setIsDetectingDepartment(false)
                }
            }
            fetchData()
        }
    }, [open, defaultCampaignId, form])

    const onSubmit = async (values: CreatePlanValues) => {
        setIsLoading(true)
        try {
            // Validate dates
            if (values.startDate > values.endDate) {
                form.setError('endDate', {
                    type: 'manual',
                    message: 'Ngày kết thúc phải sau ngày bắt đầu',
                })
                return
            }

            // Find selected campaign to get code
            const selectedCampaign = campaigns.find(c => c.id === values.campaignId) || { campaignCode: 'CAM' } // Fallback
            // If defaultCampaignId, we might not have the campaign object loaded if we skipped fetch. 
            // Ideally we should search locally or just rely on backend.
            // But we need a code for the planCode.

            const planCode = `PLAN-${Date.now()}` // Simplified code gen

            const payload = {
                campaignId: values.campaignId,
                departmentId: Number(values.departmentId), // Convert to int
                planName: values.planName,
                planCode: planCode,
                description: values.description,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
                totalBudget: values.totalBudget || 0,
            }

            const res = await apiClient.post('/api/RecruitmentPlans', payload)

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.message || 'Có lỗi xảy ra khi tạo kế hoạch')
            }

            toast({
                title: 'Tạo kế hoạch thành công',
                description: 'Kế hoạch tuyển dụng mới đã được tạo.',
            })

            form.reset()
            onOpenChange(false)
            if (onSuccess) onSuccess()

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: errorMessage,
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Tạo Kế Hoạch Tuyển Dụng Mới</DialogTitle>
                    <DialogDescription>
                        Tạo kế hoạch cho một chiến dịch đang mở. Điền đầy đủ thông tin bên dưới.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {defaultCampaignId ? (
                            <input type="hidden" {...form.register('campaignId')} />
                        ) : (
                            <FormField
                                control={form.control}
                                name="campaignId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Chiến dịch tuyển dụng <span className="text-red-500">*</span></FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            disabled={isLoadingCampaigns}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isLoadingCampaigns ? "Đang tải..." : "Chọn chiến dịch (Open)"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {campaigns.map((campaign) => (
                                                    <SelectItem key={campaign.id} value={campaign.id}>
                                                        {campaign.campaignName} ({campaign.campaignCode})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Hidden Department ID Input - Auto-populated */}
                        <input type="hidden" {...form.register('departmentId')} />

                        {/* Show Department Name if detected, else show warning/loading */}
                        <div className="text-sm">
                            <span className="font-medium text-gray-700">Phòng ban: </span>
                            {isDetectingDepartment ? (
                                <span className="text-gray-500 italic">Đang xác định...</span>
                            ) : detectedDepartment ? (
                                <span className="text-blue-600 font-semibold">{detectedDepartment.departmentName}</span>
                            ) : (
                                <span className="text-red-500">Không thể xác định phòng ban của bạn. Vui lòng liên hệ Admin.</span>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="planName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tên kế hoạch <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Kế hoạch tuyển dụng IT Q1" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Ngày bắt đầu <span className="text-red-500">*</span></FormLabel>
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
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Ngày kết thúc <span className="text-red-500">*</span></FormLabel>
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
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="totalBudget"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ngân sách dự kiến (VNĐ)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mô tả</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Mô tả chi tiết kế hoạch..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo kế hoạch
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
