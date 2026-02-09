import { CreateJobPostingForm } from '@/features/hr/components/job-posting/create-job-posting-form'

export default function CreateJobPostingPage() {
    return (
        <div className="container mx-auto py-6">
            <h1 className="text-2xl font-bold mb-6">Tạo Tin Tuyển Dụng Mới</h1>
            <CreateJobPostingForm />
        </div>
    )
}
