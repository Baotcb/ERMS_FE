export interface CreateJobPostingDto {
  planDetailId: string
  jobTitle: string
  jobCode?: string
  description: string
  requirements?: string
  benefits?: string
  employmentType: string // 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  experienceLevel?: string // 'Intern' | 'Junior' | 'Mid-level' | 'Senior' | 'Lead' | 'Manager'
  educationLevel?: string // 'High School' | 'Bachelor' | 'Master' | 'PhD'
  salaryRangeMin?: number
  salaryRangeMax?: number
  showSalary: boolean
  location?: string
  remoteOption?: string // 'Remote' | 'On-site' | 'Hybrid'
  quantity: number
  applicationDeadline?: string // ISO date string
}

export interface UpdateJobPostingDto extends Partial<CreateJobPostingDto> {
  status?: JobStatus
}

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
}

export type JobStatus = 'Draft' | 'Published' | 'Closed'

export interface JobPostingDetailDto extends PublicJobPostingDto {
  status: JobStatus
  viewCount: number
  applicationCount: number
  publishedAt?: string
  closedAt?: string
  planDetailId?: string
  planName?: string
  campaignName?: string
  quotaUsed?: number
  quotaTotal?: number
}
