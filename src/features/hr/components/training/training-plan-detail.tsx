'use client';

import useSWR from 'swr';

import { 
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    DollarSign, BookOpen, Clock, User, ClipboardList, Info, BarChart3, TrendingUp,
    Layers, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { TrainingPlan } from '../../types/training-plan-types';
import { STATUS_COLORS, getStatusLabel, getDisplayReviewNote, getReviewNoteHeading } from '../../utils/training-status-utils';
import { formatVND } from '@/lib/utils';
import { hrTrainingService } from '../../api/hr-training-service';

interface TrainingPlanDetailProps {
    plan: TrainingPlan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TrainingPlanDetail({ plan, open, onOpenChange }: TrainingPlanDetailProps) {
    const { data: detailData, isLoading } = useSWR(
        open && plan ? `/api/TrainingPlan/${plan.id}` : null,
        () => plan ? hrTrainingService.getPlanDetail(plan.id) : null
    );

    if (!plan) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0F4C75] to-[#3282B8] px-6 py-8 text-white relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4">
                        <BarChart3 size={200} />
                    </div>
                    <DialogHeader>
                        <div className="flex justify-between items-start relative z-10">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold">{plan.planName}</DialogTitle>
                                <DialogDescription className="text-blue-100 opacity-90 font-medium">
                                    Kế hoạch năm {plan.year} | Mã: {plan.planCode}
                                </DialogDescription>
                            </div>
                            <Badge className={`${STATUS_COLORS[plan.status]} border font-bold px-3 py-1 shadow-sm`}>
                                {getStatusLabel(plan)}
                            </Badge>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100/50 flex flex-col items-center text-center">
                            <DollarSign className="w-5 h-5 text-green-600 mb-2" />
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tổng ngân sách</span>
                            <span className="text-lg font-bold text-green-700">
                                {formatVND(plan.totalBudget)}
                            </span>
                        </div>
                        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50 flex flex-col items-center text-center">
                            <TrendingUp className="w-5 h-5 text-purple-600 mb-2" />
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Năm thực hiện</span>
                            <span className="text-xl font-bold text-[#0F4C75]">{plan.year}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Timeframe section */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Thời gian triển khai
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <span className="text-sm text-gray-500">Ngày bắt đầu</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {format(new Date(plan.startDate), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <span className="text-sm text-gray-500">Ngày kết thúc</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {format(new Date(plan.endDate), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Creation Info */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> Thông tin khởi tạo
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <span className="text-sm text-gray-500">Người tạo</span>
                                    <span className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">
                                        {plan.createdBy}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                                    <span className="text-sm text-gray-500">Ngày tạo</span>
                                    <span className="text-sm font-semibold text-gray-900">
                                        {format(new Date(plan.createdAt), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description or Review Note */}
                    <div className="space-y-3 pt-2">
                        {plan.reviewNote ? (
                           <>
                                <h3 className="text-[11px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2">
                                    <Info className="w-3.5 h-3.5" /> {getReviewNoteHeading(plan.reviewNote)}
                                </h3>
                                <div className="text-sm text-orange-800 leading-relaxed bg-orange-50 p-4 rounded-2xl border border-orange-100 min-h-[80px]">
                                    {getDisplayReviewNote(plan.reviewNote)}
                                </div>
                           </>
                        ) : (
                            <>
                                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <ClipboardList className="w-3.5 h-3.5" /> Mô tả chi tiết
                                </h3>
                                <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 min-h-[80px]">
                                    {plan.description || 'Không có mô tả chi tiết cho kế hoạch này.'}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Danh sách Request */}
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5" /> Các yêu cầu đào tạo ({detailData?.trainingRequests?.length || 0})
                        </h3>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {isLoading ? (
                                <div className="p-8 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin text-[#3282B8]" />
                                    Đang tải dữ liệu...
                                </div>
                            ) : !detailData?.trainingRequests || detailData.trainingRequests.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-500 italic">
                                    Không có yêu cầu đào tạo nào.
                                </div>
                            ) : (
                                <div className="max-h-[250px] overflow-y-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 border-b">
                                            <tr>
                                                <th className="px-4 py-3 font-semibold">Người yêu cầu</th>
                                                <th className="px-4 py-3 font-semibold">Chủ đề</th>
                                                <th className="px-4 py-3 font-semibold text-right">Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {detailData.trainingRequests.map((req) => (
                                                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-gray-900">{req.requestedByName}</td>
                                                    <td className="px-4 py-3 text-gray-600 line-clamp-1 truncate max-w-[300px]" title={req.subject}>{req.subject}</td>
                                                    <td className="px-4 py-3 font-medium text-right">
                                                        <Badge variant="outline" className="bg-white">{req.status}</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
                    <Button 
                        variant="secondary" 
                        onClick={() => onOpenChange(false)}
                        className="bg-white border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold px-6 rounded-xl"
                    >
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
