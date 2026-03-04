import { apiClient } from '@/lib/api-client'
import type {
    GetMyOffersResponse,
    CandidateOfferDto,
    AcceptOfferRequest,
    RejectOfferRequest,
} from '../types/offer-types'

const BASE_URL = '/api/applications'

// Lấy danh sách offer của ứng viên
// Backend: GET /api/applications/my-offers
export async function getMyOffers(params?: {
    pageNumber?: number
    pageSize?: number
}): Promise<GetMyOffersResponse> {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set('pageNumber', params.pageNumber.toString())
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString())

    const qs = searchParams.toString()
    const url = `${BASE_URL}/my-offers${qs ? `?${qs}` : ''}`

    const response = await apiClient.get(url)
    if (!response.ok) throw new Error('Không thể tải danh sách đề nghị')
    return response.json()
}

// Lấy chi tiết 1 offer (dùng danh sách rồi filter client-side,
// vì BE chưa có endpoint riêng cho candidate get by id)
export async function getMyOfferById(offerId: string): Promise<CandidateOfferDto | null> {
    const data = await getMyOffers({ pageSize: 100 })
    return data.items.find((o) => o.offerId === offerId) || null
}

// Chấp nhận offer
// Backend: PATCH /api/applications/accept-offer
export async function acceptOffer(data: AcceptOfferRequest): Promise<void> {
    const response = await apiClient.patch(`${BASE_URL}/accept-offer`, data)
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.message || 'Không thể chấp nhận offer')
    }
}

// Từ chối offer
// Backend: PATCH /api/applications/reject-offer
export async function rejectOffer(data: RejectOfferRequest): Promise<void> {
    const response = await apiClient.patch(`${BASE_URL}/reject-offer`, data)
    if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.message || 'Không thể từ chối offer')
    }
}
