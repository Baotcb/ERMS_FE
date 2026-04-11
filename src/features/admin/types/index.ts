export type EnterpriseStatus = 'Active' | 'Suspended' | 'Locked' | 'Inactive'
export type EnterprisePlanTier = 'Free' | 'Pro'

export type PaymentActionType = 'Subscribe' | 'Renew' | 'Upgrade' | 'Downgrade'
export type StatusReasonCategory =
  | 'Violation'
  | 'PaymentIssue'
  | 'InformationPending'
  | 'AdminDecision'
  | 'EnterpriseRequest'
  | 'Other'

export interface StatusImpact {
  canLogin: boolean
  publicJobsVisible: boolean
  canRenewSubscription: boolean
  canPostJobs: boolean
  description: string
}

export interface EnterpriseListItem {
  id: string
  enterpriseName: string
  enterpriseCode: string
  contactEmail: string | null
  contactPhone: string | null
  status: EnterpriseStatus
  currentPlanName: string | null
  currentPlanCode: string | null
  subscriptionEndDate: string
  createdAt: string
  employeeCount: number
  logoUrl: string | null
}

export interface EnterpriseListResponse {
  items: EnterpriseListItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface EnterpriseListFilters {
  search?: string
  status?: EnterpriseStatus | ''
  planTier?: EnterprisePlanTier | ''
  expiringWithinDays?: number | ''
  pageNumber: number
  pageSize: number
}

export interface EnterprisePlanSummary {
  planId: string
  planName: string
  planCode: string
  priceMonthly: number
  priceYearly: number
  maxUsers: number
  maxJobPostings: number
  maxCourses: number
}

export interface EnterpriseLastPayment {
  amount: number
  paymentMethod: string | null
  paymentReference: string | null
  paidAt: string
}

export interface AdminStatusHistoryEntry {
  id: string
  action: string
  previousStatus: EnterpriseStatus | null
  newStatus: EnterpriseStatus
  reasonCategory: StatusReasonCategory
  adminNote: string | null
  notificationSent: boolean | null
  changedByName: string
  changedAt: string
}

export interface EnterpriseAdminDetail {
  id: string
  enterpriseName: string
  enterpriseCode: string
  taxCode: string | null
  address: string | null
  phone: string | null
  email: string | null
  website: string | null
  logoUrl: string | null
  createdAt: string
  createdByName: string | null
  status: EnterpriseStatus
  currentPlan: EnterprisePlanSummary
  subscriptionStartDate: string
  subscriptionEndDate: string
  subscriptionStatus: string
  lastPayment: EnterpriseLastPayment | null
  totalSpent: number
  departmentCount: number
  employeeCount: number
  jobPostingCount: number
  courseCount: number
  riskFlags: string[]
  statusHistory: AdminStatusHistoryEntry[]
}

export interface ChangeEnterpriseStatusRequest {
  enterpriseId: string
  newStatus: EnterpriseStatus
  reasonCategory: StatusReasonCategory
  adminNote: string
  sendNotification: boolean
}

export interface PaymentHistoryItem {
  id: string
  enterpriseId: string
  enterpriseName: string
  enterpriseCode: string
  actionType: PaymentActionType | string
  planName: string | null
  planCode: string | null
  previousPlanName: string | null
  amount: number
  currency: string
  paymentMethod: string | null
  paymentReference: string | null
  paymentLinkId?: string
  payosReference?: string
  paymentOrderStatus?: string
  periodStartDate: string
  periodEndDate: string
  note: string | null
  createdAt: string
}

export interface PaymentHistoryResponse {
  items: PaymentHistoryItem[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}

export interface PaymentHistoryFilters {
  enterpriseSearch?: string
  actionType?: PaymentActionType | ''
  paymentMethod?: string
  dateFrom?: string
  dateTo?: string
  pageNumber: number
  pageSize: number
}

export interface AdminDashboardAttentionItem {
  enterpriseId: string
  enterpriseName: string
  enterpriseCode: string
  status: EnterpriseStatus
  attentionReason: string
  subscriptionEndDate: string
}

export interface AdminDashboardActivityItem {
  approvalHistoryId: string
  enterpriseId: string
  enterpriseName: string
  enterpriseCode: string
  action: string
  previousStatus: EnterpriseStatus | null
  newStatus: EnterpriseStatus
  changedByName: string
  changedAt: string
}

export interface AdminDashboardData {
  totalEnterprises: number
  activeEnterprises: number
  lockedEnterprises: number
  expiringSoonEnterprises: number
  attentionItems: AdminDashboardAttentionItem[]
  recentActivities: AdminDashboardActivityItem[]
  recentPayments: {
    enterpriseId: string
    enterpriseName: string
    enterpriseCode: string
    actionType: string
    amount: number
    createdAt: string
  }[]
}

export interface PlatformStatsData {
  totalEnterprises: number
  activeEnterprises: number
  suspendedEnterprises: number
  lockedEnterprises: number
  inactiveEnterprises: number
  mrrCurrentMonth: number
  renewalRate: number
  statusDistribution: {
    status: EnterpriseStatus
    count: number
  }[]
  subscriptionMix: {
    tierName: 'Free' | 'Pro' | string
    count: number
  }[]
  integrationHealth: {
    healthy: number
    warning: number
    error: number
  }
  topEnterprises: {
    enterpriseId: string
    enterpriseName: string
    logoUrl: string | null
    metric: string
    value: number
    courseCount: number
    jobPostingCount: number
  }[]
  churnWatchlist: {
    enterpriseId: string
    enterpriseName: string
    status: EnterpriseStatus
    riskReason: string
    subscriptionEndDate: string
  }[]
}

export interface AIServiceOverview {
  providerName: string
  modelName: string
  apiKeyConfigured: boolean
  configurationStatus: string
  serviceMode: string
  scoredToday: number
  scoredLast7Days: number
  scoredLast30Days: number
  distinctEnterprisesLast30Days: number
  averageScoreLast30Days: number
  lastProcessedAt: string | null
  dailyVolumes: {
    date: string
    count: number
  }[]
  scoreDistribution: {
    bucket: string
    count: number
  }[]
}
