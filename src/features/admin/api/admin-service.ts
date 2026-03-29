import { mutate, type Fetcher, useData } from '@/lib/swr/hooks'
import { apiClient } from '@/lib/api-client'
import type {
  AdminDashboardData,
  AIServiceOverview,
  ChangeEnterpriseStatusRequest,
  EnterpriseAdminDetail,
  EnterpriseListFilters,
  EnterpriseListItem,
  EnterpriseListResponse,
  PaymentHistoryFilters,
  PaymentHistoryResponse,
  PlatformStatsData,
} from '../types'

function stableSerializeParams(params: object): string {
  const entries = Object.entries(params as Record<string, unknown>).sort(([left], [right]) => left.localeCompare(right))
  const searchParams = new URLSearchParams()

  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === '') continue
    searchParams.set(key, String(value))
  }

  return searchParams.toString()
}

function isAdminCacheKey(key: unknown): boolean {
  return Array.isArray(key) && key[0] === 'admin'
}

function revalidateAdminCaches() {
  return mutate(isAdminCacheKey, undefined, { revalidate: true })
}

function revalidateAdminView(key: string) {
  return mutate(key, undefined, { revalidate: true })
}

async function readJsonResponse<T>(response: Response, fallbackErrorMessage: string): Promise<T> {
  if (!response.ok) {
    let message = fallbackErrorMessage

    try {
      const text = await response.text()
      if (text) {
        try {
          const parsed = JSON.parse(text) as { message?: string; title?: string; error?: string }
          message = parsed.message || parsed.title || parsed.error || message
        } catch {
          message = text || message
        }
      }
    } catch {
      // ignore
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return {} as T
  }

  const payload = (await response.json()) as unknown
  return normalizeApiPayload<T>(payload)
}

function normalizeApiPayload<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const envelope = payload as { data?: T; success?: boolean; message?: string }
    if (envelope.data !== undefined && (envelope.success !== undefined || envelope.message !== undefined)) {
      return envelope.data as T
    }
  }

  return payload as T
}

function buildQueryString(params: object): string {
  return stableSerializeParams(params)
}

function mapEnterpriseListItem(item: Record<string, unknown>): EnterpriseListItem {
  return {
    id: String(item.enterpriseId),
    enterpriseName: String(item.enterpriseName ?? ''),
    enterpriseCode: String(item.enterpriseCode ?? ''),
    contactEmail: (item.contactEmail as string | null) ?? null,
    contactPhone: (item.contactPhone as string | null) ?? null,
    status: String(item.status ?? 'Active') as EnterpriseListItem['status'],
    currentPlanName: (item.currentPlanName as string | null) ?? null,
    currentPlanCode: (item.currentPlanCode as string | null) ?? null,
    subscriptionEndDate: String(item.subscriptionEndDate ?? ''),
    createdAt: String(item.createdAt ?? ''),
    employeeCount: Number(item.employeeCount ?? 0),
    logoUrl: (item.logoUrl as string | null) ?? null,
  }
}

function mapEnterpriseListResponse(payload: Record<string, unknown>): EnterpriseListResponse {
  return {
    items: Array.isArray(payload.items) ? payload.items.map((item) => mapEnterpriseListItem(item as Record<string, unknown>)) : [],
    totalCount: Number(payload.totalCount ?? 0),
    pageNumber: Number(payload.pageNumber ?? 1),
    pageSize: Number(payload.pageSize ?? 10),
    totalPages: Number(payload.totalPages ?? 0),
  }
}

