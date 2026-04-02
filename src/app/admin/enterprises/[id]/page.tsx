import { EnterpriseDetailPageContent } from '@/features/admin/components/enterprise-detail-page'

export const metadata = {
  title: 'Chi tiết Doanh nghiệp | Admin Portal',
}

export default async function AdminEnterpriseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <EnterpriseDetailPageContent id={id} />
}
