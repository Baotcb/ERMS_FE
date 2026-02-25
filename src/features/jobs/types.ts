export interface PublicJobPostingDto {
    id: string
    jobTitle: string
    jobCode?: string
    description: string
    requirements?: string
    benefits?: string
    employmentType: 'FullTime' | 'PartTime' | 'Contract' | 'Internship'
    experienceLevel?: string
    educationLevel?: string
    salaryRangeMin?: number
    salaryRangeMax?: number
    showSalary: boolean
    location?: string
    remoteOption: 'OnSite' | 'Remote' | 'Hybrid'
    quantity: number
    applicationDeadline?: string
    publishedAt?: string
    enterpriseId?: string
    enterpriseName: string
    enterpriseLogoUrl?: string
    enterpriseWebsite?: string
    departmentName: string
    isHot?: boolean
}

export interface PublicJobsResponse {
    items: PublicJobPostingDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
    totalPages: number
}

export type Job = PublicJobPostingDto

// Derived from jobs API (for company listing page)
export interface PublicEnterprise {
    id?: string
    enterpriseName: string
    enterpriseLogoUrl?: string
    jobCount: number
    locations: string[]
    departmentName?: string
}

// From GET /api/Enterprise/{id} - Backend response
export interface EnterpriseDetailsResponse {
    id: string
    enterpriseName: string
    enterpriseCode: string
    address?: string
    phone?: string
    email?: string
    website?: string
    logoUrl?: string
}
