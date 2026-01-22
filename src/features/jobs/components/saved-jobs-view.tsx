import { Bookmark } from 'lucide-react'
import { SavedJobList } from './saved-job-list'

export function SavedJobsView() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8 border-b border-gray-200 pb-4">
                <h1 className="text-3xl font-bold flex items-center gap-3 text-brand-dark">
                    <Bookmark className="w-8 h-8 text-brand-primary" />
                    Việc làm đã lưu
                </h1>
                <p className="text-lg text-gray-500 mt-2">Quản lý danh sách các công việc bạn đang quan tâm.</p>
            </div>

            <SavedJobList />
        </div>
    )
}
