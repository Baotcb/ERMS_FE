export interface CreateJobPostingDto {
  planDetailId: string
  applicationDeadline: string // ISO date string
  titleOverride?: string
  descriptionOverride?: string
  benefits?: string
  location?: string
  remoteOption?: string
}

export interface UpdateJobPostingDto {
  id: string
  // Draft-only fields
  jobTitle?: string
  requirements?: string
  employmentType?: string
  experienceLevel?: string
  educationLevel?: string
  // Draft + Published fields
  description?: string
  benefits?: string
  applicationDeadline?: string
  location?: string
  remoteOption?: string
  salaryRangeMin?: number
  salaryRangeMax?: number
  showSalary?: boolean
  quantity?: number
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

export type JobStatus = 'Draft' | 'Published' | 'Closed' | 'Archived'

export interface JobPostingHistoryEntry {
  action: string
  previousStatus?: string
  newStatus: string // non-nullable — mirrors ApprovalHistory entity
  performedByName: string
  note?: string
  createdAt: string
}

// Standalone internal DTO — does NOT extend PublicJobPostingDto
// (the internal endpoint does not return enterpriseName / enterpriseLogoUrl)
export interface JobPostingDetailDto {
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
  departmentName: string

  // Internal-only fields
  status: JobStatus
  viewCount: number
  applicationCount: number
  closedAt?: string
  planDetailId?: string
  planName?: string
  campaignName?: string
  quotaUsed?: number
  quotaTotal?: number
  createdAt: string
  createdByName?: string
  publishedByName?: string
  updatedAt?: string

  // Application pipeline counts (all 10 stages)
  totalApplications?: number
  appliedCount?: number
  reviewingCount?: number
  shortlistedCount?: number
  interviewScheduledCount?: number
  interviewedCount?: number
  offerProcessingCount?: number
  offeredCount?: number
  hiredCount?: number
  rejectedCount?: number
  withdrawnCount?: number

  history?: JobPostingHistoryEntry[]
}

export interface GenerateJDRequest {
  planDetailId: string;
}

export interface GenerateJDResult {
  description: string;
  requirements?: string;
  benefits?: string;
  planDetailId: string;
}
