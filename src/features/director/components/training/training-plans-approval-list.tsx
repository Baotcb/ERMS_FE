'use client';

import { useState } from 'react';
import { Check, RotateCcw, X, Eye, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { formatVND } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { directorTrainingService } from '../../api/director-training-service';
import { TrainingPlan } from '../../../hr/types/training-plan-types';
import type { TrainingPlansResult } from '../../../hr/types/training-plan-types';
import { TrainingPlanDetail } from '../../../hr/components/training/training-plan-detail';
import { STATUS_COLORS, getStatusLabel } from '../../../hr/utils/training-status-utils';
import { usePaginatedList } from '@/hooks/use-paginated-list';
import { useAsyncAction } from '@/hooks/use-async-action';
import { TablePagination } from '@/components/common/table-pagination';


export function TrainingPlansApprovalList({ initialData }: { initialData?: TrainingPlansResult }) {
    const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Closed'>('Pending');
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isResubmitRequestOpen, setIsResubmitRequestOpen] = useState(false);
    const [resubmitRequestNote, setResubmitRequestNote] = useState('');
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCloseOpen, setIsCloseOpen] = useState(false);
    const [closingNote, setClosingNote] = useState('');

    const {
        items: plans, totalCount, totalPages, page, setPage,
        isLoading, mutate,
    } = usePaginatedList({
        key: ['/api/TrainingPlan', 'director-approval'],
        fetcher: (params) => directorTrainingService.getPlans({ ...params, status: statusFilter }),
        initialData,
        extraParams: { status: statusFilter },
    });

    const { execute, isSubmitting } = useAsyncAction();

    const handleApprove = () => execute(
        () => directorTrainingService.approvePlan(selectedPlan!.id),
        {
            successMessage: { title: 'Đã phê duyệt', description: 'Kế hoạch đào tạo đã được phê duyệt thành công.' },
            onSuccess: () => { setIsApproveOpen(false); mutate(); },
        },
    );

    const handleRequestResubmission = () => {
        if (!resubmitRequestNote.trim()) return;
        return execute(
            () => directorTrainingService.requestPlanResubmission(selectedPlan!.id, resubmitRequestNote.trim()),
            {
                successMessage: { title: 'Đã yêu cầu gửi lại', description: 'Kế hoạch đã được trả về HR để chỉnh sửa và gửi lại.' },
                onSuccess: () => { setIsResubmitRequestOpen(false); setResubmitRequestNote(''); mutate(); },
            },
        );
    };

    const handleReject = () => {
        if (!rejectReason.trim()) return;
        return execute(
            () => directorTrainingService.rejectPlan(selectedPlan!.id, rejectReason.trim()),
            {
                successMessage: { title: 'Đã từ chối', description: 'Kế hoạch đào tạo đã bị từ chối.' },
                onSuccess: () => { setIsRejectOpen(false); setRejectReason(''); mutate(); },
            },
        );
    };

    const handleClosePlan = () => execute(
        () => directorTrainingService.closePlan(selectedPlan!.id, closingNote.trim() || undefined),
        {
            successMessage: { title: 'Đã đóng', description: 'Kế hoạch đào tạo đã được đóng thành công.' },
            onSuccess: () => { setIsCloseOpen(false); setClosingNote(''); mutate(); },
        },
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Quản lý kế hoạch đào tạo</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Duyệt và quản lý các kế hoạch đào tạo ({totalCount} kế hoạch)
                </p>
                <div className="flex gap-2 mt-4">
                    {(['Pending', 'Approved', 'Closed'] as const).map((status) => {
                        const labels: Record<string, string> = { Pending: 'Chờ duyệt', Approved: 'Đã duyệt', Closed: 'Đã đóng' };
                        const isActive = statusFilter === status;
                        return (
                            <Button
                                key={status}
                                variant={isActive ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => { setStatusFilter(status); setPage(1); }}
                                className={isActive ? 'bg-[#0F4C75] hover:bg-[#1A5F8C] text-white' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}
                            >
                                {labels[status]}
                            </Button>
                        );
                    })}
                </div>
            </div>


            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[420px]">
                <div className="flex-1 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-bold text-[#0F4C75]">Tên kế hoạch</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Năm</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Số khóa học</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Tổng ngân sách</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Ngày tạo</TableHead>
                                {statusFilter !== 'Pending' && (
                                    <TableHead className="font-bold text-[#0F4C75]">Trạng thái</TableHead>
                                )}
                                <TableHead className="text-right font-bold text-[#0F4C75]">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={statusFilter !== 'Pending' ? 7 : 6} className="text-center py-12 text-gray-400">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : plans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={statusFilter !== 'Pending' ? 7 : 6} className="text-center py-12 text-gray-400 italic">
                                        Không có kế hoạch nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                plans.map((plan) => (
                                    <TableRow key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-medium text-gray-900">
                                            <div className="flex flex-col">
                                                <span className="font-bold">{plan.planName}</span>
                                                <span className="text-xs text-gray-400">{plan.planCode}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0">
                                                {plan.year}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{plan.totalCourses} khóa học</TableCell>
                                        <TableCell className="font-semibold text-[#0F4C75]">
                                            {formatVND(plan.totalBudget)}
                                        </TableCell>
                                        <TableCell className="text-gray-500">{format(new Date(plan.createdAt), 'dd/MM/yyyy')}</TableCell>
                                        {statusFilter !== 'Pending' && (
                                            <TableCell>
                                                <Badge variant="outline" className={`border-0 font-semibold px-2.5 py-0.5 ${STATUS_COLORS[plan.status] || 'bg-gray-100'}`}>
                                                    {getStatusLabel(plan)}
                                                </Badge>
                                            </TableCell>
                                        )}
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" className="text-[#0F4C75] border-blue-200 hover:bg-blue-50" onClick={() => { setSelectedPlan(plan); setIsDetailOpen(true); }}>
                                                    <Eye className="w-4 h-4 mr-1" /> Chi tiết
                                                </Button>
                                                {plan.status === 'Pending' && (
                                                    <>
                                                        <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => { setSelectedPlan(plan); setIsApproveOpen(true); }}>
                                                            <Check className="w-4 h-4 mr-1" /> Phê duyệt
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => { setSelectedPlan(plan); setIsResubmitRequestOpen(true); }}>
                                                            <RotateCcw className="w-4 h-4 mr-1" /> Gửi lại
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setSelectedPlan(plan); setIsRejectOpen(true); }}>
                                                            <X className="w-4 h-4 mr-1" /> Từ chối
                                                        </Button>
                                                    </>
                                                )}
                                                {plan.status === 'Approved' && (
                                                    <Button variant="outline" size="sm" className="text-slate-600 border-slate-200 hover:bg-slate-50" onClick={() => { setSelectedPlan(plan); setIsCloseOpen(true); }}>
                                                        <Lock className="w-4 h-4 mr-1" /> Đóng kế hoạch
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {/* Approve Dialog */}
            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận phê duyệt</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn phê duyệt kế hoạch <strong>{selectedPlan?.planName}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Hủy</Button>
                        <Button onClick={handleApprove} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
                            {isSubmitting ? 'Đang xử lý...' : 'Phê duyệt'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Resubmit Request Dialog */}
            <Dialog open={isResubmitRequestOpen} onOpenChange={setIsResubmitRequestOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yêu cầu gửi lại</DialogTitle>
                        <DialogDescription>
                            Ghi chú cho HR về nội dung cần chỉnh sửa trong kế hoạch <strong>{selectedPlan?.planName}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Nhập nội dung cần chỉnh sửa..."
                        value={resubmitRequestNote}
                        onChange={(e) => setResubmitRequestNote(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsResubmitRequestOpen(false); setResubmitRequestNote(''); }}>Hủy</Button>
                        <Button onClick={handleRequestResubmission} disabled={isSubmitting || !resubmitRequestNote.trim()} className="bg-amber-500 hover:bg-amber-600 text-white">
                            {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Từ chối kế hoạch</DialogTitle>
                        <DialogDescription>
                            Lý do từ chối kế hoạch <strong>{selectedPlan?.planName}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Nhập lý do từ chối..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="min-h-[100px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsRejectOpen(false); setRejectReason(''); }}>Hủy</Button>
                        <Button onClick={handleReject} disabled={isSubmitting || !rejectReason.trim()} variant="destructive">
                            {isSubmitting ? 'Đang xử lý...' : 'Từ chối'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Training Plan Detail Modal */}
            <TrainingPlanDetail 
                plan={selectedPlan} 
                open={isDetailOpen} 
                onOpenChange={setIsDetailOpen} 
            />

            {/* Close Plan Dialog */}
            <Dialog open={isCloseOpen} onOpenChange={(open) => {
                setIsCloseOpen(open);
                if (!open) { setClosingNote(''); setTimeout(() => setSelectedPlan(null), 300); }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Đóng kế hoạch đào tạo</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn đóng kế hoạch <strong>{selectedPlan?.planName}</strong>?
                            Tất cả các yêu cầu đào tạo liên quan sẽ được chuyển sang trạng thái &quot;Hoàn thành&quot;.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Ghi chú khi đóng (tùy chọn)..."
                        value={closingNote}
                        onChange={(e) => setClosingNote(e.target.value)}
                        className="min-h-[80px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsCloseOpen(false); setClosingNote(''); }}>Hủy</Button>
                        <Button onClick={handleClosePlan} disabled={isSubmitting} className="bg-slate-700 hover:bg-slate-800 text-white">
                            {isSubmitting ? 'Đang xử lý...' : 'Đóng kế hoạch'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
