'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { CalendarIcon, Loader2, Plus, Trash2, ArrowRight, CheckCircle2, Briefcase, DollarSign, Pencil, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { PlanDetail } from '@/features/dept-head/types/recruitment-plan-types'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// --- Schemas ---

const createPlanSchema = z.object({
    campaignId: z.string().min(1, 'Vui lòng chọn chiến dịch'),
    departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
    planName: z.string().min(5, 'Tên kế hoạch phải có ít nhất 5 ký tự'),
    description: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    totalBudget: z.coerce.number().min(0, 'Ngân sách phải lớn hơn hoặc bằng 0').optional(),
})

const createDetailSchema = z.object({
    positionTitle: z.string().min(2, 'Tên vị trí bắt buộc'),
    quantity: z.coerce.number().min(1, 'Số lượng tối thiểu là 1'),
    priority: z.enum(['Normal', 'High', 'Urgent']),
    salaryRangeMin: z.coerce.number().optional(),
    salaryRangeMax: z.coerce.number().min(0, 'Lương tối đa không hợp lệ'),
    minExperience: z.coerce.number().optional(),
    maxExperience: z.coerce.number().optional(),
    educationLevel: z.string().optional(),
    expectedStartDate: z.date().optional(),
    justification: z.string().optional(),
})

type CreatePlanValues = z.infer<typeof createPlanSchema>
type CreateDetailValues = z.infer<typeof createDetailSchema>

interface CreatePlanFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    defaultCampaignId?: string
    editPlanId?: string | null
}

interface Department {
    id: number
    departmentName: string
}

// --- Component ---

