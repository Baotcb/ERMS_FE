'use client'

import { useState } from 'react'
import { Search, Filter, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApplications } from '../../hooks/use-applications'
import { ApplicationTable } from './application-table'
import { ApplicationStage } from '../../types/application-types'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface ApplicationsViewProps {
    jobPostingId: string
}

const STAGES: ApplicationStage[] = [
    'Applied',
    'Reviewing',
    'Shortlisted',
    'InterviewScheduled',
    'Interviewed',
    'OfferProcessing',
    'Offered',
    'Hired',
    'Rejected',
    'Withdrawn',
]

const FILTER_LABELS: Record<string, string> = {
    'all': 'Tất cả',
    'Applied': 'Đã nộp',
    'Reviewing': 'Đang xem xét',
    'Shortlisted': 'Đã sơ tuyển',
    'InterviewScheduled': 'Lịch phỏng vấn',
    'Interviewed': 'Đã phỏng vấn',
    'OfferProcessing': 'Đang xử lý offer',
    'Offered': 'Đã đề nghị',
    'Hired': 'Đã tuyển',
    'Rejected': 'Từ chối',
    'Withdrawn': 'Rút lui',
}

export function ApplicationsView({ jobPostingId }: ApplicationsViewProps) {
    const [page, setPage] = useState(1)
    const [pageSize] = useState(20)
    const [stageFilter, setStageFilter] = useState<string>('all')
    const [sourceFilter, setSourceFilter] = useState<'all' | 'Website' | 'HRImported'>('all')
    const [searchTerm, setSearchTerm] = useState('')

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

        const matchesSource = sourceFilter === 'all' || app.source === sourceFilter || (sourceFilter === 'HRImported' && app.isExternal);

        // If we are searching, we might want to ignore stage filter on client side if data is already fetched
        // But here data is fetched based on stage filter from server.
        return matchesSearch && matchesSource
    }) || []

    return (
        <div className="space-y-6 mt-6">
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

                    <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-3 min-w-[300px]">
                        <Select value={sourceFilter} onValueChange={(val: 'all' | 'Website' | 'HRImported') => setSourceFilter(val)}>
                            <SelectTrigger className="w-full sm:w-[160px] h-10 border-slate-200">
                                <SelectValue placeholder="Nguồn CV" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả nguồn</SelectItem>
                                <SelectItem value="Website">Từ Website</SelectItem>
                                <SelectItem value="HRImported">CV Độc lập</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="relative flex-1">
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
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <ApplicationTable
                    applications={searchTerm || sourceFilter !== 'all' ? filteredApplications : (applicationsData?.data || [])}
                    isLoading={isAppsLoading}
                    onRefresh={() => mutate()}
                />
            </div>

            {/* Pagination */}
            {applicationsData && applicationsData.totalPages > 1 && !searchTerm && sourceFilter === 'all' && (
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
