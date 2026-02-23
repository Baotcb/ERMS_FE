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
    enterpriseName: string
    enterpriseLogoUrl?: string
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

export interface PublicEnterprise {
    enterpriseName: string
    enterpriseLogoUrl?: string
    jobCount: number
    locations: string[]
    departmentName?: string
}
