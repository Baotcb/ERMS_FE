'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { Plus, Search, Send, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { CreatePlanForm } from './create-plan-form'
import type { PlanListResponse } from '@/features/dept-head/types/recruitment-plan-types'

const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
    Draft: 'Bản nháp',
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Rejected: 'Từ chối',
}

export function PlanList() {
    const router = useRouter()
    const { toast } = useToast()
    const [search, setSearch] = useState('')
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    // Fetch plans
    const { data, isLoading, mutate } = useSWR<PlanListResponse>(
        ['/api/RecruitmentPlans', search],
        () => apiClient.get(`/api/RecruitmentPlans?Page=1&PageSize=50&Search=${search}`).then(res => res.json())
    )

    const handleSubmitPlan = async (planId: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn gửi kế hoạch "${name}" đi phê duyệt? Bạn sẽ không thể chỉnh sửa sau khi gửi.`)) {
            return
        }

        try {
            const res = await apiClient.patch('/api/RecruitmentPlans/submit', { id: planId })
            if (res.ok) {
                toast({
                    title: 'Đã gửi phê duyệt',
                    description: `Kế hoạch "${name}" đã được gửi tới Giám đốc.`,
                })
                mutate() // Refresh list
            } else {
                const err = await res.json()
                throw new Error(err.message || 'Lỗi khi gửi kế hoạch')
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi gửi kế hoạch'
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: errorMessage,
            })
        }
    }

    const handleDeletePlan = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bản nháp này?')) return

        try {
            const res = await apiClient.delete(`/api/RecruitmentPlans/${id}`)
            if (res.ok) {
                toast({
                    title: 'Đã xóa',
                    description: 'Kế hoạch đã được xóa thành công.',
                })
                mutate()
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Kế hoạch tuyển dụng</h2>
                    <p className="text-muted-foreground">
                        Quản lý các kế hoạch tuyển dụng của phòng ban
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-[#0F4C75] hover:bg-[#3282B8]">
                    <Plus className="mr-2 h-4 w-4" /> Tạo kế hoạch mới
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm kiếm theo mã hoặc tên..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Mã kế hoạch</TableHead>
                            <TableHead>Tên kế hoạch</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Ngân sách</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : data?.items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Chưa có kế hoạch tuyển dụng nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.items?.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-mono text-xs">{plan.planCode}</TableCell>
                                    <TableCell className="font-medium">{plan.planName}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {format(new Date(plan.startDate), 'dd/MM/yyyy')} - {format(new Date(plan.endDate), 'dd/MM/yyyy')}
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`border-0 ${STATUS_COLORS[plan.status] || 'bg-gray-100'}`}>
                                            {STATUS_LABELS[plan.status] || plan.status}
                                        </Badge>
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
                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/enterprise/dept-head/recruitment-plans/${plan.id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                                </DropdownMenuItem>

                                                {/* Actions only for Draft/Rejected */}
                                                {(plan.status === 'Draft' || plan.status === 'Rejected') && (
                                                    <>
                                                        <DropdownMenuItem onClick={() => router.push(`/enterprise/dept-head/recruitment-plans/${plan.id}/edit`)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleSubmitPlan(plan.id, plan.planName)}>
                                                            <Send className="mr-2 h-4 w-4" /> Gửi duyệt
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-red-600" onClick={() => handleDeletePlan(plan.id)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CreatePlanForm
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={() => mutate()}
            />
        </div>
    )
}