function mapEnterpriseDetail(payload: Record<string, unknown>): EnterpriseAdminDetail {
  const currentPlan = (payload.currentPlan as Record<string, unknown> | undefined) ?? {}
  const lastPayment = (payload.recentPayment as Record<string, unknown> | null | undefined) ?? null

  return {
    id: String(payload.enterpriseId),
    enterpriseName: String(payload.enterpriseName ?? ''),
    enterpriseCode: String(payload.enterpriseCode ?? ''),
    taxCode: (payload.taxCode as string | null) ?? null,
    address: (payload.address as string | null) ?? null,
    phone: (payload.phone as string | null) ?? null,
    email: (payload.email as string | null) ?? null,
    website: (payload.website as string | null) ?? null,
    logoUrl: (payload.logoUrl as string | null) ?? null,
    createdAt: String(payload.createdAt ?? ''),
    createdByName: (payload.createdByName as string | null) ?? null,
    status: String(payload.status ?? 'Active') as EnterpriseAdminDetail['status'],
    currentPlan: {
      planId: String(currentPlan.planId ?? ''),
      planName: String(currentPlan.planName ?? ''),
      planCode: String(currentPlan.planCode ?? ''),
      priceMonthly: Number(currentPlan.priceMonthly ?? 0),
      priceYearly: Number(currentPlan.priceYearly ?? 0),
      maxUsers: Number(currentPlan.maxUsers ?? 0),
      maxJobPostings: Number(currentPlan.maxJobPostings ?? 0),
      maxCourses: Number(currentPlan.maxCourses ?? 0),
    },
    subscriptionStartDate: String(payload.subscriptionStartDate ?? ''),
    subscriptionEndDate: String(payload.subscriptionEndDate ?? ''),
    subscriptionStatus: String(payload.subscriptionStatus ?? ''),
    lastPayment: lastPayment
      ? {
          amount: Number(lastPayment.amount ?? 0),
          paymentMethod: (lastPayment.paymentMethod as string | null) ?? null,
          paymentReference: (lastPayment.paymentReference as string | null) ?? null,
          paidAt: String(lastPayment.paidAt ?? ''),
        }
      : null,
    totalSpent: Number(payload.totalSpent ?? 0),
    departmentCount: Number(payload.departmentCount ?? 0),
    employeeCount: Number(payload.employeeCount ?? 0),
    jobPostingCount: Number(payload.jobPostingCount ?? 0),
    courseCount: Number(payload.courseCount ?? 0),
    riskFlags: Array.isArray(payload.riskFlags) ? payload.riskFlags.map((item) => String(item)) : [],
    statusHistory: Array.isArray(payload.statusHistory)
      ? payload.statusHistory.map((item) => {
          const history = item as Record<string, unknown>
          return {
            id: String(history.approvalHistoryId ?? ''),
            action: String(history.action ?? ''),
            previousStatus: (history.previousStatus as EnterpriseAdminDetail['status'] | null) ?? null,
            newStatus: String(history.newStatus ?? 'Active') as EnterpriseAdminDetail['status'],
            adminNote: (history.adminNote as string | null) ?? null,
            changedByName: String(history.changedByName ?? ''),
            changedAt: String(history.changedAt ?? ''),
          }
        })
      : [],
  }
}

function mapPaymentHistoryResponse(payload: Record<string, unknown>): PaymentHistoryResponse {
  return {
    items: Array.isArray(payload.items)
      ? payload.items.map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            id: String(item.id ?? ''),
            enterpriseId: String(item.enterpriseId ?? ''),
            enterpriseName: String(item.enterpriseName ?? ''),
            enterpriseCode: String(item.enterpriseCode ?? ''),
            actionType: String(item.actionType ?? ''),
            planName: (item.planName as string | null) ?? null,
            planCode: (item.planCode as string | null) ?? null,
            previousPlanName: (item.previousPlanName as string | null) ?? null,
            amount: Number(item.amount ?? 0),
            currency: String(item.currency ?? 'VND'),
            paymentMethod: (item.paymentMethod as string | null) ?? null,
            paymentReference: (item.paymentReference as string | null) ?? null,
            periodStartDate: String(item.periodStartDate ?? ''),
            periodEndDate: String(item.periodEndDate ?? ''),
            note: (item.note as string | null) ?? null,
            createdAt: String(item.createdAt ?? ''),
          }
        })
      : [],
    totalCount: Number(payload.totalCount ?? 0),
    pageNumber: Number(payload.pageNumber ?? 1),
    pageSize: Number(payload.pageSize ?? 10),
    totalPages: Number(payload.totalPages ?? 0),
  }
}

function mapAdminDashboard(payload: Record<string, unknown>): AdminDashboardData {
  return {
    totalEnterprises: Number(payload.totalEnterprises ?? 0),
    activeEnterprises: Number(payload.activeEnterprises ?? 0),
    lockedEnterprises: Number(payload.lockedEnterprises ?? 0),
    expiringSoonEnterprises: Number(payload.expiringSoonEnterprises ?? 0),
    attentionItems: Array.isArray(payload.attentionItems)
      ? payload.attentionItems.map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            enterpriseId: String(item.enterpriseId ?? ''),
            enterpriseName: String(item.enterpriseName ?? ''),
            enterpriseCode: String(item.enterpriseCode ?? ''),
            status: String(item.status ?? 'Active') as AdminDashboardData['attentionItems'][number]['status'],
            attentionReason: String(item.attentionReason ?? ''),
            subscriptionEndDate: String(item.subscriptionEndDate ?? ''),
          }
        })
      : [],
    recentActivities: Array.isArray(payload.recentActivities)
      ? payload.recentActivities.map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            approvalHistoryId: String(item.approvalHistoryId ?? ''),
            enterpriseId: String(item.enterpriseId ?? ''),
            enterpriseName: String(item.enterpriseName ?? ''),
            enterpriseCode: String(item.enterpriseCode ?? ''),
            action: String(item.action ?? ''),
            previousStatus: (item.previousStatus as AdminDashboardData['recentActivities'][number]['previousStatus']) ?? null,
            newStatus: String(item.newStatus ?? 'Active') as AdminDashboardData['recentActivities'][number]['newStatus'],
            changedByName: String(item.changedByName ?? ''),
            changedAt: String(item.changedAt ?? ''),
          }
        })
      : [],
    recentPayments: Array.isArray(payload.recentPayments)
      ? payload.recentPayments.map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            enterpriseId: String(item.enterpriseId ?? ''),
            enterpriseName: String(item.enterpriseName ?? ''),
            enterpriseCode: String(item.enterpriseCode ?? ''),
            actionType: String(item.actionType ?? ''),
            amount: Number(item.amount ?? 0),
            createdAt: String(item.createdAt ?? ''),
          }
        })
      : [],
  }
}

