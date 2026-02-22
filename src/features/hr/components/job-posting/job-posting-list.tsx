'use client'

import { Suspense, useEffect, useReducer } from 'react'
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

const PAGE_SIZE = 10
const DEPARTMENT_ID = 'all'

type WizardState = {
    open: boolean
    data: Partial<JobPostingFormValues> & { hidePlanDetailId?: boolean }
}

type ListState = { page: number; status: string; wizard: WizardState }

type ListAction =
    | { type: 'setPage'; page: number }
    | { type: 'setStatus'; status: string }
    | { type: 'openWizard'; data?: WizardState['data'] }
    | { type: 'closeWizard' }

function listReducer(state: ListState, action: ListAction): ListState {
    switch (action.type) {
        case 'setPage': return { ...state, page: action.page }
        case 'setStatus': return { ...state, status: action.status }
        case 'openWizard': return { ...state, wizard: { open: true, data: action.data ?? {} } }
        case 'closeWizard': return { ...state, wizard: { open: false, data: {} } }
        default: return state
    }
}

function initFromSearchParams(searchParams: ReturnType<typeof useSearchParams>): ListState {
    const autoOpen = searchParams.get('autoOpen') === 'true'
    return {
        page: 1,
        status: 'all',
        wizard: autoOpen
            ? {
                open: true,
                data: {
                    planDetailId: searchParams.get('planDetailId') || '',
                    jobTitle: searchParams.get('jobTitle') || '',
                    quantity: Number(searchParams.get('quantity')) || 1,
                    location: searchParams.get('location') || 'Hà Nội',
                    applicationDeadline: (searchParams.get('applicationDeadline') || '').split('T')[0],
                    description: '',
                    requirements: searchParams.get('requirements') || '',
                    benefits: '',
                    hidePlanDetailId: true,
                },
            }
            : { open: false, data: {} },
    }
}

function JobPostingListContent() {
    const { toast } = useToast()
    const { mutate } = useSWRConfig()
    const searchParams = useSearchParams()

    const [state, dispatch] = useReducer(listReducer, searchParams, initFromSearchParams)
    const { page, status, wizard } = state

    const { data, isLoading } = useJobPostings({
        page,
        pageSize: PAGE_SIZE,
        status: status === 'all' ? undefined : status,
        departmentId: DEPARTMENT_ID === 'all' ? undefined : DEPARTMENT_ID,
    })

    // Clean URL if opened via autoOpen param
    useEffect(() => {
        if (searchParams.get('autoOpen') === 'true') {
            window.history.replaceState({}, '', '/enterprise/hr/job-postings')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
            mutate(['/api/job-postings', JSON.stringify({ page, pageSize: PAGE_SIZE, status, departmentId: DEPARTMENT_ID })])
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
            mutate(['/api/job-postings', JSON.stringify({ page, pageSize: PAGE_SIZE, status, departmentId: DEPARTMENT_ID })])
        } catch {
            toast({
                title: 'Lỗi',
                description: 'Không thể xóa tuyển dụng',
                variant: 'destructive',
            })
        }
    }

    const handleCreateNew = () => {
        dispatch({ type: 'openWizard', data: {} })
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
                    <Select value={status} onValueChange={(s) => dispatch({ type: 'setStatus', status: s })}>
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
                        onClick={() => dispatch({ type: 'setPage', page: Math.max(1, page - 1) })}
                        disabled={page === 1}
                    >
                        Trước
                    </Button>
                    <span className="py-2 px-4 text-sm">
                        Trang {page} / {data.pageCount}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => dispatch({ type: 'setPage', page: Math.min(data.pageCount, page + 1) })}
                        disabled={page === data.pageCount}
                    >
                        Sau
                    </Button>
                </div>
            )}

            {/* Wizard Dialog */}
            {wizard.open && (
                <JobPostingWizardDialog
                    open={wizard.open}
                    onOpenChange={(open) => !open && dispatch({ type: 'closeWizard' })}
                    initialData={wizard.data}
                    hidePlanDetailId={wizard.data.hidePlanDetailId || false}
                />
            )}
        </div>
    )
}
export function JobPostingList() {
    return (
        <Suspense>
            <JobPostingListContent />
        </Suspense>
    )
}
