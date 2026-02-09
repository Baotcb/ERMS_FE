'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useSWRConfig } from 'swr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

import { JobPostingTable } from './job-posting-table'
import {
    useJobPostings,
    usePublishJobPosting,
    useCloseJobPosting,
    useDeleteJobPosting,
} from '../../hooks/use-job-postings'

export function JobPostingList() {
    const { toast } = useToast()
    const { mutate } = useSWRConfig()

    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [status, setStatus] = useState<string>('all')
    const [departmentId] = useState<string>('all')

    const { data, isLoading } = useJobPostings({
        page,
        pageSize,
        status: status === 'all' ? undefined : status,
        departmentId: departmentId === 'all' ? undefined : departmentId,
    })

    // Mutations
    const { trigger: publishJob } = usePublishJobPosting()
    const { trigger: closeJob } = useCloseJobPosting()
    const { trigger: deleteJob } = useDeleteJobPosting()

    const handlePublish = async (id: string) => {
        try {
            await publishJob(id)
            toast({ title: 'Đã đăng tuyển dụng thành công' })
            mutate(['/api/JobPostings', JSON.stringify({ page, pageSize, status, departmentId })])
        } catch {
            toast({
                title: 'Lỗi',
                description: 'Không thể đăng tuyển dụng',
                variant: 'destructive',
            })
        }
    }

    const handleClose = async (id: string) => {
        try {
            await closeJob(id)
            toast({ title: 'Đã đóng tuyển dụng thành công' })
        } catch {
            toast({
                title: 'Lỗi',
                description: 'Không thể đóng tuyển dụng',
                variant: 'destructive',
            })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await deleteJob(id)
            toast({ title: 'Đã xóa tuyển dụng thành công' })
            mutate(['/api/JobPostings', JSON.stringify({ page, pageSize, status, departmentId })])
        } catch {
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa tuyển dụng',
                variant: 'destructive',
            })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex gap-2 items-center flex-1">
                    <Input
                        placeholder="Tìm kiếm..."
                        className="max-w-xs"
                    // Implement search logic if API supports it
                    />
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="Draft">Nháp</SelectItem>
                            <SelectItem value="Published">Đang tuyển</SelectItem>
                            <SelectItem value="Closed">Đã đóng</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Link href="/enterprise/hr/job-postings/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo bài đăng mới
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card">
                {isLoading ? (
                    <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
                ) : (
                    <JobPostingTable
                        data={data?.data || []}
                        onPublish={handlePublish}
                        onClose={handleClose}
                        onDelete={handleDelete}
                    />
                )}
            </div>

            {/* Pagination Controls */}
            {data && data.pageCount > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Trước
                    </Button>
                    <span className="py-2 px-4 text-sm">
                        Trang {page} / {data.pageCount}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setPage((p) => Math.min(data.pageCount, p + 1))}
                        disabled={page === data.pageCount}
                    >
                        Sau
                    </Button>
                </div>
            )}
        </div>
    )
}
