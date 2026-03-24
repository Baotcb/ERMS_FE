'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useShortlistedApplications } from '../../hooks/use-interview'
import { AssignInterviewerDialog } from './assign-interviewer-dialog'
import type { ShortlistedApplicationDto } from '../../types/interview-types'

interface ShortlistedListProps {
    planDetailId: string
}

type SortOption = 'score-desc' | 'score-asc' | 'date-desc'
type FilterOption = 'all' | 'not-viewed' | 'viewed'

function AiScoreBadge({ score }: { score?: number }) {
    if (score == null) return <span className="text-gray-400 text-xs">—</span>
    const pct = Math.round(score)
    const color = pct >= 70 ? 'bg-green-100 text-green-700 border-green-200'
        : pct >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
            : 'bg-red-50 text-red-700 border-red-100'
    return (
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold ${color}`}>
            {pct}
        </div>
    )
}

function parseSkills(skills?: string): string[] {
    if (!skills || skills.trim() === '' || skills.trim() === '[]') return []
    try {
        const parsed = JSON.parse(skills)
        if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
        return [String(parsed)].filter(Boolean)
    } catch {
        return skills.split(',').map(s => s.trim()).filter(Boolean)
    }
}

function SkillPills({ skills, variant }: { skills?: string; variant: 'match' | 'missing' }) {
    const allItems = parseSkills(skills)

    if (allItems.length === 0) {
        return <span className="text-slate-400 text-xs italic">Không có</span>
    }

    const cls = variant === 'match'
        ? 'bg-[#BBE1FA]/30 text-[#0F4C75] border-[#BBE1FA]'
        : 'bg-red-50 text-red-600 border-red-100'

    return (
        <div className="flex flex-wrap gap-1.5">
            {allItems.map(s => (
                <Badge key={s} variant="outline" className={`text-[11px] px-2 py-0.5 font-medium ${cls}`}>{s}</Badge>
            ))}
        </div>
    )
}

export function ShortlistedList({ planDetailId }: ShortlistedListProps) {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState<SortOption>('score-desc')
    const [filterStatus, setFilterStatus] = useState<FilterOption>('all')
    const [assignTarget, setAssignTarget] = useState<ShortlistedApplicationDto | null>(null)

    const pageSize = 20
    const { data, isLoading, mutate } = useShortlistedApplications(planDetailId, {
        pageNumber: page,
        pageSize,
    })

    // Filter + sort
    const processedItems = useMemo(() => {
        const items = data?.items ?? []

        // Search filter
        const filtered = items.filter(a =>
            a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
            (a.candidateEmail || '').toLowerCase().includes(search.toLowerCase())
        )

        // Sort
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'score-desc':
                    return (b.overallScore ?? 0) - (a.overallScore ?? 0)
                case 'score-asc':
                    return (a.overallScore ?? 0) - (b.overallScore ?? 0)
                case 'date-desc':
                    return new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
                default:
                    return 0
            }
        })

        return sorted
    }, [data?.items, search, sortBy])

    const totalCount = data?.totalCount ?? 0
    const totalPages = Math.max(1, data ? Math.ceil(totalCount / data.pageSize) : 1)
    const startItem = (page - 1) * pageSize + 1
    const endItem = Math.min(page * pageSize, totalCount)


    return (
        <div className="space-y-0 max-w-full pb-12">
            {/* Header - matches Stitch design */}
            <header className="bg-white border-b border-slate-200 px-8 py-5 -mx-6 -mt-6 mb-6 flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <button
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0F4C75] transition-colors text-sm font-medium w-fit"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-[18px] w-[18px]" />
                        Quay lại
                    </button>
                    <div className="flex items-center gap-4">
                        <h2 className="text-[#0F4C75] text-2xl font-bold">Ứng viên đã sơ tuyển</h2>
                        <span className="px-3 py-1 bg-[#BBE1FA]/30 text-[#0F4C75] text-xs font-semibold rounded-full border border-[#BBE1FA]/50">
                            {totalCount} ứng viên
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-medium text-slate-700">{data?.positionTitle || 'Đang tải...'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-400" />
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-mono border border-slate-200">
                            {planDetailId.slice(0, 8).toUpperCase()}
                        </span>
                    </div>
                </div>

            </header>

            {/* Filter bar - matches Stitch design */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex-1 min-w-[300px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        className="pl-10 pr-4 bg-white border-slate-200 focus:ring-2 focus:ring-[#BBE1FA]/50 focus:border-[#0F4C75]"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3">
                    {/* Filter by status */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Lọc theo:</label>
                        <select
                            className="py-2.5 pl-3 pr-10 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-[#BBE1FA]/50 focus:border-[#0F4C75] cursor-pointer"
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value as FilterOption)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="not-viewed">Chưa xem</option>
                            <option value="viewed">Đã xem</option>
                        </select>
                    </div>
                    {/* Divider */}
                    <div className="h-8 w-[1px] bg-slate-200 mx-1" />
                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Sắp xếp:</label>
                        <select
                            className="py-2.5 pl-3 pr-10 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:ring-2 focus:ring-[#BBE1FA]/50 focus:border-[#0F4C75] cursor-pointer font-medium"
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as SortOption)}
                        >
                            <option value="score-desc">Điểm AI (cao → thấp)</option>
                            <option value="score-asc">Điểm AI (thấp → cao)</option>
                            <option value="date-desc">Ngày ứng tuyển (mới nhất)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex flex-col min-h-[420px]">
                <div className="flex-1 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[200px]">
                                    Ứng viên
                                </TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center w-[80px]">
                                    Điểm AI
                                </TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[30%]">
                                    Kỹ năng khớp
                                </TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[15%]">
                                    Kỹ năng thiếu
                                </TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[120px]">
                                    Ngày ứng tuyển
                                </TableHead>
                                <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-[140px]">
                                    Hành động
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-50">
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16 text-slate-400">
                                        Đang tải danh sách ứng viên...
                                    </TableCell>
                                </TableRow>
                            ) : processedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16 text-slate-400">
                                        {search ? 'Không tìm thấy ứng viên phù hợp' : 'Chưa có ứng viên nào'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                processedItems.map(app => (
                                    <TableRow key={app.applicationId} className="hover:bg-sky-50/30 transition-colors group">
                                        <TableCell className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#BBE1FA]/40 flex items-center justify-center text-[#0F4C75] font-bold text-sm flex-shrink-0">
                                                    {app.candidateName.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-900 group-hover:text-[#0F4C75] transition-colors">
                                                        {app.candidateName}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{app.candidateEmail}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center p-4">
                                            <AiScoreBadge score={app.overallScore} />
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <SkillPills skills={app.matchedSkills} variant="match" />
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <SkillPills skills={app.missingSkills} variant="missing" />
                                        </TableCell>
                                        <TableCell className="p-4">
                                            <div className="text-sm text-slate-600">
                                                {format(new Date(app.appliedAt), 'dd/MM/yyyy')}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {format(new Date(app.appliedAt), 'hh:mm a')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {app.resumeUrl && (
                                                    <button
                                                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-medium hover:bg-slate-50 hover:text-[#0F4C75] transition-colors"
                                                        onClick={() => window.open(app.resumeUrl, '_blank')}
                                                    >
                                                        Xem CV
                                                    </button>
                                                )}
                                                <button
                                                    className="px-3 py-1.5 rounded-lg bg-[#0F4C75] text-white text-xs font-medium hover:bg-[#0b3a5a] shadow-sm shadow-[#0F4C75]/20 transition-colors"
                                                    onClick={() => setAssignTarget(app)}
                                                >
                                                    Phân công PV
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination - matches Stitch design */}
                {totalCount > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Hiển thị <span className="font-semibold text-slate-700">{startItem}-{endItem}</span> trong số <span className="font-semibold text-slate-700">{totalCount}</span> ứng viên
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50 hover:text-[#0F4C75] transition-colors"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <span className="text-sm font-medium text-slate-700 px-2">
                                Trang {page} / {totalPages}
                            </span>
                            <button
                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50 hover:text-[#0F4C75] transition-colors"
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => p + 1)}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Assign Dialog */}
            {assignTarget && (
                <AssignInterviewerDialog
                    open={!!assignTarget}
                    onOpenChange={open => { if (!open) setAssignTarget(null) }}
                    applicationId={assignTarget.applicationId}
                    candidateName={assignTarget.candidateName}
                    onSuccess={() => {
                        setAssignTarget(null)
                        mutate()
                    }}
                />
            )}
        </div>
    )
}
