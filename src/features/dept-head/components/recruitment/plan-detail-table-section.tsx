import { format } from 'date-fns'
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { PlanDetail } from '@/features/dept-head/types/recruitment-plan-types'
import { ITEMS_PER_PAGE } from './create-plan-types'

interface PlanDetailTableSectionProps {
    details: PlanDetail[]
    page: number
    onPageChange: (page: number) => void
    onDelete: (detailId: string) => void
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

const PRIORITY_STYLES: Record<string, string> = {
    Urgent: 'bg-red-50 text-red-700 border-red-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Normal: 'bg-gray-50 text-gray-600 border-gray-200',
}

const PRIORITY_LABELS: Record<string, string> = {
    Urgent: 'Khẩn cấp',
    High: 'Cao',
    Normal: 'Bình thường',
}

export function PlanDetailTableSection({ details, page, onPageChange, onDelete }: PlanDetailTableSectionProps) {
    const totalPages = Math.max(1, Math.ceil(details.length / ITEMS_PER_PAGE))
    const paginatedDetails = details.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

    return (
        <div className="bg-white border rounded-lg shadow-sm flex flex-col flex-1 overflow-hidden min-h-[300px]">
            <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="bg-gray-50 sticky top-0 z-10">
                        <TableRow>
                            <TableHead className="w-[180px]">Vị trí</TableHead>
                            <TableHead className="w-[60px] text-center">SL</TableHead>
                            <TableHead className="w-[100px]">Ưu tiên</TableHead>
                            <TableHead className="w-[120px]">Lương Max</TableHead>
                            <TableHead className="w-[120px]">Kinh nghiệm</TableHead>
                            <TableHead className="w-[120px]">Ngày cần</TableHead>
                            <TableHead>Yêu cầu</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedDetails.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-32 text-center text-gray-400">
                                    Chưa có đề xuất nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedDetails.map((detail) => (
                                <TableRow key={detail.id}>
                                    <TableCell className="font-medium text-xs">{detail.positionTitle}</TableCell>
                                    <TableCell className="text-center text-xs">{detail.quantity}</TableCell>
                                    <TableCell>
                                        <span className={cn("px-2 py-1 rounded text-[10px] font-medium border", PRIORITY_STYLES[detail.priority] || PRIORITY_STYLES.Normal)}>
                                            {PRIORITY_LABELS[detail.priority] || 'Bình thường'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {detail.salaryRangeMax ? currencyFormatter.format(detail.salaryRangeMax) : '-'}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {detail.minExperience ? `> ${detail.minExperience} năm` : '-'}
                                    </TableCell>
                                    <TableCell className="text-xs">
                                        {detail.expectedStartDate ? format(new Date(detail.expectedStartDate), 'dd/MM/yyyy') : '-'}
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate text-gray-500 text-xs" title={detail.requiredSkills}>
                                        {detail.requiredSkills || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-600" onClick={() => onDelete(detail.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="border-t p-2 flex items-center justify-between bg-gray-50 text-xs text-gray-500">
                <span>Hiển thị {details.length === 0 ? 0 : ((page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(page * ITEMS_PER_PAGE, details.length)} trên tổng {details.length}</span>
                <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
