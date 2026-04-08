import { JobPostingEditForm } from '@/features/hr/components/job-posting/job-posting-edit-form';

export default async function EditJobPostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <JobPostingEditForm postingId={id} />;
}