export function CreatePlanForm({ open, onOpenChange, onSuccess, defaultCampaignId, editPlanId }: CreatePlanFormProps) {
    const { toast } = useToast()
    const [step, setStep] = useState<'create-plan' | 'add-details'>('create-plan')
    const [createdPlanId, setCreatedPlanId] = useState<string | null>(null)
    const [createdPlanName, setCreatedPlanName] = useState<string>('')
    const [planCode, setPlanCode] = useState<string>('')

    // Data States
    const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([])
    const [detectedDepartment, setDetectedDepartment] = useState<Department | null>(null)
    const [localDetails, setLocalDetails] = useState<PlanDetail[]>([])

    // Pagination State
    const [page, setPage] = useState(1)
    const ITEMS_PER_PAGE = 5

    // Loading States
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false)
    const [isDetectingDepartment, setIsDetectingDepartment] = useState(false)
    const [isAddingDetail, setIsAddingDetail] = useState(false)

    // Forms
    const planForm = useForm<CreatePlanValues>({
        resolver: zodResolver(createPlanSchema) as any,
        defaultValues: {
            campaignId: defaultCampaignId || '',
            departmentId: '',
            planName: '',
            description: '',
            totalBudget: 0,
        },
    })

    const detailForm = useForm<CreateDetailValues>({
        resolver: zodResolver(createDetailSchema) as any,
        defaultValues: {
            positionTitle: '',
            quantity: 1,
            priority: 'Normal',
            salaryRangeMin: 0,
            salaryRangeMax: 0,
            minExperience: 0,
            maxExperience: 0,
            educationLevel: '',
            justification: ''
        }
    })

    // --- Computed ---
    const totalPages = Math.ceil(localDetails.length / ITEMS_PER_PAGE)
    const paginatedDetails = localDetails.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    // --- Effects ---

    useEffect(() => {
        if (open) {
            setCreatedPlanId(null)
            setLocalDetails([])
            setPlanCode('')
            setPage(1)

            // Clean slate for forms
            planForm.reset({
                campaignId: defaultCampaignId || '',
                departmentId: '',
                planName: '',
                description: '',
                totalBudget: 0,
            })
            detailForm.reset({
                positionTitle: '',
                quantity: 1,
                priority: 'Normal',
                salaryRangeMin: 0,
                salaryRangeMax: 0,
                minExperience: 0,
                maxExperience: 0,
                educationLevel: '',
                justification: ''
            })

            // Fetch common data
            fetchInitialData()

            if (editPlanId) {
                setStep('add-details')
                setCreatedPlanId(editPlanId)
                fetchPlanData(editPlanId)
            } else {
                setStep('create-plan')
                if (detectedDepartment) {
                    planForm.setValue('departmentId', detectedDepartment.id.toString())
                }
            }
        }
    }, [open, defaultCampaignId, editPlanId])

    useEffect(() => {
        if (detectedDepartment && !editPlanId && !planForm.getValues('departmentId')) {
            planForm.setValue('departmentId', detectedDepartment.id.toString())
        }
    }, [detectedDepartment, editPlanId])


    const fetchInitialData = async () => {
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

        if (!detectedDepartment) {
            setIsDetectingDepartment(true)
            try {
                const userNameEncoded = getCookie(STORAGE_KEYS.USER_NAME)
                if (userNameEncoded) {
                    const userName = decodeURIComponent(userNameEncoded)
                    const res = await apiClient.get(`/api/Employees?Search=${encodeURIComponent(userName)}&PageSize=1`)
                    if (res.ok) {
                        const data = await res.json()
                        const employee = data.items?.[0]
                        if (employee?.departmentId) {
                            setDetectedDepartment({
                                id: employee.departmentId,
                                departmentName: employee.departmentName,
                            })
                        }
                    }
                }
            } catch (e) {
                console.error(e)
            } finally {
                setIsDetectingDepartment(false)
            }
        }
    }

    const fetchPlanData = async (id: string) => {
        try {
            const res = await apiClient.get(`/api/RecruitmentPlans/${id}`)
            if (res.ok) {
                const plan = await res.json()
                setCreatedPlanName(plan.planName)
                setPlanCode(plan.planCode)

                planForm.reset({
                    campaignId: plan.campaignId,
                    departmentId: plan.departmentId?.toString(),
                    planName: plan.planName,
                    description: plan.description || '',
                    startDate: plan.startDate ? new Date(plan.startDate) : undefined,
                    endDate: plan.endDate ? new Date(plan.endDate) : undefined,
                    totalBudget: plan.totalBudget,
                })

                await fetchPlanDetails(id)
            }
        } catch (e) {
            console.error(e)
            toast({ variant: 'destructive', title: 'Lỗi tải dữ liệu', description: 'Không thể tải thông tin kế hoạch' })
        }
    }

    // --- Handlers ---

    const onSubmitPlan = async (values: CreatePlanValues) => {
        setIsLoading(true)
        try {
            if (values.startDate > values.endDate) {
                planForm.setError('endDate', { message: 'Ngày kết thúc phải sau ngày bắt đầu' })
                return
            }

            const payload: any = {
                campaignId: values.campaignId,
                departmentId: Number(values.departmentId),
                planName: values.planName,
                planCode: editPlanId ? planCode : `PLAN-${Date.now().toString().slice(-6)}`,
                description: values.description,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
                totalBudget: values.totalBudget || 0,
            }

            let res;
            if (editPlanId) {
                res = await apiClient.put(`/api/RecruitmentPlans/${editPlanId}`, payload)
            } else {
                res = await apiClient.post('/api/RecruitmentPlans', payload)
            }

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || 'Lỗi khi lưu kế hoạch')
            }

            const data = await res.json()
            const newId = editPlanId || data.id || data

            setCreatedPlanId(newId)
            setCreatedPlanName(values.planName)

            if (!editPlanId) {
                setStep('add-details')
                toast({ title: 'Đã tạo kế hoạch', description: 'Tiếp tục thêm các vị trí tuyển dụng.' })
            } else {
                toast({ title: 'Đã cập nhật thông tin', description: 'Kiểm tra danh sách vị trí bên dưới.' })
                setStep('add-details')
            }

            if (onSuccess) onSuccess()

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Lỗi', description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    const onAddDetail = async (values: CreateDetailValues) => {
        if (!createdPlanId) return

        setIsAddingDetail(true)
        try {
            const payload = {
                recruitmentPlanId: createdPlanId,
                ...values,
                expectedStartDate: values.expectedStartDate ? values.expectedStartDate.toISOString() : undefined
            }
            const res = await apiClient.post('/api/plan-details', payload)
            if (!res.ok) throw new Error('Không thể thêm đề xuất')

            await fetchPlanDetails(createdPlanId)
            detailForm.reset({
                positionTitle: '',
                quantity: 1,
                priority: 'Normal',
                salaryRangeMin: 0,
                salaryRangeMax: 0,
                minExperience: 0,
                maxExperience: 0,
                educationLevel: '',
                justification: '',
                expectedStartDate: undefined
            })
            detailForm.setValue('quantity', 1)

            toast({ description: 'Đã thêm vị trí thành công' })

        } catch (error) {
            toast({ variant: 'destructive', title: 'Lỗi', description: 'Không thể thêm đề xuất' })
        } finally {
            setIsAddingDetail(false)
        }
    }

    const fetchPlanDetails = async (planId: string) => {
        try {
            const res = await apiClient.get(`/api/plan-details?recruitmentPlanId=${planId}`)
            if (res.ok) {
                const data = await res.json()
                setLocalDetails(Array.isArray(data) ? data : data.items || [])
            }
        } catch (e) {
            console.error(e)
        }
    }

    const onDeleteDetail = async (detailId: string) => {
        if (!confirm('Xóa đề xuất này?')) return
        try {
            const res = await apiClient.delete(`/api/plan-details/${detailId}`)
            if (res.ok) {
                if (createdPlanId) fetchPlanDetails(createdPlanId)
                toast({ description: 'Đã xóa vị trí' })
            }
        } catch (e) { }
    }

    const handleFinish = () => {
        onOpenChange(false)
    }

    // --- Render ---

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "flex flex-col p-0 gap-0 bg-white shadow-2xl transition-all",
                step === 'add-details'
                    ? "sm:max-w-[1200px] h-[85vh]"  // Fixed height for detail view (bigger)
                    : "sm:max-w-[800px] max-h-[90vh]"
            )}>
                <DialogHeader className="px-6 py-4 bg-white border-b shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            {step === 'create-plan'
                                ? (editPlanId ? 'Chỉnh sửa Thông tin Kế hoạch' : 'Tạo Kế hoạch Tuyển dụng')
                                : `Quản lý Đề xuất - ${createdPlanName}`
                            }
                        </DialogTitle>
                        {step === 'add-details' && (
                            <Button variant="outline" size="sm" onClick={() => setStep('create-plan')} className="text-blue-600 border-blue-200 bg-blue-50">
                                <Pencil className="w-3 h-3 mr-2" /> Sửa thông tin
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                {/* Main Content - Flex Grow to take available space */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {step === 'create-plan' ? (
                        <Form {...planForm}>
                            <form id="create-plan-form" onSubmit={planForm.handleSubmit(onSubmitPlan)} className="space-y-6 max-w-3xl mx-auto pb-4">
                                <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-lg border shadow-sm">
                                    {(!defaultCampaignId && !editPlanId) && (
                                        <FormField control={planForm.control} name="campaignId" render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Chiến dịch <span className="text-red-500">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCampaigns}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Chọn chiến dịch" />
                                                        </SelectTrigger>
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

                                    <FormField control={planForm.control} name="planName" render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Tên kế hoạch <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Vd: Kế hoạch Tuyển dụng Q1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    <FormField control={planForm.control} name="startDate" render={({ field }) => (
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

                                    <FormField control={planForm.control} name="endDate" render={({ field }) => (
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

                                    <FormField control={planForm.control} name="totalBudget" render={({ field }) => (
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

                                    <FormField control={planForm.control} name="description" render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Ghi chú</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="..." className="min-h-[80px]" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )} />
                                </div>
                            </form>
                        </Form>
                    ) : (
                        // --- STEP 2: TABLE VIEW ---
                        <div className="flex flex-col gap-6 h-full">
                            {/* Horizontal Form */}
                            <div className="bg-white p-4 rounded-lg border shadow-sm shrink-0">
                                <h3 className="text-sm font-semibold mb-3">Thêm đề xuất mới</h3>
                                <Form {...detailForm}>
                                    <form onSubmit={detailForm.handleSubmit(onAddDetail)} className="grid grid-cols-12 gap-3 items-end">
                                        <FormField control={detailForm.control} name="positionTitle" render={({ field }) => (
                                            <FormItem className="col-span-3">
                                                <FormLabel className="text-xs">Tên vị trí <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Vd: Senior Dev" {...field} className="h-8" />
                                                </FormControl>
                                            </FormItem>
                                        )} />

                                        <FormField control={detailForm.control} name="quantity" render={({ field }) => (
                                            <FormItem className="col-span-1">
                                                <FormLabel className="text-xs">SL <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <Input type="number" min={1} {...field} className="h-8 px-2" />
                                                </FormControl>
                                            </FormItem>
                                        )} />

                                        <FormField control={detailForm.control} name="priority" render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel className="text-xs">Mức độ</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Normal">Bình thường</SelectItem>
                                                        <SelectItem value="High">Cao</SelectItem>
                                                        <SelectItem value="Urgent">Khẩn cấp</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />

                                        <FormField control={detailForm.control} name="salaryRangeMax" render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel className="text-xs">Lương Max</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} className="h-8" placeholder="0" />
                                                </FormControl>
                                            </FormItem>
                                        )} />

                                        <FormField control={detailForm.control} name="expectedStartDate" render={({ field }) => (
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
                                            <FormField control={detailForm.control} name="minExperience" render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className="text-[10px] text-gray-500 uppercase">Kinh nghiệm (Năm)</FormLabel>
                                                    <div className="flex items-center gap-1">
                                                        <Input type="number" {...field} className="h-7 text-xs" placeholder="Min" />
                                                    </div>
                                                </FormItem>
                                            )} />

                                            <FormField control={detailForm.control} name="educationLevel" render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className="text-[10px] text-gray-500 uppercase">Học vấn</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-7 text-xs">
                                                                <SelectValue placeholder="Chọn" />
                                                            </SelectTrigger>
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

                                            <FormField control={detailForm.control} name="justification" render={({ field }) => (
                                                <FormItem className="col-span-8">
                                                    <FormLabel className="text-[10px] text-gray-500 uppercase">Lý do / Ghi chú</FormLabel>
                                                    <Input {...field} className="h-7 text-xs" placeholder="Lý do tuyển dụng..." />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </form>
                                </Form>
                            </div>

                            {/* Data Table */}
                            <div className="bg-white border rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden min-h-[300px]">
                                <div className="flex-1 overflow-auto">
                                    <Table>
                                        <TableHeader className="bg-gray-50 sticky top-0 z-10">
                                            <TableRow>
                                                <TableHead className="w-[180px]">Vị trí</TableHead>
                                                <TableHead className="w-[60px] text-center">SL</TableHead>
                                                <TableHead className="w-[100px]">Ưu tiên</TableHead>
                                                <TableHead className="w-[120px]">Lương Max</TableHead>
                                                <TableHead className="w-[120px]">Kinh nghiệm</TableHead>
                                                <TableHead className="w-[120px]">Ngày cần</TableHead>
                                                <TableHead>Ghi chú</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedDetails.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="h-32 text-center text-gray-400">
                                                        Chưa có đề xuất nào
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                paginatedDetails.map((detail) => (
                                                    <TableRow key={detail.id}>
                                                        <TableCell className="font-medium text-xs">{detail.positionTitle}</TableCell>
                                                        <TableCell className="text-center text-xs">{detail.quantity}</TableCell>
                                                        <TableCell>
                                                            <span className={cn(
                                                                "px-2 py-1 rounded text-[10px] font-medium border",
                                                                detail.priority === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    detail.priority === 'High' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                                        'bg-gray-50 text-gray-600 border-gray-200'
                                                            )}>
                                                                {detail.priority}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {detail.salaryRangeMax ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(detail.salaryRangeMax) : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {detail.minExperience ? `> ${detail.minExperience} năm` : '-'}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {detail.expectedStartDate ? format(new Date(detail.expectedStartDate), 'dd/MM/yyyy') : '-'}
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px] truncate text-gray-500 text-xs" title={detail.justification}>
                                                            {detail.justification}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600" onClick={() => onDeleteDetail(detail.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="border-t p-2 flex items-center justify-between bg-gray-50 text-xs text-gray-500">
                                    <span>Hiển thị {((page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(page * ITEMS_PER_PAGE, localDetails.length)} trên tổng {localDetails.length}</span>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            disabled={page === 1}
                                            onClick={() => setPage(p => p - 1)}
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 bg-white border-t shrink-0">
                    {step === 'create-plan' ? (
                        <div className="flex w-full justify-end gap-3">
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Hủy</Button>
                            <Button className="bg-[#0F4C75]" disabled={isLoading} onClick={planForm.handleSubmit(onSubmitPlan)}>
                                {isLoading ? <Loader2 className="animate-spin" /> : <>
                                    {editPlanId ? 'Cập nhật' : 'Tiếp tục'} <ArrowRight className="w-4 h-4 ml-2" />
                                </>}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full justify-end gap-3">
                            <Button className="bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-300 min-w-[120px] shadow-sm transition-all" onClick={handleFinish}>
                                Đóng
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
