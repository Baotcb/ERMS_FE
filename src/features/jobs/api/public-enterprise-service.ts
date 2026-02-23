import { getPublicJobs } from './public-job-service'
import type { PublicEnterprise } from '../types'

/**
 * Trích xuất danh sách công ty từ public jobs API
 * Group theo enterpriseName, đếm job count, gom locations
 */
export async function getPublicEnterprises(): Promise<PublicEnterprise[]> {
    // Lấy nhiều jobs để có đủ dữ liệu công ty
    const response = await getPublicJobs({ pageSize: 100 })

    const enterpriseMap = new Map<string, PublicEnterprise>()

    for (const job of response.items) {
        const existing = enterpriseMap.get(job.enterpriseName)

        if (existing) {
            existing.jobCount += 1
            if (job.location && !existing.locations.includes(job.location)) {
                existing.locations.push(job.location)
            }
            // Ưu tiên logo có giá trị
            if (!existing.enterpriseLogoUrl && job.enterpriseLogoUrl) {
                existing.enterpriseLogoUrl = job.enterpriseLogoUrl
            }
        } else {
            enterpriseMap.set(job.enterpriseName, {
                enterpriseName: job.enterpriseName,
                enterpriseLogoUrl: job.enterpriseLogoUrl,
                jobCount: 1,
                locations: job.location ? [job.location] : [],
                departmentName: job.departmentName,
            })
        }
    }

    // Sắp xếp theo số lượng job giảm dần
    return Array.from(enterpriseMap.values())
        .sort((a, b) => b.jobCount - a.jobCount)
}

/**
 * Lấy thông tin 1 công ty + danh sách job theo tên
 */
export async function getPublicEnterpriseByName(name: string) {
    const response = await getPublicJobs({ pageSize: 100 })

    const jobs = response.items.filter(
        (job) => job.enterpriseName === name
    )

    if (jobs.length === 0) return null

    const firstJob = jobs[0]
    const locations = [...new Set(jobs.map((j) => j.location).filter(Boolean))] as string[]

    const enterprise: PublicEnterprise = {
        enterpriseName: firstJob.enterpriseName,
        enterpriseLogoUrl: firstJob.enterpriseLogoUrl,
        jobCount: jobs.length,
        locations,
        departmentName: firstJob.departmentName,
    }

    return { enterprise, jobs }
}
