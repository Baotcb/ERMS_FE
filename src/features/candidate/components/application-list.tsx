'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Loader2, FileText, Briefcase, Building } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import { useApplications } from '@/features/candidate/hooks/use-applications'

export function ApplicationList() {
    const [page] = useState(1)
    const [pageSize] = useState(10)

    const { data, isLoading, error } = useApplications({
        page,
        pageSize,
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Pending':
                return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Đang chờ</Badge>
            case 'Reviewing':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Đang xem xét</Badge>
            case 'Interviewing':
                return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Phỏng vấn</Badge>
            case 'Rejected':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Từ chối</Badge>
            case 'Hired':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Đã tuyển</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500">
                Không thể tải danh sách hồ sơ ứng tuyển.
            </div>
        )
    }

    if (!data?.items || data.items.length === 0) {
        return (
            <div className="text-center py-16 border rounded-lg bg-slate-50">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900">Bạn chưa ứng tuyển công việc nào</h3>
                <p className="text-slate-500 mt-2 mb-6">Hãy tìm kiếm công việc phù hợp và ứng tuyển ngay.</p>
                <Button asChild>
                    <Link href="/jobs">Tìm việc ngay</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Công việc</TableHead>
                            <TableHead>Công ty</TableHead>
                            <TableHead>Ngày nộp</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.items.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-slate-400" />
                                        <Link href={`/jobs/${app.jobId}`} className="hover:text-brand-primary hover:underline">
                                            {app.jobTitle || 'N/A'}
                                        </Link>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Building className="h-4 w-4 text-slate-400" />
                                        {app.enterpriseName || 'N/A'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(app.appliedAt), 'dd/MM/yyyy')}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(app.status)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={`/applications/${app.id}`}>Chi tiết</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
