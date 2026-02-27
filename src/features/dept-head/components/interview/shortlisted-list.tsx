'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
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

function AiScoreBadge({ score }: { score?: number }) {
    if (score == null) return <span className="text-gray-400 text-xs">—</span>
    const pct = Math.round(score)
    const color = pct >= 70 ? 'bg-green-100 text-green-700 border-green-300'
        : pct >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
            : 'bg-red-100 text-red-700 border-red-300'
    return (
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold ${color}`}>
            {pct}
        </div>
    )
}

function SkillPills({ skills, variant }: { skills?: string; variant: 'match' | 'missing' }) {
    if (!skills) return <span className="text-gray-400 text-xs">—</span>
    const items = skills.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)
    const cls = variant === 'match'
        ? 'bg-[#BBE1FA]/40 text-[#0F4C75] border-[#BBE1FA]'
        : 'bg-red-50 text-red-600 border-red-200'
    return (
        <div className="flex flex-wrap gap-1">
            {items.map(s => (
                <Badge key={s} variant="outline" className={`text-[10px] px-1.5 py-0 ${cls}`}>{s}</Badge>
            ))}
            {skills.split(',').length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-50 text-gray-500">
                    +{skills.split(',').length - 3}
                </Badge>
            )}
        </div>
    )
}

export function ShortlistedList({ planDetailId }: ShortlistedListProps) {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [assignTarget, setAssignTarget] = useState<ShortlistedApplicationDto | null>(null)

    const { data, isLoading, mutate } = useShortlistedApplications(planDetailId, {
        pageNumber: page,
        pageSize: 20,
    })

    const filtered = data?.items?.filter(a =>
        a.candidateName.toLowerCase().includes(search.toLowerCase()) ||
        (a.candidateEmail || '').toLowerCase().includes(search.toLowerCase())
    ) ?? []

    const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 1

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Button
                    variant="ghost"
                    className="w-fit p-0 h-auto hover:bg-transparent text-slate-500 hover:text-[#0F4C75]"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0F4C75]">Ứng viên đã sơ tuyển</h1>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <span className="font-medium">{data?.positionTitle || 'Đang tải...'}</span>
                            <span>•</span>
                            <Badge variant="outline" className="bg-[#BBE1FA]/30 text-[#0F4C75] border-[#BBE1FA]">
                                {data?.totalCount ?? 0} ứng viên
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên ứng viên..."
                        className="pl-9 bg-slate-50 border-slate-200"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Ứng viên</TableHead>
                            <TableHead className="text-center w-[80px]">Điểm AI</TableHead>
                            <TableHead>Kỹ năng phù hợp</TableHead>
                            <TableHead>Kỹ năng thiếu</TableHead>
                            <TableHead>Ngày ứng tuyển</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                    Đang tải danh sách ứng viên...
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                                    {search ? 'Không tìm thấy ứng viên phù hợp' : 'Chưa có ứng viên nào'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map(app => (
                                <TableRow key={app.applicationId} className="hover:bg-slate-50/50">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-[#BBE1FA]/40 flex items-center justify-center text-[#0F4C75] font-bold text-sm">
                                                {app.candidateName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{app.candidateName}</p>
                                                <p className="text-xs text-slate-400">{app.candidateEmail}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <AiScoreBadge score={app.overallScore} />
                                    </TableCell>
                                    <TableCell>
                                        <SkillPills skills={app.matchedSkills} variant="match" />
                                    </TableCell>
                                    <TableCell>
                                        <SkillPills skills={app.missingSkills} variant="missing" />
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-500">
                                        {format(new Date(app.appliedAt), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            {app.resumeUrl && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs"
                                                    onClick={() => window.open(app.resumeUrl, '_blank')}
                                                >
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    Xem CV
                                                </Button>
                                            )}
                                            <Button
                                                size="sm"
                                                className="text-xs bg-[#0F4C75] hover:bg-[#3282B8]"
                                                onClick={() => setAssignTarget(app)}
                                            >
                                                Phân công PV
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 py-4">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-slate-600">
                        Trang <span className="font-bold text-slate-900">{page}</span> / {totalPages}
                    </span>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                </div>
            )}

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
