import { apiClient } from '@/lib/api-client'
import type { HROfferDto, CreateOfferRequest, ConfirmHireRequest, ConfirmHireResult, CancelOfferRequest, CancelOfferResult, OfferPublicInfo } from '../types/offer-types'

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
        if (response.status === 403) {
            throw new Error(error?.message || 'Bạn không có quyền tạo offer (yêu cầu HR Manager).')
        }
        if (response.status === 404) {
            throw new Error(error?.message || 'Không tìm thấy API tạo offer (404). Vui lòng kiểm tra cấu hình API URL/proxy.')
        }
        throw new Error(error?.message || `Không thể tạo offer (HTTP ${response.status})`)
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
    const json = await response.json()
    // Backend wraps response in { message, data }
    return json.data ?? json
}

// Hủy offer
// Backend: PATCH /api/applications/cancel-offer
export async function cancelOffer(
    data: CancelOfferRequest
): Promise<CancelOfferResult> {
    const response = await apiClient.patch(`${BASE_URL}/cancel-offer`, data)
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.message || 'Không thể hủy offer')
    }
    const json = await response.json()
    return json.data ?? json
}

// Lấy thông tin public của offer qua token
// Backend: GET /api/applications/offer-response/{token}
export async function getOfferByToken(token: string): Promise<OfferPublicInfo> {
    const response = await apiClient.get(`${BASE_URL}/offer-response/${token}`)
    if (!response.ok) {
        throw new Error('Không thể tải thông tin offer, liên kết có thể đã hết hạn')
    }
    const json = await response.json()
    return json.data ?? json
}

// Phản hồi offer qua token (dành cho ứng viên ngoài hệ thống — không cần đăng nhập)
// Backend: POST /api/applications/offer-response/{token}?action=accept|reject
export async function respondOfferByToken(
    token: string,
    action: 'accept' | 'reject'
): Promise<{ message?: string }> {
    // Use apiClient so the request is proxied via Next.js rewrites to the backend
    const response = await apiClient.post(
        `${BASE_URL}/offer-response/${token}?action=${action}`,
        null
    )
    const json = await response.json().catch(() => ({}))
    if (!response.ok) {
        throw new Error(json?.message || 'Có lỗi xảy ra')
    }
    return json
}
