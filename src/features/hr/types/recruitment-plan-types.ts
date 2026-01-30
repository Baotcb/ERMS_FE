export interface RecruitmentPlan {
    id: string
    planName: string
    planCode: string
    description?: string
    startDate: string
    endDate: string
    totalBudget?: number
    status: string
    createdByName?: string
    approvedByName?: string
    approvedAt?: string
    createdAt: string
}

export interface CreateRecruitmentPlanRequest {
    planName: string
    planCode: string
    description?: string
    startDate: string
    endDate: string
    totalBudget?: number
}

export interface UpdateRecruitmentPlanRequest extends CreateRecruitmentPlanRequest {
    id: string
}

export interface GetRecruitmentPlansParams {
    page?: number
    pageSize?: number
    search?: string
    status?: string
}

export interface PaginatedResult<T> {
    items: T[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}
