import { redirect } from 'next/navigation'

export const metadata = {
  title: 'AI Services | Admin Portal',
}

export default function AdminIntegrationsPage() {
  redirect('/admin/ai-services')
}
