'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Check, RotateCcw, X, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

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
import { useToast } from '@/hooks/use-toast';
import { directorTrainingService } from '../../api/director-training-service';
import { TrainingPlan } from '../../../hr/types/training-plan-types';
import type { TrainingPlansResult } from '../../../hr/types/training-plan-types';

const PAGE_SIZE = 7;

export function TrainingPlansApprovalList({ initialData }: { initialData?: TrainingPlansResult }) {
    const { toast } = useToast();
    const [page, setPage] = useState(1);
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isResubmitRequestOpen, setIsResubmitRequestOpen] = useState(false);
    const [resubmitRequestNote, setResubmitRequestNote] = useState('');
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, isLoading, mutate } = useSWR<TrainingPlansResult>(
        ['/api/TrainingPlan', 'director-approval', page],
        () => directorTrainingService.getPlans({ status: 'Pending', page, pageSize: PAGE_SIZE }),
        { fallbackData: initialData }
    );

    const plans = data?.items || [];
    const totalPages = data?.totalPages ?? 1;
    const totalCount = data?.totalCount ?? plans.length;

    const handleApprove = async () => {
        if (!selectedPlan) return;
        setIsSubmitting(true);
        try {
            const res = await directorTrainingService.approvePlan(selectedPlan.id);
            if (res.ok) {
                toast({ title: 'Đã phê duyệt', description: 'Kế hoạch đào tạo đã được phê duyệt thành công.' });
                setIsApproveOpen(false);
                mutate();
            } else {
                toast({ title: 'Lỗi', description: 'Không thể phê duyệt kế hoạch.', variant: 'destructive' });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Không thể phê duyệt kế hoạch. Vui lòng thử lại.';
            toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRequestResubmission = async () => {
        if (!selectedPlan || !resubmitRequestNote.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await directorTrainingService.requestPlanResubmission(
                selectedPlan.id,
                resubmitRequestNote.trim()
            );
            if (res.ok) {
                toast({ title: 'Đã yêu cầu gửi lại', description: 'Kế hoạch đã được trả về HR để chỉnh sửa và gửi lại.' });
                setIsResubmitRequestOpen(false);
                setResubmitRequestNote('');
                mutate();
            } else {
                toast({ title: 'Lỗi', description: 'Không thể gửi yêu cầu chỉnh sửa.', variant: 'destructive' });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Không thể gửi yêu cầu. Vui lòng thử lại.';
            toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedPlan || !rejectReason.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await directorTrainingService.rejectPlan(selectedPlan.id, rejectReason.trim());
            if (res.ok) {
                toast({ title: 'Đã từ chối', description: 'Kế hoạch đào tạo đã bị từ chối.' });
                setIsRejectOpen(false);
                setRejectReason('');
                mutate();
            } else {
                toast({ title: 'Lỗi', description: 'Không thể từ chối kế hoạch.', variant: 'destructive' });
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Không thể từ chối kế hoạch. Vui lòng thử lại.';
            toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Phê duyệt kế hoạch đào tạo</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Duyệt các kế hoạch đào tạo do HR đề xuất ({totalCount} kế hoạch chờ duyệt)
                </p>
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
                                <TableHead className="text-right font-bold text-[#0F4C75]">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : plans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-gray-400 italic">
                                        Không có kế hoạch nào chờ duyệt
                                    </TableCell>
                                </TableRow>
                            ) : (
                                plans.map((plan) => (
                                    <TableRow key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-medium text-gray-900">
                                            <div>
                                                <p className="font-semibold">{plan.planName}</p>
                                                <p className="text-xs text-gray-500">{plan.planCode}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-0">
                                                {plan.year}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{plan.totalCourses} khóa học</TableCell>
                                        <TableCell className="text-gray-900 font-semibold">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {format(new Date(plan.createdAt), 'dd/MM/yyyy')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-green-600 hover:bg-green-50 hover:text-green-700"
                                                    onClick={() => { setSelectedPlan(plan); setIsApproveOpen(true); }}
                                                    title="Phê duyệt"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                                                    onClick={() => { setSelectedPlan(plan); setIsResubmitRequestOpen(true); }}
                                                    title="Yêu cầu gửi lại"
                                                >
                                                    <RotateCcw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => { setSelectedPlan(plan); setIsRejectOpen(true); }}
                                                    title="Từ chối"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-gray-500 hover:bg-gray-50"
                                                    onClick={() => setSelectedPlan(plan)}
                                                    title="Chi tiết"
                                                >
                                                    <Info className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
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
        </div>
    );
}
