'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useSWRConfig } from 'swr'
import dynamic from 'next/dynamic'

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
import type { JobPostingFormValues } from './job-posting-wizard-dialog'
import {
    useJobPostings,
    usePublishJobPosting,
    useCloseJobPosting,
    useDeleteJobPosting,
} from '../../hooks/use-job-postings'

const JobPostingWizardDialog = dynamic(() =>
    import('./job-posting-wizard-dialog').then((mod) => mod.JobPostingWizardDialog),
    { ssr: false }
)

export function JobPostingList() {
    const { toast } = useToast()
    const { mutate } = useSWRConfig()
    const searchParams = useSearchParams()

    const [page, setPage] = useState(1)
    const [pageSize] = useState(10)
    const [status, setStatus] = useState<string>('all')
    const [departmentId] = useState<string>('all')
    const [showWizard, setShowWizard] = useState(false)
    const [initialData, setInitialData] = useState<Partial<JobPostingFormValues>>({})

    const { data, isLoading } = useJobPostings({
        page,
        pageSize,
        status: status === 'all' ? undefined : status,
        departmentId: departmentId === 'all' ? undefined : departmentId,
    })

    // Auto-open wizard if coming from dashboard with request data
    useEffect(() => {
        if (searchParams) {
            const autoOpen = searchParams.get('autoOpen')
            if (autoOpen === 'true') {
                const planDetailId = searchParams.get('planDetailId')
                const jobTitle = searchParams.get('jobTitle')
                const quantity = searchParams.get('quantity')
                const location = searchParams.get('location')
                const applicationDeadline = searchParams.get('applicationDeadline')
                const requirements = searchParams.get('requirements')

                // Fix synchronous setState in effect
                setTimeout(() => {
                    setInitialData({
                        planDetailId: planDetailId || '',
                        jobTitle: jobTitle || '',
                        quantity: quantity ? parseInt(quantity) : 1,
                        location: location || 'Hà Nội',
                        applicationDeadline: applicationDeadline ? applicationDeadline.split('T')[0] : '',
                        description: '',
                        requirements: requirements || '',
                        benefits: '',
                        hidePlanDetailId: true // hidePlanDetailId is stripped in Wizard
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any)
                    setShowWizard(true)
                }, 0)

                // Clean URL after opening wizard
                window.history.replaceState({}, '', '/enterprise/hr/job-postings')
            }
        }
    }, [searchParams])

    // Mutations
    const { trigger: publishJob } = usePublishJobPosting()
    const { trigger: closeJob } = useCloseJobPosting()
    const { trigger: deleteJob } = useDeleteJobPosting()

    const handlePublish = async (id: string) => {
        console.log('📢 handlePublish called with id:', id)
        try {
            const result = await publishJob(id)
            console.log('✅ Publish result:', result)
            toast({ title: 'Đã đăng tuyển dụng thành công' })
            mutate(['/api/job-postings', JSON.stringify({ page, pageSize, status, departmentId })])
        } catch (error) {
            console.error('❌ Publish error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Không thể đăng tuyển dụng'
            toast({
                title: 'Lỗi',
                description: errorMessage,
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
            mutate(['/api/job-postings', JSON.stringify({ page, pageSize, status, departmentId })])
        } catch {
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa tuyển dụng',
                variant: 'destructive',
            })
        }
    }

    const handleCreateNew = () => {
        setInitialData({})
        setShowWizard(true)
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
                <Button onClick={handleCreateNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo bài đăng mới
                </Button>
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

            {/* Wizard Dialog */}
            {showWizard && (
                <JobPostingWizardDialog
                    open={showWizard}
                    onOpenChange={setShowWizard}
                    initialData={initialData}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    hidePlanDetailId={(initialData as any).hidePlanDetailId || false}
                />
            )}
        </div>
    )
}
