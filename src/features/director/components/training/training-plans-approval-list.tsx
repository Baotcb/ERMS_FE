'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Check, RotateCcw, X, Info } from 'lucide-react';
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

export function TrainingPlansApprovalList() {
    const { toast } = useToast();
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isResubmitRequestOpen, setIsResubmitRequestOpen] = useState(false);
    const [resubmitRequestNote, setResubmitRequestNote] = useState('');
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, isLoading, mutate } = useSWR<{ items: TrainingPlan[] }>(
        '/api/TrainingPlan?status=Pending',
        () => directorTrainingService.getPendingPlans()
    );

    const plans = data?.items || [];

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
        } catch (error) {
            void error;
            toast({ title: 'Lỗi', description: 'Không thể phê duyệt kế hoạch. Vui lòng thử lại.', variant: 'destructive' });
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
                toast({ title: 'Lỗi', description: 'Không thể gửi yêu cầu chỉnh sửa kế hoạch.', variant: 'destructive' });
            }
        } catch (error) {
            void error;
            toast({ title: 'Lỗi', description: 'Không thể gửi yêu cầu chỉnh sửa kế hoạch. Vui lòng thử lại.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedPlan || !rejectReason.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await directorTrainingService.rejectPlan(
                selectedPlan.id,
                rejectReason.trim()
            );
            if (res.ok) {
                toast({ title: 'Đã từ chối', description: 'Kế hoạch đã bị từ chối.' });
                setIsRejectOpen(false);
                setRejectReason('');
                mutate();
            } else {
                toast({ title: 'Lỗi', description: 'Không thể từ chối kế hoạch.', variant: 'destructive' });
            }
        } catch (error) {
            void error;
            toast({ title: 'Lỗi', description: 'Không thể từ chối kế hoạch. Vui lòng thử lại.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#0F4C75]">Duyệt kế hoạch đào tạo</h2>
                    <p className="text-sm text-gray-500 mt-1">Xem xét và phê duyệt các kế hoạch đào tạo năm từ phòng HR</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-bold text-[#0F4C75]">Kế hoạch</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Năm</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Tổng ngân sách</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Ngày gửi</TableHead>
                            <TableHead className="text-right font-bold text-[#0F4C75]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-10">Đang tải...</TableCell></TableRow>
                        ) : plans?.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-10 italic text-gray-400">Không có kế hoạch nào cần phê duyệt</TableCell></TableRow>
                        ) : (
                            plans?.map((plan: TrainingPlan) => (
                                <TableRow key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium text-gray-900">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{plan.planName}</span>
                                            <span className="text-xs text-gray-400">{plan.planCode}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{new Date(plan.startDate).getFullYear()}</Badge></TableCell>
                                    <TableCell className="font-semibold text-[#0F4C75]">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}
                                    </TableCell>
                                    <TableCell className="text-gray-500">{format(new Date(plan.createdAt), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => { setSelectedPlan(plan); setIsApproveOpen(true); }}>
                                                <Check className="w-4 h-4 mr-1" /> Phê duyệt
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => { setSelectedPlan(plan); setIsResubmitRequestOpen(true); }}>
                                                <RotateCcw className="w-4 h-4 mr-1" /> Yêu cầu gửi lại
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setSelectedPlan(plan); setIsRejectOpen(true); }}>
                                                <X className="w-4 h-4 mr-1" /> Từ chối
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
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
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0" />
                        <p className="text-sm text-blue-700">Sau khi phê duyệt, HR sẽ nhận được thông báo để triển khai kế hoạch.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Hủy</Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove} disabled={isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : 'Đồng ý phê duyệt'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Resubmission Dialog */}
            <Dialog open={isResubmitRequestOpen} onOpenChange={setIsResubmitRequestOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-amber-700">Yêu cầu gửi lại kế hoạch</DialogTitle>
                        <DialogDescription>Vui lòng cung cấp nội dung cần chỉnh sửa để HR cập nhật và gửi lại kế hoạch.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea 
                            placeholder="Nhập nội dung yêu cầu chỉnh sửa..." 
                            value={resubmitRequestNote}
                            onChange={(e) => setResubmitRequestNote(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResubmitRequestOpen(false)}>Hủy</Button>
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white" onClick={handleRequestResubmission} disabled={!resubmitRequestNote.trim() || isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : 'Gửi yêu cầu gửi lại'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Từ chối kế hoạch</DialogTitle>
                        <DialogDescription>Vui lòng nhập lý do từ chối để HR nắm rõ và lưu vết phê duyệt.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea
                            placeholder="Nhập lý do từ chối..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Hủy</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReject} disabled={!rejectReason.trim() || isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
