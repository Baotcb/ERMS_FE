import { useData } from '@/lib/swr/hooks'
import * as service from '../api/public-enterprise-service'
import type { PublicEnterprise, EnterpriseDetailsResponse, PublicJobPostingDto } from '../types'
import type { CompanyDetailResult } from '../utils/company-detail'

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

/**
 * Lấy thông tin công ty và danh sách jobs theo TÊN công ty
 * Dùng khi không có enterpriseId (backend không trả trong public jobs API)
 */
export function useEnterpriseByName(name: string | null) {
    return useData<{ company: PublicEnterprise; jobs: PublicJobPostingDto[] }>(
        name ? `/api/public/enterprises/by-name/${name}` : null,
        {
            fetcher: () => service.getEnterpriseByName(name!),
        }
    )
}

export function useCompanyDetail(identifier: string | null) {
    return useData<CompanyDetailResult>(
        identifier ? ['/api/public/enterprises/detail', identifier] : null,
        {
            fetcher: () => service.getCompanyDetail(identifier!),
        }
    )
}
