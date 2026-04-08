import { JobPostingDetail } from '@/features/hr/components/job-posting/job-posting-detail';

export default async function JobPostingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobPostingDetail postingId={id} />;
}
