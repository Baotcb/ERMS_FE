'use client'

import { Suspense, useEffect, useReducer } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSWRConfig } from 'swr'
import dynamic from 'next/dynamic'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'

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

const STATUS_TABS = [
    { value: 'all', label: 'Tất cả' },
    { value: 'Published', label: 'Đang tuyển' },
    { value: 'Draft', label: 'Nháp' },
    { value: 'Closed', label: 'Đã đóng' },
] as const

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
        case 'setStatus': return { ...state, status: action.status, page: 1 }
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

    // Helper: invalidate tất cả cache job-postings list (mọi filter/page)
    const revalidateList = () => {
        mutate(
            (key: unknown) => Array.isArray(key) && key[0] === '/api/job-postings',
            undefined,
            { revalidate: true }
        )
    }

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
        try {
            await publishJob(id)
            toast({ title: 'Đã đăng tuyển dụng thành công' })
            revalidateList()
        } catch (error) {
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
            revalidateList()
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
            revalidateList()
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

    const pageCount = data?.pageCount ?? 0

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#0C4A6E]">
                    Quản lý Tin tuyển dụng
                </h1>
                <p className="text-[#0C4A6E]/70 text-base">
                    Theo dõi và quản lý các vị trí đang tuyển dụng trong hệ thống ERMS.
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder="Tìm kiếm theo vị trí, mã job..."
                            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-sky-200 focus-visible:border-sky-300"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => dispatch({ type: 'setStatus', status: tab.value })}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${status === tab.value
                                    ? 'bg-white shadow-sm text-[#0C4A6E]'
                                    : 'text-slate-500 hover:text-[#0369A1]'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CTA Button */}
                <Button
                    onClick={handleCreateNew}
                    className="bg-[#22C55E] hover:bg-green-600 text-white rounded-xl h-10 px-6 font-semibold text-sm shadow-md shadow-green-200 active:scale-95 transition-all w-full md:w-auto cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo bài đăng mới
                </Button>
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex flex-col min-h-[420px]">
                <div className="flex-1 overflow-x-auto">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : (
                        <JobPostingTable
                            data={data?.data || []}
                            onPublish={handlePublish}
                            onClose={handleClose}
                            onDelete={handleDelete}
                        />
                    )}
                </div>

                {/* Pagination - inside card */}
                <div className="mt-auto px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch({ type: 'setPage', page: Math.max(1, page - 1) })}
                        disabled={page === 1}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                        Trang {page} / {pageCount}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch({ type: 'setPage', page: Math.min(pageCount, page + 1) })}
                        disabled={page === pageCount}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        Tiếp
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Wizard Dialog */}
            {wizard.open && (
                <JobPostingWizardDialog
                    open={wizard.open}
                    onOpenChange={(open) => {
                        if (!open) {
                            dispatch({ type: 'closeWizard' })
                            revalidateList()
                        }
                    }}
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

