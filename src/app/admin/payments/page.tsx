import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { PaymentHistoryPageContent } from '@/features/admin/components/payment-history-page'

export const metadata = {
  title: 'Lịch sử Thanh toán | Admin Portal',
}

export default function AdminPaymentHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <PaymentHistoryPageContent />
    </Suspense>
  )
}
