export interface PublicJobPostingDto {
    id: string
    jobTitle: string
    jobCode?: string
    description: string
    requirements?: string
    benefits?: string
    employmentType: string
    experienceLevel?: string
    educationLevel?: string
    salaryRangeMin?: number
    salaryRangeMax?: number
    showSalary: boolean
    location?: string
    remoteOption?: string
    quantity: number
    applicationDeadline?: string
    publishedAt?: string
    enterpriseName: string
    enterpriseLogoUrl?: string
    departmentName: string
    isHot?: boolean // Frontend extra
}

export type Job = PublicJobPostingDto
