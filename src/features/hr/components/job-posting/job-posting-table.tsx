'use client'

import { useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Pencil, Trash2, Eye, CheckCircle, XCircle, FileText } from 'lucide-react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export function JobPostingTable({ data, onPublish, onClose, onDelete }: JobPostingTableProps) {
    const router = useRouter()
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const parentRef = useRef<HTMLDivElement>(null)

    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 73, // Adjusted estimate including border/padding
        overscan: 5,

    })

    const items = virtualizer.getVirtualItems()
    const totalSize = virtualizer.getTotalSize()

    // Padding strategy for table virtualization
    const paddingTop = items.length > 0 ? items[0].start : 0
    const paddingBottom = items.length > 0 ? totalSize - items[items.length - 1].end : 0

    const getStatusBadge = (status: JobStatus) => {
        switch (status) {
            case 'Published':
                return <Badge className="bg-green-600">Đang tuyển</Badge>
            case 'Closed':
                return <Badge variant="secondary">Đã đóng</Badge>
            case 'Draft':
                return <Badge variant="outline">Nháp</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <>
            <div
                ref={parentRef}
                className="rounded-md border h-[600px] overflow-auto relative"
                style={{ contain: 'strict' }}
            >
                <Table>
                    <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
                        <TableRow>
                            <TableHead className="w-[300px]">Vị trí tuyển dụng</TableHead>
                            <TableHead>Phòng ban</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Ứng viên</TableHead>
                            <TableHead>Ngày đăng</TableHead>
                            <TableHead className="text-right">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Không có bài đăng nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {paddingTop > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} style={{ height: `${paddingTop}px`, padding: 0 }} />
                                    </TableRow>
                                )}
                                {items.map((virtualRow) => {
                                    const job = data[virtualRow.index]
                                    return (
                                        <TableRow
                                            key={job.id}
                                            data-index={virtualRow.index}
                                            ref={virtualizer.measureElement}
                                        >
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{job.jobTitle}</span>
                                                    <span className="text-xs text-muted-foreground">{job.jobCode}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{job.departmentName}</TableCell>
                                            <TableCell>{getStatusBadge(job.status)}</TableCell>
                                            <TableCell>
                                                <div
                                                    className="flex items-center gap-1 cursor-pointer hover:underline text-blue-600"
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => router.push(`/enterprise/hr/job-postings/${job.id}/applications`)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/enterprise/hr/job-postings/${job.id}/applications`) } }}
                                                >
                                                    <span className="font-medium">{job.applicationCount}</span>
                                                    <span className="text-xs text-muted-foreground">hồ sơ</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {job.publishedAt
                                                    ? format(new Date(job.publishedAt), 'dd/MM/yyyy', { locale: vi })
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/enterprise/hr/job-postings/${job.id}/applications`)}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Xem hồ sơ
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/enterprise/hr/job-postings/${job.id}`)}
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Xem chi tiết
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/enterprise/hr/job-postings/${job.id}/edit`)}
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {job.status === 'Draft' && (
                                                            <DropdownMenuItem onClick={() => onPublish(job.id)}>
                                                                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                                                Đăng tuyển
                                                            </DropdownMenuItem>
                                                        )}
                                                        {job.status === 'Published' && (
                                                            <DropdownMenuItem onClick={() => onClose(job.id)}>
                                                                <XCircle className="mr-2 h-4 w-4 text-orange-600" />
                                                                Đóng tuyển dụng
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={() => setDeleteId(job.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {paddingBottom > 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} style={{ height: `${paddingBottom}px`, padding: 0 }} />
                                    </TableRow>
                                )}
                            </>
                        )}
                    </TableBody>
                </Table>
            </div>

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
