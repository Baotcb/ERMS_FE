import { Suspense } from 'react'
import { PaymentResultPage } from '@/features/subscription/components/payment-result-page'

export default function SubscriptionResultPage() {
    return (
        <div className="p-6">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            }>
                <PaymentResultPage />
            </Suspense>
        </div>
    )
}
