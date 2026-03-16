export interface PublicJobPostingDto {
    id: string
    jobTitle: string
    jobCode?: string
    description: string
    requirements?: string
    benefits?: string
    employmentType: 'FullTime' | 'Full-time' | 'PartTime' | 'Part-time' | 'Contract' | 'Internship' | string
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

export interface PublicDepartmentFilterOption {
    id: number
    departmentName: string
    jobCount: number
}

export interface PublicJobFilterOption {
    value: string
    label: string
}

export interface PublicSalaryBucket {
    value: string
    label: string
    minSalary?: number
    maxSalary?: number
}

export interface PublicJobFilterOptionsResponse {
    departments: PublicDepartmentFilterOption[]
    locations: string[]
    employmentTypes: PublicJobFilterOption[]
    experienceBuckets: PublicJobFilterOption[]
    salaryBuckets: PublicSalaryBucket[]
}

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
