// Offer Status — khớp 100% với BE OfferStatus constants
export type OfferStatus =
    | 'Draft'
    | 'PendingApproval'
    | 'Approved'
    | 'Sent'
    | 'Accepted'
    | 'Rejected'
    | 'Expired'

// HR Offer DTO — khớp với BE HROfferDto (GetAllOfferByHR)
export interface HROfferDto {
    id: string
    applicationId: string
    offerCode: string | null
    position: string
    departmentName: string
    salary: number
    salaryFrequency: string
    bonus: string | null
    benefits: string | null
    startDate: string
    expirationDate: string
    offerLetterUrl: string | null
    status: OfferStatus
    createdById: string
    approvedById: string | null
    approvedAt: string | null
    sentAt: string | null
    sentById: string | null
    respondedAt: string | null
    candidateNote: string | null
}

// Create Offer Request — khớp với BE CreateOfferCommand
export interface CreateOfferRequest {
    applicationId: string
    position: string
    salary: number
    salaryFrequency: string
    bonus?: string
    benefits?: string
    startDate: string
    expirationDate: string
    offerLetterUrl?: string
}

// Confirm Hire — khớp với BE ConfirmHireCommand
export interface ConfirmHireRequest {
    applicationId: string
    employeeEmail: string
}

// Confirm Hire Result — khớp với BE ConfirmHireResult
export interface ConfirmHireResult {
    applicationId: string
    employeeId: string
    employeeCode: string
    newStage: string
    employeeEmail: string
}
