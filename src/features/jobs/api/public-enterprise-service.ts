import { apiClient } from '@/lib/api-client'
import { getPublicJobs } from './public-job-service'
import type { PublicEnterprise, EnterpriseDetailsResponse, PublicJobPostingDto } from '../types'

/**
 * Trích xuất danh sách công ty từ public jobs API
 * Group theo enterpriseName, đếm job count, gom locations
 */
export async function getPublicEnterprises(): Promise<PublicEnterprise[]> {
    const response = await getPublicJobs({ pageSize: 100 })

    const enterpriseMap = new Map<string, PublicEnterprise>()

    for (const job of response.items) {
        const key = job.enterpriseId || job.enterpriseName
        const existing = enterpriseMap.get(key)

        if (existing) {
            existing.jobCount += 1
            if (job.location && !existing.locations.includes(job.location)) {
                existing.locations.push(job.location)
            }
            if (!existing.enterpriseLogoUrl && job.enterpriseLogoUrl) {
                existing.enterpriseLogoUrl = job.enterpriseLogoUrl
            }
        } else {
            enterpriseMap.set(key, {
                id: job.enterpriseId,
                enterpriseName: job.enterpriseName,
                enterpriseLogoUrl: job.enterpriseLogoUrl,
                jobCount: 1,
                locations: job.location ? [job.location] : [],
                departmentName: job.departmentName,
            })
        }
    }

    return Array.from(enterpriseMap.values())
        .sort((a, b) => b.jobCount - a.jobCount)
}

/**
 * Lấy thông tin chi tiết 1 công ty qua API backend
 * GET /api/Enterprise/{id}
 */
export async function getEnterpriseById(id: string): Promise<EnterpriseDetailsResponse> {
    const response = await apiClient.get(`/api/Enterprise/${id}`, {
        cache: 'force-cache',
    })
    if (!response.ok) {
        throw new Error('Không thể tải thông tin công ty')
    }
    return response.json()
}

/**
 * Lấy danh sách jobs của 1 công ty
 * GET /api/public/jobs?EnterpriseId={id}
 */
export async function getJobsByEnterpriseId(
    enterpriseId: string,
    params?: { pageNumber?: number; pageSize?: number }
): Promise<{ items: PublicJobPostingDto[]; totalCount: number }> {
    const response = await getPublicJobs({
        pageSize: params?.pageSize ?? 50,
        pageNumber: params?.pageNumber ?? 1,
        enterpriseId,
    })
    return { items: response.items, totalCount: response.totalCount }
}
