import { apiClient } from '@/lib/api-client'
import { Application, CreateApplicationRequest, ApplicationHistoryParams } from '../types/application-types'

const BASE_URL = '/api/Applications'

export async function createApplication(data: CreateApplicationRequest): Promise<{ id: string }> {
    const formData = new FormData()
    formData.append('JobId', data.jobId)
    if (data.coverLetter) formData.append('CoverLetter', data.coverLetter)
    formData.append('CvFile', data.cvFile)

    // If we want to support guest apply or override info
    if (data.fullName) formData.append('FullName', data.fullName)
    if (data.email) formData.append('Email', data.email)
    if (data.phone) formData.append('Phone', data.phone)

    const response = await apiClient.post(BASE_URL, formData)
    return response.json()
}

export async function getApplications(params?: ApplicationHistoryParams): Promise<{
    items: Application[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}> {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', params.page.toString())
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString())
    if (params?.status) query.append('status', params.status)

    const response = await apiClient.get(`${BASE_URL}?${query.toString()}`)
    return response.json()
}

export async function getApplicationById(id: string): Promise<Application> {
    const response = await apiClient.get(`${BASE_URL}/${id}`)
    return response.json()
}
