'use client'

import { format } from 'date-fns'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

import type { RecruitmentCampaign } from '../../types/recruitment-campaign-types'

interface RecruitmentCampaignTableProps {
    campaigns: RecruitmentCampaign[]
    onEdit: (campaign: RecruitmentCampaign) => void
    onDelete: (campaign: RecruitmentCampaign) => void
    onStatusChange: (id: string, status: string) => void
    isLoading?: boolean
}

export function RecruitmentCampaignTable({
    campaigns,
    onEdit,
    onDelete,
    onStatusChange,
    isLoading
}: RecruitmentCampaignTableProps) {

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

    if (campaigns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed text-center">
                <div className="p-4 rounded-full bg-blue-50 mb-4">
                    <CalendarRange className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Chưa có chiến dịch nào</h3>
                <p className="text-gray-500 mt-1 max-w-sm">
                    Bắt đầu bằng cách tạo chiến dịch tuyển dụng mới cho doanh nghiệp của bạn.
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
                        <TableHead>Tên chiến dịch</TableHead>
                        <TableHead>Năm - Quý</TableHead>
                        <TableHead>Thời gian nhận</TableHead>
                        <TableHead className="text-right">Ngân sách</TableHead>
                        <TableHead className="text-center">Trạng thái</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {campaigns.map((campaign) => (
                        <TableRow key={campaign.id} className="hover:bg-blue-50/10 transition-colors">
                            <TableCell className="font-medium">
                                <Badge variant="outline" className="font-mono bg-gray-50">
                                    {campaign.campaignCode}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium text-blue-900">{campaign.campaignName}</div>
                                {campaign.description && (
                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                        {campaign.description}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm text-gray-600">
                                    <span>Năm {campaign.fiscalYear}</span>
                                    {campaign.fiscalQuarter && (
                                        <span className="text-xs text-gray-400">Quý {campaign.fiscalQuarter}</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                        {format(new Date(campaign.submissionStartDate), 'dd/MM/yyyy')}
                                        {' - '}
                                        {format(new Date(campaign.submissionEndDate), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-mono">
                                {campaign.totalBudgetCeiling ? (
                                    <span className="text-emerald-600 font-medium">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(campaign.totalBudgetCeiling)}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-center">
                                <Select
                                    defaultValue={campaign.status}
                                    onValueChange={(value) => onStatusChange(campaign.id, value)}
                                >
                                    <SelectTrigger
                                        className={`w-[110px] h-7 mx-auto border-0 rounded-full text-xs font-semibold px-3 ${campaign.status === 'Open' ? 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-0 focus:ring-offset-0' :
                                                campaign.status === 'Draft' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-0 focus:ring-offset-0' :
                                                    campaign.status === 'Closed' ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-0 focus:ring-offset-0' :
                                                        campaign.status === 'Archived' ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 focus:ring-0 focus:ring-offset-0' :
                                                            'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-0 focus:ring-offset-0'
                                            }`}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Draft">Draft</SelectItem>
                                        <SelectItem value="Open">Open</SelectItem>
                                        <SelectItem value="Closed">Closed</SelectItem>
                                        <SelectItem value="Archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                        <DropdownMenuItem onClick={() => onEdit(campaign)} className="cursor-pointer">
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Chỉnh sửa
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onDelete(campaign)} className="text-red-600 cursor-pointer focus:text-red-600">
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
