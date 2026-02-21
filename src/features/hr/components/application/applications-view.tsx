'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApplications } from '../../hooks/use-applications'
import { useJobPosting } from '../../hooks/use-job-postings'
import { ApplicationTable } from './application-table'
import { ApplicationStage } from '../../types/application-types'

interface ApplicationsViewProps {
    jobPostingId: string
}

const STAGES: ApplicationStage[] = [
    'Applied',
    'Reviewing',
    'Shortlisted',
    'InterviewScheduled',
    'Interviewed',
    'Offered',
    'Hired',
    'Rejected',
]

const FILTER_LABELS: Record<string, string> = {
    'all': 'Tất cả',
    'Applied': 'Đã nộp',
    'Reviewing': 'Đang xem',
    'Shortlisted': 'Đã sơ tuyển',
    'InterviewScheduled': 'Lịch phỏng vấn',
    'Interviewed': 'Đã phỏng vấn',
    'Offered': 'Đề nghị',
    'Hired': 'Đã tuyển',
    'Rejected': 'Từ chối'
}

export function ApplicationsView({ jobPostingId }: ApplicationsViewProps) {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [pageSize] = useState(20)
    const [stageFilter, setStageFilter] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Job Info
    const { data: job, isLoading: isJobLoading } = useJobPosting(jobPostingId)

    // Applications Data
    const { data: applicationsData, isLoading: isAppsLoading, mutate } = useApplications(jobPostingId, {
        pageNumber: page,
        pageSize: pageSize,
        stageFilter: stageFilter === 'all' ? undefined : stageFilter,
    })

    const handlePageChange = (newPage: number) => {
        setPage(newPage)
    }

    // Client-side filtering for search (if backend doesn't support it yet)
    // In a real app with large data, this should be server-side.
    const filteredApplications = applicationsData?.data.filter(app => {
        const matchesSearch =
            app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())

        // If we are searching, we might want to ignore stage filter on client side if data is already fetched
        // But here data is fetched based on stage filter from server.
        return matchesSearch
    }) || []

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    className="w-fit p-0 h-auto hover:bg-transparent hover:text-brand-primary text-slate-500"
                    onClick={() => router.push('/enterprise/hr/job-postings')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách tin tuyển dụng
                </Button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {isJobLoading ? 'Đang tải...' : job?.jobTitle}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 text-slate-500 text-sm">
                            <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-slate-600">
                                {job?.jobCode || (isJobLoading ? 'Loading...' : 'JOB-CODE')}
                            </span>
                            <span>•</span>
                            <span>Quản lý danh sách ứng viên & Kết quả AI Screening</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Filter className="h-4 w-4" />
                    Bộ lọc hồ sơ
                </div>

                <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
                    <div className="flex flex-wrap gap-2 flex-1">
                        <Button
                            variant={stageFilter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => { setStageFilter('all'); setPage(1); }}
                            className={`rounded-full px-4 text-xs ${stageFilter === 'all'
                                    ? 'bg-slate-900 shadow-md'
                                    : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            Tất cả
                        </Button>
                        {STAGES.map((stage) => (
                            <Button
                                key={stage}
                                variant={stageFilter === stage ? 'secondary' : 'outline'}
                                size="sm"
                                onClick={() => { setStageFilter(stage); setPage(1); }}
                                className={`rounded-full px-4 text-xs transition-all ${stageFilter === stage
                                        ? 'bg-brand-primary text-white shadow-md hover:bg-brand-primary/90'
                                        : 'text-slate-600 border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {FILTER_LABELS[stage] || stage}
                            </Button>
                        ))}
                    </div>

                    <div className="w-full xl:w-auto relative min-w-[300px]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm theo tên, email..."
                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors h-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <ApplicationTable
                    applications={searchTerm ? filteredApplications : (applicationsData?.data || [])}
                    isLoading={isAppsLoading}
                    onRefresh={() => mutate()}
                />
            </div>

            {/* Pagination */}
            {applicationsData && applicationsData.totalPages > 1 && !searchTerm && (
                <div className="flex items-center justify-center space-x-4 py-4">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium text-slate-600">
                        Trang <span className="text-slate-900 font-bold">{page}</span> / {applicationsData.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= applicationsData.totalPages}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                </div>
            )}
        </div>
    )
}
