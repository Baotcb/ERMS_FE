export interface RecruitmentPlan {
    id: string
    campaignId: string
    departmentId: number
    planName: string
    planCode: string
    description?: string
    startDate: string
    endDate: string
    totalBudget: number
    status: 'Draft' | 'Pending' | 'Approved' | 'Rejected'
    createdByName: string
    createdAt: string
    updatedAt: string
    departmentName?: string
    planDetails: PlanDetail[]
}

export interface PlanDetail {
    id: string
    recruitmentPlanId: string
    positionTitle: string
    positionId?: number
    quantity: number
    priority: 'Normal' | 'High' | 'Urgent'
    justification?: string
    requiredSkills?: string
    minExperience?: number
    maxExperience?: number
    educationLevel?: string
    salaryRangeMin?: number
    salaryRangeMax: number
    expectedStartDate?: string
    status?: 'Pending' | 'Approved' | 'Rejected'
}

export interface PlanListResponse {
    items: RecruitmentPlan[]
    totalCount: number
    page: number
    pageSize: number
}