function mapPlatformStats(payload: Record<string, unknown>): PlatformStatsData {
  return {
    totalEnterprises: Number(payload.totalEnterprises ?? 0),
    activeEnterprises: Number(payload.activeEnterprises ?? 0),
    suspendedEnterprises: Number(payload.suspendedEnterprises ?? 0),
    lockedEnterprises: Number(payload.lockedEnterprises ?? 0),
    inactiveEnterprises: Number(payload.inactiveEnterprises ?? 0),
    mrrCurrentMonth: Number(payload.mrrCurrentMonth ?? 0),
    renewalRate: Number(payload.renewalRate ?? 0),
    statusDistribution: Array.isArray(payload.statusDistribution)
      ? payload.statusDistribution.map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            status: String(item.status ?? 'Active') as PlatformStatsData['statusDistribution'][number]['status'],
            count: Number(item.count ?? 0),
          }
        })
      : [],
    subscriptionMix: Array.isArray(payload.subscriptionMix)
      ? payload.subscriptionMix.map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            tierName: String(item.tierName ?? 'Free'),
            count: Number(item.count ?? 0),
          }
        })
      : [],
    topEnterprises: Array.isArray(payload.topEnterprises)
      ? payload.topEnterprises.map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            enterpriseId: String(item.enterpriseId ?? ''),
            enterpriseName: String(item.enterpriseName ?? ''),
            metric: String(item.metric ?? ''),
            value: Number(item.value ?? 0),
          }
        })
      : [],
    churnWatchlist: Array.isArray(payload.churnWatchlist)
      ? payload.churnWatchlist.map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            enterpriseId: String(item.enterpriseId ?? ''),
            enterpriseName: String(item.enterpriseName ?? ''),
            status: String(item.status ?? 'Active') as PlatformStatsData['churnWatchlist'][number]['status'],
            riskReason: String(item.riskReason ?? ''),
            subscriptionEndDate: String(item.subscriptionEndDate ?? ''),
          }
        })
      : [],
  }
}

function mapAiServiceOverview(payload: Record<string, unknown>): AIServiceOverview {
  return {
    providerName: String(payload.providerName ?? ''),
    modelName: String(payload.modelName ?? ''),
    apiKeyConfigured: Boolean(payload.apiKeyConfigured),
    configurationStatus: String(payload.configurationStatus ?? ''),
    serviceMode: String(payload.serviceMode ?? ''),
    scoredToday: Number(payload.scoredToday ?? 0),
    scoredLast7Days: Number(payload.scoredLast7Days ?? 0),
    scoredLast30Days: Number(payload.scoredLast30Days ?? 0),
    distinctEnterprisesLast30Days: Number(payload.distinctEnterprisesLast30Days ?? 0),
    averageScoreLast30Days: Number(payload.averageScoreLast30Days ?? 0),
    lastProcessedAt: payload.lastProcessedAt ? String(payload.lastProcessedAt) : null,
    dailyVolumes: Array.isArray(payload.dailyVolumes)
      ? payload.dailyVolumes.map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            date: String(item.date ?? ''),
            count: Number(item.count ?? 0),
          }
        })
      : [],
    scoreDistribution: Array.isArray(payload.scoreDistribution)
      ? payload.scoreDistribution.map((entry) => {
          const item = entry as Record<string, unknown>
          return {
            bucket: String(item.bucket ?? ''),
            count: Number(item.count ?? 0),
          }
        })
      : [],
  }
}

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  enterprises: () => [...adminKeys.all, 'enterprises'] as const,
  enterpriseList: (filters: EnterpriseListFilters) => [...adminKeys.enterprises(), buildQueryString(filters)] as const,
  enterpriseDetail: (id: string) => [...adminKeys.enterprises(), 'detail', id] as const,
  payments: () => [...adminKeys.all, 'payments'] as const,
  paymentHistory: (filters: PaymentHistoryFilters) => [...adminKeys.payments(), buildQueryString(filters)] as const,
  platformStats: () => [...adminKeys.all, 'platform-stats'] as const,
  aiServices: () => [...adminKeys.all, 'ai-services'] as const,
} as const

