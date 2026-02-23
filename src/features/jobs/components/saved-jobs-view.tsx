import { Bookmark } from 'lucide-react'
import { SavedJobList } from './saved-job-list'

export function SavedJobsView() {
    return (
        <div className="min-h-screen bg-[#f4f5f5]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1B5583] to-[#154360] py-6">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        <Bookmark className="w-5 h-5" />
                        Việc làm đã lưu
                    </h1>
                    <p className="text-white/80 text-sm mt-1">
                        Quản lý danh sách các công việc bạn đang quan tâm
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <SavedJobList />
            </div>
        </div>
    )
}
