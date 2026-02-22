import * as z from 'zod'
import type { RecruitmentCampaign } from '@/features/hr/types/recruitment-campaign-types'
import type { PlanDetail } from '@/features/dept-head/types/recruitment-plan-types'

// --- Zod Schemas ---

export const createPlanSchema = z.object({
    campaignId: z.string().min(1, 'Vui lòng chọn chiến dịch'),
    departmentId: z.string().min(1, 'Vui lòng chọn phòng ban'),
    planName: z.string().min(5, 'Tên kế hoạch phải có ít nhất 5 ký tự'),
    description: z.string().optional(),
    startDate: z.date(),
    endDate: z.date(),
    totalBudget: z.coerce.number().min(0, 'Ngân sách phải lớn hơn hoặc bằng 0').optional(),
})

export const createDetailSchema = z.object({
    positionTitle: z.string().min(2, 'Tên vị trí bắt buộc'),
    quantity: z.coerce.number().min(1, 'Số lượng tối thiểu là 1'),
    priority: z.enum(['Normal', 'High', 'Urgent']),
    salaryRangeMin: z.coerce.number().optional(),
    salaryRangeMax: z.coerce.number().min(0, 'Lương tối đa không hợp lệ'),
    minExperience: z.coerce.number().optional(),
    maxExperience: z.coerce.number().optional(),
    educationLevel: z.string().optional(),
    requiredSkills: z.string().optional(),
    expectedStartDate: z.date().optional(),
    justification: z.string().optional(),
})

export type CreatePlanValues = z.infer<typeof createPlanSchema>
export type CreateDetailValues = z.infer<typeof createDetailSchema>

// --- Interfaces ---

export interface Department {
    id: number
    departmentName: string
}

export interface CreatePlanFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    defaultCampaignId?: string
    editPlanId?: string | null
}

// --- Reducer ---

export interface PlanFormState {
    step: 'create-plan' | 'add-details'
    createdPlanId: string | null
    createdPlanName: string
    planCode: string
    campaigns: RecruitmentCampaign[]
    detectedDepartment: Department | null
    localDetails: PlanDetail[]
    page: number
    isLoading: boolean
    isLoadingCampaigns: boolean
    isAddingDetail: boolean
}

export type PlanFormAction =
    | { type: 'RESET' }
    | { type: 'SET_STEP'; step: PlanFormState['step'] }
    | { type: 'SET_PLAN_CODE'; planCode: string }
    | { type: 'SET_CAMPAIGNS'; campaigns: RecruitmentCampaign[] }
    | { type: 'SET_DEPARTMENT'; department: Department | null }
    | { type: 'SET_DETAILS'; details: PlanDetail[] }
    | { type: 'SET_PAGE'; page: number }
    | { type: 'SET_LOADING'; key: 'isLoading' | 'isLoadingCampaigns' | 'isAddingDetail'; value: boolean }
    | { type: 'PLAN_CREATED'; id: string; name: string }
    | { type: 'INIT_EDIT_MODE'; planId: string; planName: string; planCode: string }

export const ITEMS_PER_PAGE = 5

export const initialPlanFormState: PlanFormState = {
    step: 'create-plan',
    createdPlanId: null,
    createdPlanName: '',
    planCode: '',
    campaigns: [],
    detectedDepartment: null,
    localDetails: [],
    page: 1,
    isLoading: false,
    isLoadingCampaigns: false,
    isAddingDetail: false,
}

export function planFormReducer(state: PlanFormState, action: PlanFormAction): PlanFormState {
    switch (action.type) {
        case 'RESET':
            return {
                ...initialPlanFormState,
                detectedDepartment: state.detectedDepartment,
                campaigns: state.campaigns,
            }
        case 'SET_STEP':
            return { ...state, step: action.step }
        case 'SET_PLAN_CODE':
            return { ...state, planCode: action.planCode }
        case 'SET_CAMPAIGNS':
            return { ...state, campaigns: action.campaigns, isLoadingCampaigns: false }
        case 'SET_DEPARTMENT':
            return { ...state, detectedDepartment: action.department }
        case 'SET_DETAILS':
            return { ...state, localDetails: action.details }
        case 'SET_PAGE':
            return { ...state, page: action.page }
        case 'SET_LOADING':
            return { ...state, [action.key]: action.value }
        case 'PLAN_CREATED':
            return { ...state, createdPlanId: action.id, createdPlanName: action.name, step: 'add-details', isLoading: false }
        case 'INIT_EDIT_MODE':
            return { ...state, step: 'add-details', createdPlanId: action.planId, createdPlanName: action.planName, planCode: action.planCode }
        default:
            return state
    }
}

export const PLAN_FORM_DEFAULTS = {
    campaignId: '',
    departmentId: '',
    planName: '',
    description: '',
    totalBudget: 0,
}

export const DETAIL_FORM_DEFAULTS: CreateDetailValues = {
    positionTitle: '',
    quantity: 1,
    priority: 'Normal',
    salaryRangeMin: 0,
    salaryRangeMax: 0,
    minExperience: 0,
    maxExperience: 0,
    educationLevel: '',
    requiredSkills: '',
    justification: '',
}
