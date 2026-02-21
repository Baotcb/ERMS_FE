import { Metadata } from 'next'
import { ApplicationList } from '@/features/candidate/components/application-list'

export const metadata: Metadata = {
    title: 'Hồ sơ đã ứng tuyển | ERMS',
    description: 'Quản lý danh sách các công việc đã ứng tuyển',
}

export default function ApplicationsPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Việc làm đã ứng tuyển</h1>
                    <p className="text-slate-500 mt-2">Theo dõi trạng thái và kết quả ứng tuyển của bạn</p>
                </div>

                <ApplicationList />
            </div>
        </div>
    )
}
