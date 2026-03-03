import { apiClient } from '@/lib/api-client'
import type { HROfferDto, CreateOfferRequest, ConfirmHireRequest, ConfirmHireResult } from '../types/offer-types'

const BASE_URL = '/api/applications'

// Lấy danh sách offer do HR tạo
// Backend: GET /api/applications/hr/my-offers
export async function getHROffers(): Promise<HROfferDto[]> {
    const response = await apiClient.get(`${BASE_URL}/hr/my-offers`)
    if (!response.ok) throw new Error('Không thể tải danh sách offer')
    return response.json()
}

// Lấy chi tiết offer theo ID
// Backend: GET /api/applications/hr/my-offers/{id}
export async function getHROfferById(id: string): Promise<HROfferDto> {
    const response = await apiClient.get(`${BASE_URL}/hr/my-offers/${id}`)
    if (!response.ok) throw new Error('Không thể tải thông tin offer')
    return response.json()
}

// Tạo offer mới và gửi cho ứng viên
// Backend: POST /api/applications/offers
export async function createOffer(
    data: CreateOfferRequest
): Promise<{ offerId: string }> {
    const response = await apiClient.post(`${BASE_URL}/offers`, data)
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.message || 'Không thể tạo offer')
    }
    return response.json()
}

// Xác nhận tuyển dụng — tạo tài khoản nhân viên
// Backend: POST /api/applications/confirm-hire
export async function confirmHire(
    data: ConfirmHireRequest
): Promise<ConfirmHireResult> {
    const response = await apiClient.post(`${BASE_URL}/confirm-hire`, data)
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.message || 'Không thể xác nhận tuyển dụng')
    }
    return response.json()
}
