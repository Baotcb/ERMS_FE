'use client'

import { useState, useCallback } from 'react'
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

import { RecruitmentPlanTable } from './recruitment-plan-table'
import { RecruitmentPlanForm } from './recruitment-plan-form'
import { deleteRecruitmentPlan } from '../../api/recruitment-plan-service'
import type { RecruitmentPlan } from '../../types/recruitment-plan-types'

interface RecruitmentPlanListProps {
    data: RecruitmentPlan[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
}

export function RecruitmentPlanList({
    data,
    totalCount,
    page,
    totalPages
}: RecruitmentPlanListProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { toast } = useToast()

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<RecruitmentPlan | null>(null)
    const [isLoading, setIsLoading] = useState(false)

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
        router.refresh()
        toast({
            description: 'Đã làm mới dữ liệu',
        })
    }

    // Actions
    const handleCreate = () => {
        setSelectedPlan(null)
        setIsDialogOpen(true)
    }

    const handleEdit = useCallback((plan: RecruitmentPlan) => {
        setSelectedPlan(plan)
        setIsDialogOpen(true)
    }, [])

    const handleDelete = useCallback(async (plan: RecruitmentPlan) => {
        if (confirm(`Bạn có chắc chắn muốn xóa kế hoạch "${plan.planName}"?`)) {
            try {
                setIsLoading(true)
                await deleteRecruitmentPlan(plan.id)
                toast({
                    title: 'Thành công',
                    description: 'Đã xóa kế hoạch tuyển dụng',
                })
                router.refresh()
            } catch (error) {
                console.error(error)
                toast({
                    variant: 'destructive',
                    title: 'Lỗi',
                    description: 'Xóa thất bại',
                })
            } finally {
                setIsLoading(false)
            }
        }
    }, [router, toast])

    const handleSuccess = () => {
        router.refresh()
        setIsDialogOpen(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#0F4C75]">Kế hoạch tuyển dụng</h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý các kế hoạch tuyển dụng nhân sự của doanh nghiệp ({totalCount} kế hoạch)
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo kế hoạch mới
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm theo tên hoặc mã kế hoạch..."
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
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Approved">Approved</SelectItem>
                            <SelectItem value="Rejected">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button variant="outline" size="icon" onClick={handleRefresh} title="Làm mới">
                    <RefreshCw className="w-4 h-4" />
                </Button>
            </div>

            <RecruitmentPlanTable
                plans={data}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
            />

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
                        <DialogTitle>{selectedPlan ? 'Chỉnh sửa kế hoạch' : 'Tạo kế hoạch tuyển dụng'}</DialogTitle>
                    </DialogHeader>
                    <RecruitmentPlanForm
                        plan={selectedPlan}
                        onSuccess={handleSuccess}
                        onCancel={() => setIsDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
