import { apiClient } from '@/lib/api-client'
import type { SubscriptionPlan, CurrentSubscription, CreatePaymentResponse } from '../types'

const BASE_URL = '/api/Subscription'

export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get(`${BASE_URL}/plans`)
    if (!response.ok) {
        throw new Error('Không thể tải danh sách gói dịch vụ')
    }
    return response.json()
}

export async function fetchCurrentSubscription(): Promise<CurrentSubscription> {
    const response = await apiClient.get(`${BASE_URL}/current`)
    if (!response.ok) {
        throw new Error('Không thể tải thông tin gói hiện tại')
    }
    return response.json()
}

export async function createPaymentOrder(subscriptionPlanId: string): Promise<CreatePaymentResponse> {
    const response = await apiClient.post(`${BASE_URL}/create-payment`, {
        subscriptionPlanId,
    })
    
    if (!response.ok) {
        let message = 'Không thể tạo đơn thanh toán'
        try {
            const errorData = await response.json()
            message = errorData.message || errorData.title || errorData.error || message
        } catch {
            // fallback generic error message
        }
        throw new Error(message)
    }

    return response.json()
}
