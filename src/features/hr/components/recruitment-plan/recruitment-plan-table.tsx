'use client'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale' // Import Vietnamese locale if available, or just use format string
import {
    Edit2,
    Trash2,
    MoreHorizontal,
    CalendarRange
} from 'lucide-react'

import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import type { RecruitmentPlan } from '../../types/recruitment-plan-types'

interface RecruitmentPlanTableProps {
    plans: RecruitmentPlan[]
    onEdit: (plan: RecruitmentPlan) => void
    onDelete: (plan: RecruitmentPlan) => void
    isLoading?: boolean
}

export function RecruitmentPlanTable({
    plans,
    onEdit,
    onDelete,
    isLoading
}: RecruitmentPlanTableProps) {

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        )
    }

    if (plans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed text-center">
                <div className="p-4 rounded-full bg-blue-50 mb-4">
                    <CalendarRange className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Chưa có kế hoạch nào</h3>
                <p className="text-gray-500 mt-1 max-w-sm">
                    Bắt đầu bằng cách tạo kế hoạch tuyển dụng mới cho doanh nghiệp của bạn.
                </p>
            </div>
        )
    }

    return (
        <div className="rounded-md border bg-white overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow>
                        <TableHead className="w-[100px]">Mã</TableHead>
                        <TableHead>Tên kế hoạch</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead className="text-right">Ngân sách</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {plans.map((plan) => (
                        <TableRow key={plan.id} className="hover:bg-blue-50/10 transition-colors">
                            <TableCell className="font-medium">
                                <Badge variant="outline" className="font-mono bg-gray-50">
                                    {plan.planCode}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium text-blue-900">{plan.planName}</div>
                                {plan.description && (
                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                        {plan.description}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        {format(new Date(plan.startDate), 'dd/MM/yyyy')}
                                        {' - '}
                                        {format(new Date(plan.endDate), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {plan.totalBudget ? (
                                    <span className="text-emerald-600 font-medium">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge
                                    className={
                                        plan.status === 'Approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                            plan.status === 'Draft' ? 'bg-gray-100 text-gray-700 hover:bg-gray-100' :
                                                'bg-blue-100 text-blue-700 hover:bg-blue-100'
                                    }
                                    variant="secondary"
                                >
                                    {plan.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onEdit(plan)} className="cursor-pointer">
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Chỉnh sửa
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onDelete(plan)} className="text-red-600 cursor-pointer focus:text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Xóa
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
