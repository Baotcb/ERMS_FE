'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Check, X, Eye, BookOpen, Calendar, DollarSign, Info, AlertCircle } from 'lucide-react';
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
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: plans, isLoading, mutate } = useSWR<TrainingPlan[]>(
        'pending_training_plans',
        () => directorTrainingService.getPendingPlans()
    );

    const handleApprove = async () => {
        if (!selectedPlan) return;
        setIsSubmitting(true);
        try {
            const res = await directorTrainingService.approvePlan(selectedPlan.id);
            if (res.ok) {
                toast({ title: 'Đã phê duyệt', description: 'Kế hoạch đào tạo đã được phê duyệt thành công.' });
                setIsApproveOpen(false);
                mutate();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedPlan || !rejectReason) return;
        setIsSubmitting(true);
        try {
            const res = await directorTrainingService.rejectPlan(selectedPlan.id, rejectReason);
            if (res.ok) {
                toast({ title: 'Đã từ chối', description: 'Kế hoạch đã được trả về cho HR xử lý.' });
                setIsRejectOpen(false);
                setRejectReason('');
                mutate();
            }
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
                            <TableHead className="font-bold text-[#0F4C75]">Tên kế hoạch</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Năm</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Số khóa</TableHead>
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
                            plans?.map((plan) => (
                                <TableRow key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-blue-500" />
                                            {plan.planName}
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{plan.year}</Badge></TableCell>
                                    <TableCell>{plan.totalCourses} khóa</TableCell>
                                    <TableCell className="font-semibold text-[#0F4C75]">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}
                                    </TableCell>
                                    <TableCell className="text-gray-500">{format(new Date(plan.createdAt), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => { setSelectedPlan(plan); setIsApproveOpen(true); }}>
                                                <Check className="w-4 h-4 mr-1" /> Phê duyệt
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

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Từ chối kế hoạch</DialogTitle>
                        <DialogDescription>Vui lòng cung cấp lý do từ chối để bộ phận HR điều chỉnh.</DialogDescription>
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
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleReject} disabled={!rejectReason || isSubmitting}>
                            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
