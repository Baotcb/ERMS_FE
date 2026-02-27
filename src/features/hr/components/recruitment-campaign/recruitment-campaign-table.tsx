'use client'

import { format } from 'date-fns'
import {
    Edit2,
    Trash2,
    MoreVertical,
    CalendarRange
} from 'lucide-react'

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
import { Skeleton } from '@/components/ui/skeleton'

import type { RecruitmentCampaign } from '../../types/recruitment-campaign-types'

interface RecruitmentCampaignTableProps {
    campaigns: RecruitmentCampaign[]
    onEdit: (campaign: RecruitmentCampaign) => void
    onDelete: (campaign: RecruitmentCampaign) => void
    onStatusChange: (id: string, status: string) => void
    isLoading?: boolean
}

function CampaignStatusBadge({ status }: { status: string }) {
    const config: Record<string, { bg: string; text: string; dot: string }> = {
        Open: { bg: 'bg-green-100 border-green-200/50', text: 'text-green-700', dot: 'bg-green-500' },
        Draft: { bg: 'bg-slate-100 border-slate-200/50', text: 'text-slate-600', dot: 'bg-slate-400' },
        Closed: { bg: 'bg-orange-100 border-orange-200/50', text: 'text-orange-700', dot: 'bg-orange-500' },
        Archived: { bg: 'bg-purple-100 border-purple-200/50', text: 'text-purple-700', dot: 'bg-purple-500' },
    }

    const c = config[status] ?? config.Draft

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${c.dot}`} />
            {status}
        </span>
    )
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
            <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
            </div>
        )
    }

    if (campaigns.length === 0) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="p-4 rounded-full bg-sky-50 mb-4">
                    <CalendarRange className="w-8 h-8 text-[#0EA5E9]" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600">Chưa có chiến dịch nào</h3>
                <p className="text-slate-400 mt-2 max-w-sm">
                    Bắt đầu bằng cách tạo chiến dịch tuyển dụng mới cho doanh nghiệp của bạn.
                </p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[100px]">
                        Mã
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Tên chiến dịch
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Năm - Quý
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Thời gian nhận
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Ngân sách
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Trạng thái
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-[70px]">

                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
                {campaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-sky-50/30 transition-colors group">
                        <TableCell className="px-6 py-4 align-middle">
                            <span className="text-xs text-slate-400 font-mono">
                                #{campaign.campaignCode}
                            </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle max-w-[300px]">
                            <div className="font-semibold text-[#0C4A6E] text-sm break-words line-clamp-2">
                                {campaign.campaignName}
                            </div>
                            {campaign.description && (
                                <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                    {campaign.description}
                                </div>
                            )}
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle whitespace-nowrap">
                            <div className="flex flex-col text-sm text-slate-600">
                                <span>Năm {campaign.fiscalYear}</span>
                                {campaign.fiscalQuarter && (
                                    <span className="text-xs text-slate-400">Quý {campaign.fiscalQuarter}</span>
                                )}
                            </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle whitespace-nowrap text-sm text-slate-500">
                            {format(new Date(campaign.submissionStartDate), 'dd/MM/yyyy')}
                            {' - '}
                            {format(new Date(campaign.submissionEndDate), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-right whitespace-nowrap">
                            {campaign.totalBudgetCeiling ? (
                                <span className="text-[#0EA5E9] font-semibold text-sm">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(campaign.totalBudgetCeiling)}
                                </span>
                            ) : (
                                <span className="text-slate-400">-</span>
                            )}
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-center">
                            <Select
                                defaultValue={campaign.status}
                                onValueChange={(value) => onStatusChange(campaign.id, value)}
                            >
                                <SelectTrigger className="w-[120px] h-8 mx-auto border-0 rounded-full text-xs font-medium px-3 focus:ring-0 focus:ring-offset-0 cursor-pointer bg-transparent">
                                    <CampaignStatusBadge status={campaign.status} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className="text-slate-400 hover:text-[#0369A1] p-2 rounded-full hover:bg-sky-50 transition-colors cursor-pointer"
                                    >
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </button>
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
    )
}

