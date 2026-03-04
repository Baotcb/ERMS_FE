'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MoreVertical, Pencil, Trash2, Eye, CheckCircle, XCircle, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import type { JobPostingDetailDto, JobStatus } from '../../types/job-posting-types'

interface JobPostingTableProps {
    data: JobPostingDetailDto[]
    onPublish: (id: string) => void
    onClose: (id: string) => void
    onDelete: (id: string) => void
}

function StatusBadge({ status }: { status: JobStatus }) {
    const config: Record<JobStatus, { bg: string; text: string; dot: string }> = {
        Published: {
            bg: 'bg-green-100 border-green-200/50',
            text: 'text-green-700',
            dot: 'bg-green-500',
        },
        Draft: {
            bg: 'bg-slate-100 border-slate-200/50',
            text: 'text-slate-600',
            dot: 'bg-slate-400',
        },
        Closed: {
            bg: 'bg-orange-100 border-orange-200/50',
            text: 'text-orange-700',
            dot: 'bg-orange-500',
        },
    }

    const labels: Record<JobStatus, string> = {
        Published: 'Đang tuyển',
        Draft: 'Nháp',
        Closed: 'Đã đóng',
    }

    const c = config[status] ?? config.Draft

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.dot}`} />
            {labels[status] ?? status}
        </span>
    )
}

export function JobPostingTable({ data, onPublish, onClose, onDelete }: JobPostingTableProps) {
    const router = useRouter()
    const [deleteId, setDeleteId] = useState<string | null>(null)

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Vị trí tuyển dụng
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Phòng ban
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Trạng thái
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Ứng viên
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Ngày đăng
                        </TableHead>
                        <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                            Hành động
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-50">
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                                Không có bài đăng nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((job) => (
                            <TableRow
                                key={job.id}
                                className="hover:bg-sky-50/30 transition-colors group"
                            >
                                {/* Job Title & Code */}
                                <TableCell className="px-6 py-4 align-middle">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-[#0C4A6E] text-sm">
                                            {job.jobTitle}
                                        </span>
                                        <span className="text-xs text-slate-400 mt-0.5">
                                            #{job.jobCode}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Department */}
                                <TableCell className="px-6 py-4 align-middle text-sm text-slate-600">
                                    {job.departmentName}
                                </TableCell>

                                {/* Status */}
                                <TableCell className="px-6 py-4 align-middle">
                                    <StatusBadge status={job.status} />
                                </TableCell>

                                {/* Application Count */}
                                <TableCell className="px-6 py-4 align-middle">
                                    <div
                                        className="flex items-center gap-1.5 cursor-pointer hover:underline"
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => router.push(`/enterprise/hr/job-postings/${job.id}/applications`)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                router.push(`/enterprise/hr/job-postings/${job.id}/applications`)
                                            }
                                        }}
                                    >
                                        <span className={`font-bold text-sm ${job.applicationCount > 0 ? 'text-[#0EA5E9]' : 'text-slate-400'}`}>
                                            {job.applicationCount}
                                        </span>
                                        <span className="text-slate-400 text-xs">hồ sơ</span>
                                    </div>
                                </TableCell>

                                {/* Published Date */}
                                <TableCell className="px-6 py-4 align-middle text-sm text-slate-500">
                                    {job.publishedAt
                                        ? format(new Date(job.publishedAt), 'dd/MM/yyyy', { locale: vi })
                                        : '--/--/----'}
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="px-6 py-4 align-middle text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                type="button"
                                                className="text-slate-400 hover:text-[#0369A1] p-2 rounded-full hover:bg-sky-50 transition-colors cursor-pointer"
                                            >
                                                <span className="sr-only">Open menu</span>
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                onClick={() => router.push(`/enterprise/hr/job-postings/${job.id}/applications`)}
                                                className="cursor-pointer"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                Xem hồ sơ
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => router.push(`/enterprise/hr/job-postings/${job.id}`)}
                                                className="cursor-pointer"
                                            >
                                                <FileText className="mr-2 h-4 w-4" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => router.push(`/enterprise/hr/job-postings/${job.id}/edit`)}
                                                className="cursor-pointer"
                                            >
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Chỉnh sửa
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {job.status === 'Draft' && (
                                                <DropdownMenuItem
                                                    onClick={() => onPublish(job.id)}
                                                    className="cursor-pointer"
                                                >
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                    Đăng tuyển
                                                </DropdownMenuItem>
                                            )}
                                            {job.status === 'Published' && (
                                                <DropdownMenuItem
                                                    onClick={() => onClose(job.id)}
                                                    className="cursor-pointer"
                                                >
                                                    <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                                                    Đóng tuyển dụng
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => setDeleteId(job.id)}
                                                className="text-red-600 cursor-pointer focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Xóa
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Bài đăng tuyển dụng sẽ bị xóa vĩnh viễn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                                if (deleteId) {
                                    onDelete(deleteId)
                                    setDeleteId(null)
                                }
                            }}
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

