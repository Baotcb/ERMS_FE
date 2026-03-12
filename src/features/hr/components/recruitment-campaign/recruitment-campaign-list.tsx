'use client'

import { Suspense, useState, useCallback } from 'react'
import { Plus, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { mutate } from 'swr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import { RecruitmentCampaignTable } from './recruitment-campaign-table'
import { RecruitmentCampaignForm } from './recruitment-campaign-form'
import { updateRecruitmentCampaignStatus } from '../../api/recruitment-campaign-service'
import type { RecruitmentCampaign } from '../../types/recruitment-campaign-types'
import { useRecruitmentCampaigns } from '../../hooks/use-recruitment-campaigns'
import { ErrorDialog } from '@/components/common'

const STATUS_TABS = [
    { value: 'All', label: 'Tất cả' },
    { value: 'Open', label: 'Open' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Archived', label: 'Archived' },
] as const

const PAGE_SIZE = 7

function RecruitmentCampaignListContent() {
    const { toast } = useToast()

    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedCampaign, setSelectedCampaign] = useState<RecruitmentCampaign | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: '' })

    // SWR hook — client-side fetching
    const { campaigns, totalCount, totalPages, isLoading } = useRecruitmentCampaigns({
        page,
        pageSize: PAGE_SIZE,
        search: searchQuery || undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
    })

    const revalidate = useCallback(() => {
        mutate(
            (key: unknown) => Array.isArray(key) && key[0] === 'campaigns' && key[1] === 'list',
            undefined,
            { revalidate: true }
        )
    }, [])

    // Filters
    const handleSearch = (term: string) => {
        setSearchQuery(term)
        setPage(1)
    }

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status)
        setPage(1)
    }

    // Actions
    const handleCreate = () => {
        setSelectedCampaign(null)
        setIsDialogOpen(true)
    }

    const handleEdit = useCallback((campaign: RecruitmentCampaign) => {
        setSelectedCampaign(campaign)
        setIsDialogOpen(true)
    }, [])

    const handleDelete = useCallback(async (campaign: RecruitmentCampaign) => {
        if (confirm(`Backend chưa hỗ trợ xóa chiến dịch. Bạn muốn chuyển "${campaign.campaignName}" sang trạng thái Archived?`)) {
            try {
                setActionLoading(true)
                await updateRecruitmentCampaignStatus(campaign.id, 'Archived')
                toast({
                    title: 'Thành công',
                    description: 'Đã chuyển chiến dịch sang trạng thái Archived',
                })
                revalidate()
            } catch (error) {
                console.error(error)
                const errorMessage = error instanceof Error ? error.message : 'Thao tác thất bại'
                toast({
                    variant: 'destructive',
                    title: 'Lỗi',
                    description: errorMessage,
                })
            } finally {
                setActionLoading(false)
            }
        }
    }, [toast, revalidate])

    const handleStatusChange = useCallback(async (id: string, status: string) => {
        try {
            await updateRecruitmentCampaignStatus(id, status)
            toast({
                title: 'Thành công',
                description: 'Đã cập nhật trạng thái chiến dịch',
            })
            revalidate()
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái'
            setErrorDialog({ open: true, message })
        }
    }, [toast, revalidate])

    const handleSuccess = () => {
        revalidate()
        setIsDialogOpen(false)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#0C4A6E]">
                    Chiến dịch tuyển dụng
                </h1>
                <p className="text-[#0C4A6E]/70 text-base">
                    Quản lý các chiến dịch tuyển dụng nhân sự ({totalCount} chiến dịch)
                </p>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <Input
                            placeholder="Tìm kiếm theo tên hoặc mã chiến dịch..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-sky-200 focus-visible:border-sky-300"
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-1 p-1 bg-slate-50 rounded-xl">
                        {STATUS_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => handleStatusFilter(tab.value)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${statusFilter === tab.value
                                    ? 'bg-white shadow-sm text-[#0C4A6E]'
                                    : 'text-slate-500 hover:text-[#0369A1]'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Refresh */}
                    <button
                        type="button"
                        onClick={revalidate}
                        disabled={isLoading}
                        className="p-2.5 text-slate-400 hover:text-[#0369A1] hover:bg-sky-50 rounded-full transition-colors cursor-pointer disabled:opacity-50"
                        title="Làm mới"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* CTA Button */}
                <Button
                    onClick={handleCreate}
                    className="bg-[#22C55E] hover:bg-green-600 text-white rounded-xl h-10 px-6 font-semibold text-sm shadow-md shadow-green-200 active:scale-95 transition-all w-full md:w-auto cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo chiến dịch mới
                </Button>
            </div>

            {/* Data Table Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex flex-col min-h-[500px]">
                <div className="flex-1 overflow-x-auto">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-10 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                            <Skeleton className="h-16 w-full rounded-lg" />
                        </div>
                    ) : (
                        <RecruitmentCampaignTable
                            campaigns={campaigns}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onStatusChange={handleStatusChange}
                            isLoading={actionLoading}
                        />
                    )}
                </div>

                {/* Pagination - inside card */}
                <div className="mt-auto px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </Button>
                    <span className="text-sm font-medium text-slate-600">
                        Trang {page} / {totalPages}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#0369A1] hover:bg-slate-50 cursor-pointer"
                    >
                        Tiếp
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedCampaign ? 'Chỉnh sửa chiến dịch' : 'Tạo chiến dịch tuyển dụng'}</DialogTitle>
                    </DialogHeader>
                    <RecruitmentCampaignForm
                        campaign={selectedCampaign}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
            <ErrorDialog
                open={errorDialog.open}
                onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, open }))}
                title="Có lỗi xảy ra"
                message={errorDialog.message}
                variant="forbidden"
            />
        </div>
    )
}

export function RecruitmentCampaignList() {
    return (
        <Suspense>
            <RecruitmentCampaignListContent />
        </Suspense>
    )
}
