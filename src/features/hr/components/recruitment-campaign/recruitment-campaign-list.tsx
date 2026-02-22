'use client'

import { Suspense, useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Plus, Search, RefreshCw, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
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
import { ErrorDialog } from '@/components/common'

interface RecruitmentCampaignListProps {
    data: RecruitmentCampaign[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

function RecruitmentCampaignListContent({
    data,
    totalCount,
    page,
    totalPages
}: RecruitmentCampaignListProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedCampaign, setSelectedCampaign] = useState<RecruitmentCampaign | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [errorDialog, setErrorDialog] = useState<{ open: boolean; message: string }>({ open: false, message: '' })

    // Filters
    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('search', term)
        } else {
            params.delete('search')
        }
        params.set('page', '1') // Reset to page 1
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleStatusFilter = (status: string) => {
        const params = new URLSearchParams(searchParams)
        if (status && status !== 'All') {
            params.set('status', status)
        } else {
            params.delete('status')
        }
        params.set('page', '1')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleRefresh = () => {
        // Refresh server data
        router.refresh()
        toast({
            description: 'Đã làm mới dữ liệu',
        })
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
        // ⚠️ Backend KHÔNG CÓ route DELETE cho campaign
        // Thay vào đó, sử dụng đổi trạng thái sang Archived
        if (confirm(`Backend chưa hỗ trợ xóa chiến dịch. Bạn muốn chuyển "${campaign.campaignName}" sang trạng thái Archived?`)) {
            try {
                setIsLoading(true)
                await updateRecruitmentCampaignStatus(campaign.id, 'Archived')
                toast({
                    title: 'Thành công',
                    description: 'Đã chuyển chiến dịch sang trạng thái Archived',
                })
                router.refresh()
            } catch (error) {
                console.error(error)
                const errorMessage = error instanceof Error ? error.message : 'Thao tác thất bại'
                toast({
                    variant: 'destructive',
                    title: 'Lỗi',
                    description: errorMessage,
                })
            } finally {
                setIsLoading(false)
            }
        }
    }, [toast, router])

    const handleStatusChange = useCallback(async (id: string, status: string) => {
        try {
            await updateRecruitmentCampaignStatus(id, status)
            toast({
                title: 'Thành công',
                description: 'Đã cập nhật trạng thái chiến dịch',
            })
            // Refresh server data
            router.refresh()
        } catch (error) {
            console.error(error)
            const message = error instanceof Error ? error.message : 'Không thể cập nhật trạng thái'
            setErrorDialog({ open: true, message })
        }
    }, [toast, router])

    const handleSuccess = () => {
        // Refresh server data
        router.refresh()
        setIsDialogOpen(false)
    }

    return (
        <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Chiến dịch tuyển dụng</h1>
                    <p className="text-muted-foreground text-sm">
                        Quản lý các chiến dịch tuyển dụng nhân sự ({totalCount} chiến dịch)
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo chiến dịch mới
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc mã chiến dịch..."
                        defaultValue={searchParams.get('search') || ''}
                        onChange={() => {
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e.currentTarget.value)
                            }
                        }}
                        className="pl-10"
                    />
                </div>
                <div className="w-full sm:w-[200px]">
                    <Select
                        defaultValue={searchParams.get('status') || 'All'}
                        onValueChange={handleStatusFilter}
                    >
                        <SelectTrigger>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <SelectValue placeholder="Trạng thái" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">Tất cả trạng thái</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                            <SelectItem value="Open">Open</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                            <SelectItem value="Archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" size="icon" onClick={handleRefresh} title="Làm mới">
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            <div className="min-h-[500px]">
                <RecruitmentCampaignTable
                    campaigns={data}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    isLoading={isLoading}
                />
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const params = new URLSearchParams(searchParams)
                            params.set('page', String(page - 1))
                            router.push(`${pathname}?${params.toString()}`)
                        }}
                        disabled={page <= 1}
                    >
                        Trước
                    </Button>
                    <div className="text-sm font-medium">
                        Trang {page} / {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const params = new URLSearchParams(searchParams)
                            params.set('page', String(page + 1))
                            router.push(`${pathname}?${params.toString()}`)
                        }}
                        disabled={page >= totalPages}
                    >
                        Sau
                    </Button>
                </div>
            )}

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
export function RecruitmentCampaignList(props: RecruitmentCampaignListProps) {
    return (
        <Suspense>
            <RecruitmentCampaignListContent {...props} />
        </Suspense>
    )
}
