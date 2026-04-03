import { Suspense } from 'react'
import { EnterpriseListPageContent } from '@/features/admin/components/enterprise-list-page'
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: 'Quản lý Doanh nghiệp | Admin Portal',
}

export default function AdminEnterprisesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <EnterpriseListPageContent />
    </Suspense>
  )
}
