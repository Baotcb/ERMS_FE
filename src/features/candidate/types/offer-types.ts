import type { OfferStatus } from '@/features/hr/types/offer-types'

// Match backend CandidateOfferDto (GET /api/applications/my-offers)
export interface CandidateOfferDto {
    offerId: string
    applicationId: string
    jobPostingId: string
    enterpriseId: string
    offerCode: string | null
    enterpriseName: string
    enterpriseLogoUrl: string | null
    position: string
    departmentName: string
    jobTitle: string
    salary: number
    salaryFrequency: string
    bonus: string | null
    benefits: string | null
    startDate: string
    expirationDate: string
    offerLetterUrl: string | null
    status: OfferStatus
    sentAt: string | null
    respondedAt: string | null
    candidateNote: string | null
}

// Match backend GetMyOffersResponse
export interface GetMyOffersResponse {
    items: CandidateOfferDto[]
    totalCount: number
    pageNumber: number
    pageSize: number
}

// Match backend AcceptOfferCommand
export interface AcceptOfferRequest {
    offerId: string
}

// Match backend RejectOfferCommand
export interface RejectOfferRequest {
    offerId: string
    candidateNote?: string
}
