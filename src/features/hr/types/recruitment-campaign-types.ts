export interface RecruitmentCampaign {
    id: string
    campaignName: string
    campaignCode: string
    description?: string
    fiscalYear: number
    fiscalQuarter?: number
    submissionStartDate: string
    submissionEndDate: string
    targetHireStartDate?: string
    targetHireEndDate?: string
    totalBudgetCeiling?: number
    maxTotalPositions?: number
    status: string
    createdByName?: string
    createdAt: string
    usedBudget?: number
    pendingBudget?: number
    remainingBudget?: number
}

export interface CreateRecruitmentCampaignRequest {
    campaignName: string
    campaignCode: string
    description?: string
    fiscalYear: number
    fiscalQuarter?: number
    submissionStartDate: string
    submissionEndDate: string
    targetHireStartDate?: string
    targetHireEndDate?: string
    totalBudgetCeiling?: number
    maxTotalPositions?: number
}

export interface UpdateRecruitmentCampaignRequest extends CreateRecruitmentCampaignRequest {
    id: string
}

export interface GetRecruitmentCampaignsParams {
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