async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const response = await apiClient.get('/api/Admin/dashboard')
  const payload = await readJsonResponse<Record<string, unknown>>(response, 'Không thể tải dashboard admin')
  return mapAdminDashboard(payload)
}

async function fetchEnterpriseList([, , queryString]: readonly [string, string, string]): Promise<EnterpriseListResponse> {
  const response = await apiClient.get(`/api/Admin/enterprises?${queryString}`)
  const payload = await readJsonResponse<Record<string, unknown>>(response, 'Không thể tải danh sách doanh nghiệp')
  return mapEnterpriseListResponse(payload)
}

async function fetchEnterpriseDetail([, , , id]: readonly [string, string, string, string]): Promise<EnterpriseAdminDetail> {
  const response = await apiClient.get(`/api/Admin/enterprise/${encodeURIComponent(id)}`)
  const payload = await readJsonResponse<Record<string, unknown>>(response, 'Không thể tải chi tiết doanh nghiệp')
  return mapEnterpriseDetail(payload)
}

async function fetchPaymentHistory([, , queryString]: readonly [string, string, string]): Promise<PaymentHistoryResponse> {
  const response = await apiClient.get(`/api/Admin/payment-history?${queryString}`)
  const payload = await readJsonResponse<Record<string, unknown>>(response, 'Không thể tải lịch sử thanh toán')
  return mapPaymentHistoryResponse(payload)
}

async function fetchPlatformStats(): Promise<PlatformStatsData> {
  const response = await apiClient.get('/api/Admin/platform-stats')
  const payload = await readJsonResponse<Record<string, unknown>>(response, 'Không thể tải số liệu nền tảng')
  return mapPlatformStats(payload)
}

async function fetchAiServices(): Promise<AIServiceOverview> {
  const response = await apiClient.get('/api/Admin/ai-services')
  const payload = await readJsonResponse<Record<string, unknown>>(response, 'Không thể tải dữ liệu AI services')
  return mapAiServiceOverview(payload)
}

export function useAdminDashboard() {
  return useData<AdminDashboardData>(adminKeys.dashboard().join('/'), {
    fetcher: fetchAdminDashboard as unknown as Fetcher<AdminDashboardData>,
  })
}

export function revalidateAdminDashboard() {
  return revalidateAdminView(adminKeys.dashboard().join('/'))
}

export function useEnterpriseList(filters: EnterpriseListFilters) {
  const key = adminKeys.enterpriseList(filters)

  return useData<EnterpriseListResponse>(key, {
    fetcher: fetchEnterpriseList as unknown as Fetcher<EnterpriseListResponse>,
  })
}

export function revalidateEnterpriseList(filters: EnterpriseListFilters) {
  return revalidateAdminView(adminKeys.enterpriseList(filters).join('/'))
}

export function useEnterpriseAdminDetail(id: string | null) {
  const key = id ? adminKeys.enterpriseDetail(id) : null

  return useData<EnterpriseAdminDetail>(key, {
    fetcher: fetchEnterpriseDetail as unknown as Fetcher<EnterpriseAdminDetail>,
    shouldRetryOnError: false,
  })
}

export async function changeEnterpriseStatus(data: ChangeEnterpriseStatusRequest): Promise<void> {
  const response = await apiClient.put(
    `/api/Admin/enterprise/${encodeURIComponent(data.enterpriseId)}/status`,
    {
      newStatus: data.newStatus,
      adminNote: data.adminNote,
    }
  )

  await readJsonResponse<unknown>(response, 'Không thể thay đổi trạng thái doanh nghiệp')
  await revalidateAdminCaches()
}

export function useGlobalPaymentHistory(filters: PaymentHistoryFilters) {
  const key = adminKeys.paymentHistory(filters)

  return useData<PaymentHistoryResponse>(key, {
    fetcher: fetchPaymentHistory as unknown as Fetcher<PaymentHistoryResponse>,
  })
}

export function revalidateGlobalPaymentHistory(filters: PaymentHistoryFilters) {
  return revalidateAdminView(adminKeys.paymentHistory(filters).join('/'))
}

export function usePlatformStats() {
  return useData<PlatformStatsData>(adminKeys.platformStats().join('/'), {
    fetcher: fetchPlatformStats as unknown as Fetcher<PlatformStatsData>,
  })
}

export function revalidatePlatformStats() {
  return revalidateAdminView(adminKeys.platformStats().join('/'))
}

export function useAiServiceOverview() {
  return useData<AIServiceOverview>(adminKeys.aiServices().join('/'), {
    fetcher: fetchAiServices as unknown as Fetcher<AIServiceOverview>,
  })
}

export function revalidateAiServiceOverview() {
  return revalidateAdminView(adminKeys.aiServices().join('/'))
}
