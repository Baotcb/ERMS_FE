'use client'

import { useReducer, useEffect, useCallback } from 'react'
import { useForm, Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowRight, Pencil } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { getCookie } from '@/features/core/auth/utils/auth-cookies'
import { STORAGE_KEYS } from '@/utils/constants'

import {
    type CreatePlanFormProps,
    type CreatePlanValues,
    type CreateDetailValues,
    createPlanSchema,
    createDetailSchema,
    planFormReducer,
    initialPlanFormState,
    PLAN_FORM_DEFAULTS,
    DETAIL_FORM_DEFAULTS,
} from './create-plan-types'
import { PlanFormStep } from './plan-form-step'
import { PlanDetailFormSection } from './plan-detail-form-section'
import { PlanDetailTableSection } from './plan-detail-table-section'

// --- Component ---

export function CreatePlanForm({ open, onOpenChange, onSuccess, defaultCampaignId, editPlanId }: CreatePlanFormProps) {
    const { toast } = useToast()
    const [state, dispatch] = useReducer(planFormReducer, initialPlanFormState)

    const planForm = useForm<CreatePlanValues>({
        resolver: zodResolver(createPlanSchema) as unknown as Resolver<CreatePlanValues>,
        defaultValues: { ...PLAN_FORM_DEFAULTS, campaignId: defaultCampaignId || '' },
    })

    const detailForm = useForm<CreateDetailValues>({
        resolver: zodResolver(createDetailSchema) as unknown as Resolver<CreateDetailValues>,
        defaultValues: DETAIL_FORM_DEFAULTS,
    })

    // --- Data Fetching ---

    const fetchPlanDetails = useCallback(async (planId: string) => {
        try {
            const res = await apiClient.get(`/api/plan-details?recruitmentPlanId=${planId}`)
            if (res.ok) {
                const data = await res.json()
                dispatch({ type: 'SET_DETAILS', details: Array.isArray(data) ? data : data.items || [] })
            }
        } catch (e) {
            console.error(e)
        }
    }, [])

    // --- Initialization Effect ---

    useEffect(() => {
        if (!open) return

        // Single dispatch replaces 4 separate setState calls
        dispatch({ type: 'RESET' })
        planForm.reset({ ...PLAN_FORM_DEFAULTS, campaignId: defaultCampaignId || '' })
        detailForm.reset(DETAIL_FORM_DEFAULTS)

        const fetchInitialData = async () => {
            if (!defaultCampaignId) {
                dispatch({ type: 'SET_LOADING', key: 'isLoadingCampaigns', value: true })
                try {
                    const res = await apiClient.get('/api/RecruitmentCampaigns?Status=Open&PageSize=100')
                    if (res.ok) {
                        const data = await res.json()
                        dispatch({ type: 'SET_CAMPAIGNS', campaigns: data.items || [] })
                    }
                } catch (error) {
                    console.error(error)
                    dispatch({ type: 'SET_LOADING', key: 'isLoadingCampaigns', value: false })
                }
            }

            if (!state.detectedDepartment) {
                try {
                    const userNameEncoded = getCookie(STORAGE_KEYS.USER_NAME)
                    if (userNameEncoded) {
                        const userName = decodeURIComponent(userNameEncoded)
                        const res = await apiClient.get(`/api/Employees?Search=${encodeURIComponent(userName)}&PageSize=1`)
                        if (res.ok) {
                            const data = await res.json()
                            const employee = data.items?.[0]
                            if (employee?.departmentId) {
                                dispatch({
                                    type: 'SET_DEPARTMENT',
                                    department: { id: employee.departmentId, departmentName: employee.departmentName }
                                })
                            }
                        }
                    }
                } catch (e) {
                    console.error(e)
                }
            }
        }

        const fetchPlanData = async (id: string) => {
            try {
                const res = await apiClient.get(`/api/RecruitmentPlans/${id}`)
                if (res.ok) {
                    const plan = await res.json()
                    // Single dispatch replaces 3 separate setState calls
                    dispatch({ type: 'INIT_EDIT_MODE', planId: id, planName: plan.planName, planCode: plan.planCode })
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

        fetchInitialData()

        if (editPlanId) {
            dispatch({ type: 'SET_LOADING', key: 'isLoading', value: true })
            fetchPlanData(editPlanId)
        } else {
            dispatch({ type: 'SET_STEP', step: 'create-plan' })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, defaultCampaignId, editPlanId, fetchPlanDetails, planForm])

    useEffect(() => {
        if (state.detectedDepartment && !editPlanId && !planForm.getValues('departmentId')) {
            planForm.setValue('departmentId', state.detectedDepartment.id.toString())
        }
    }, [state.detectedDepartment, editPlanId, planForm])

    // --- Handlers ---

    const onSubmitPlan = async (values: CreatePlanValues) => {
        dispatch({ type: 'SET_LOADING', key: 'isLoading', value: true })
        try {
            if (values.startDate > values.endDate) {
                planForm.setError('endDate', { message: 'Ngày kết thúc phải sau ngày bắt đầu' })
                return
            }

            const payload = {
                campaignId: values.campaignId,
                departmentId: Number(values.departmentId),
                planName: values.planName,
                planCode: editPlanId ? state.planCode : `PLAN-${Date.now().toString().slice(-6)}`,
                description: values.description,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
                totalBudget: values.totalBudget || 0,
            }

            const res = editPlanId
                ? await apiClient.put('/api/RecruitmentPlans', { id: editPlanId, ...payload })
                : await apiClient.post('/api/RecruitmentPlans', payload)

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || 'Lỗi khi lưu kế hoạch')
            }

            const data = await res.json()
            const newId = editPlanId || data.recruitmentPlanId || data.id || data

            // Single dispatch replaces 3 separate setState calls (setCreatedPlanId, setCreatedPlanName, setStep)
            dispatch({ type: 'PLAN_CREATED', id: newId, name: values.planName })

            toast({
                title: editPlanId ? 'Đã cập nhật thông tin' : 'Đã tạo kế hoạch',
                description: editPlanId ? 'Kiểm tra danh sách vị trí bên dưới.' : 'Tiếp tục thêm các vị trí tuyển dụng.',
            })

            if (onSuccess) onSuccess()
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Lỗi không xác định'
            toast({ variant: 'destructive', title: 'Lỗi', description: message })
        } finally {
            dispatch({ type: 'SET_LOADING', key: 'isLoading', value: false })
        }
    }

    const onAddDetail = async (values: CreateDetailValues) => {
        if (!state.createdPlanId) return
        dispatch({ type: 'SET_LOADING', key: 'isAddingDetail', value: true })
        try {
            const payload = {
                recruitmentPlanId: state.createdPlanId,
                ...values,
                salaryRangeMin: values.salaryRangeMin || undefined,
                minExperience: values.minExperience || undefined,
                maxExperience: values.maxExperience || undefined,
                expectedStartDate: values.expectedStartDate ? values.expectedStartDate.toISOString() : undefined,
            }
            const res = await apiClient.post('/api/plan-details', payload)
            if (!res.ok) {
                const errorData = await res.json().catch(() => null)
                let errorMessage = 'Không thể thêm đề xuất'
                if (errorData?.message) {
                    errorMessage = errorData.message
                } else if (errorData?.errors) {
                    errorMessage = Object.values(errorData.errors).flat().join('; ')
                } else if (typeof errorData === 'object' && errorData !== null) {
                    const msgs = Object.values(errorData).flat().filter((v): v is string => typeof v === 'string')
                    if (msgs.length > 0) errorMessage = msgs.join('; ')
                }
                throw new Error(errorMessage)
            }

            await fetchPlanDetails(state.createdPlanId)
            detailForm.reset({ ...DETAIL_FORM_DEFAULTS, expectedStartDate: undefined })
            detailForm.setValue('quantity', 1)
            toast({ description: 'Đã thêm vị trí thành công' })
        } catch (error) {
            toast({ variant: 'destructive', title: 'Lỗi', description: error instanceof Error ? error.message : 'Không thể thêm đề xuất' })
        } finally {
            dispatch({ type: 'SET_LOADING', key: 'isAddingDetail', value: false })
        }
    }

    const onDeleteDetail = async (detailId: string) => {
        if (!confirm('Xóa đề xuất này?')) return
        try {
            const res = await apiClient.delete('/api/plan-details', { id: detailId })
            if (res.ok) {
                if (state.createdPlanId) fetchPlanDetails(state.createdPlanId)
                toast({ description: 'Đã xóa vị trí' })
            }
        } catch (error) {
            console.error('Failed to delete plan detail:', error)
            toast({ title: 'Lỗi', description: 'Không thể xóa vị trí. Vui lòng thử lại.', variant: 'destructive' })
        }
    }

    // --- Render ---

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "flex flex-col p-0 gap-0 bg-white shadow-2xl transition-all",
                state.step === 'add-details' ? "sm:max-w-[1200px] h-[85vh]" : "sm:max-w-[800px] max-h-[90vh]"
            )}>
                <DialogHeader className="px-6 py-4 bg-white border-b shrink-0">
                    <DialogDescription className="sr-only">
                        {state.step === 'create-plan' ? 'Form tạo kế hoạch tuyển dụng' : 'Quản lý đề xuất vị trí'}
                    </DialogDescription>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            {state.step === 'create-plan'
                                ? (editPlanId ? 'Chỉnh sửa Thông tin Kế hoạch' : 'Tạo Kế hoạch Tuyển dụng')
                                : `Quản lý Đề xuất - ${state.createdPlanName}`
                            }
                        </DialogTitle>
                        {state.step === 'add-details' && (
                            <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'SET_STEP', step: 'create-plan' })} className="text-blue-600 border-blue-200 bg-blue-50">
                                <Pencil className="w-3 h-3 mr-2" /> Sửa thông tin
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {state.isLoading && editPlanId ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                <span className="text-sm text-gray-500">Đang tải dữ liệu kế hoạch...</span>
                            </div>
                        </div>
                    ) : state.step === 'create-plan' ? (
                        <PlanFormStep
                            form={planForm}
                            campaigns={state.campaigns}
                            detectedDepartment={state.detectedDepartment}
                            isLoadingCampaigns={state.isLoadingCampaigns}
                            showCampaignField={!defaultCampaignId && !editPlanId}
                            onSubmit={onSubmitPlan}
                        />
                    ) : (
                        <div className="flex flex-col gap-6 h-full">
                            <PlanDetailFormSection form={detailForm} isAddingDetail={state.isAddingDetail} onSubmit={onAddDetail} />
                            <PlanDetailTableSection
                                details={state.localDetails}
                                page={state.page}
                                onPageChange={(p) => dispatch({ type: 'SET_PAGE', page: p })}
                                onDelete={onDeleteDetail}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="px-6 py-4 bg-white border-t shrink-0">
                    {state.step === 'create-plan' ? (
                        <div className="flex w-full justify-end gap-3">
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={state.isLoading}>Hủy</Button>
                            <Button className="bg-[#0F4C75]" disabled={state.isLoading} onClick={planForm.handleSubmit(onSubmitPlan)}>
                                {state.isLoading ? <Loader2 className="animate-spin" /> : <>
                                    {editPlanId ? 'Cập nhật' : 'Tiếp tục'} <ArrowRight className="w-4 h-4 ml-2" />
                                </>}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex w-full justify-end gap-3">
                            <Button className="bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-100 hover:border-gray-300 min-w-[120px] shadow-sm transition-all" onClick={() => onOpenChange(false)}>
                                Đóng
                            </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
