import { useData } from '@/lib/swr/hooks'
import * as service from '../api/public-enterprise-service'
import type { PublicEnterprise, EnterpriseDetailsResponse, PublicJobPostingDto } from '../types'

export function usePublicEnterprises() {
    return useData<PublicEnterprise[]>('/api/public/enterprises', {
        fetcher: () => service.getPublicEnterprises(),
    })
}

/**
 * Lấy thông tin chi tiết 1 công ty bằng ID (từ API backend)
 * GET /api/Enterprise/{id}
 */
export function useEnterpriseDetails(id: string | null) {
    return useData<EnterpriseDetailsResponse>(
        id ? `/api/Enterprise/${id}` : null,
        {
            fetcher: () => service.getEnterpriseById(id!),
        }
    )
}

/**
 * Lấy danh sách jobs của 1 công ty
 * GET /api/public/jobs?EnterpriseId={id}
 */
export function useEnterpriseJobs(
    enterpriseId: string | null,
    params?: { pageNumber?: number; pageSize?: number }
) {
    return useData<{ items: PublicJobPostingDto[]; totalCount: number }>(
        enterpriseId ? [`/api/public/jobs/enterprise/${enterpriseId}`, params?.pageNumber] : null,
        {
            fetcher: () => service.getJobsByEnterpriseId(enterpriseId!, params),
        }
    )
}
