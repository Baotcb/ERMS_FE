export interface SubscriptionPlan {
    id: string
    planName: string
    planCode: string
    description: string | null
    maxJobPostings: number
    maxCourses: number
    price: number // per quarter
    features: string | null
    displayOrder: number
}

export interface ParsedFeatures {
    aiCvScreening: boolean
    aiJdSuggestion: boolean
}

export interface CurrentSubscription {
    enterpriseId: string
    enterpriseName: string
    currentPlan: {
        id: string
        planName: string
        planCode: string
        maxJobPostings: number
        maxCourses: number
        price: number
        features: string | null
    }
    subscriptionStartDate: string
    subscriptionEndDate: string
    subscriptionStatus: string | null
    usage: {
        currentJobPostings: number
        currentCourses: number
    }
    hasPendingPayment: boolean
}

export interface CreatePaymentResponse {
    paymentOrderId: string
    orderCode: number
    checkoutUrl: string
    paymentLinkId: string
    qrCode: string
    amount: number
}
