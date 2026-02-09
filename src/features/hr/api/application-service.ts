import { apiClient } from '@/lib/api-client'
import type {
    ApplicationDto,
    ApplicationsResponse,
    ForwardApplicationRequest
} from '../types/application-types'

const BASE_URL = '/api/applications'

// Get applications by job posting
export async function getApplicationsByJob(
    jobPostingId: string,
    params?: {
        pageNumber?: number
        pageSize?: number
        stageFilter?: string
    }
): Promise<ApplicationsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set('pageNumber', String(params.pageNumber))
    if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize))
    if (params?.stageFilter) searchParams.set('stageFilter', params.stageFilter)

    const response = await apiClient.get(
        `${BASE_URL}/job/${jobPostingId}?${searchParams}`
    )
    if (!response.ok) throw new Error('Không thể tải danh sách ứng tuyển')
    return response.json()
}

// Get application detail
export async function getApplicationById(id: string): Promise<ApplicationDto> {
    const response = await apiClient.get(`${BASE_URL}/${id}`)
    if (!response.ok) throw new Error('Không thể tải thông tin ứng tuyển')
    return response.json()
}

// Forward application to Dept Head
export async function forwardApplication(
    id: string,
    data: ForwardApplicationRequest
): Promise<ApplicationDto> {
    const response = await apiClient.patch(`${BASE_URL}/${id}/forward`, data)
    if (!response.ok) throw new Error('Không thể chuyển hồ sơ')
    return response.json()
}
