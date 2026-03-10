'use client';

import { 
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    DollarSign, BookOpen, Clock, User, ClipboardList, Info, BarChart3, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { TrainingPlan } from '../../types/training-plan-types';

interface TrainingPlanDetailProps {
    plan: TrainingPlan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800 border-gray-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Active: 'bg-blue-100 text-blue-800 border-blue-200',
    Completed: 'bg-purple-100 text-purple-800 border-purple-200',
};

const STATUS_LABELS: Record<string, string> = {
    Draft: 'Bản nháp',
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Active: 'Đang triển khai',
    Completed: 'Đã hoàn thành',
};

export function TrainingPlanDetail({ plan, open, onOpenChange }: TrainingPlanDetailProps) {
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
                                {STATUS_LABELS[plan.status] || plan.status}
                            </Badge>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex flex-col items-center text-center">
                            <BookOpen className="w-5 h-5 text-blue-600 mb-2" />
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tổng khóa học</span>
                            <span className="text-xl font-bold text-[#0F4C75]">{plan.totalCourses}</span>
                        </div>
                        <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100/50 flex flex-col items-center text-center">
                            <DollarSign className="w-5 h-5 text-green-600 mb-2" />
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Tổng ngân sách</span>
                            <span className="text-lg font-bold text-green-700">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}
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

                    {/* Description */}
                    <div className="space-y-3 pt-2">
                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <ClipboardList className="w-3.5 h-3.5" /> Mô tả chi tiết
                        </h3>
                        <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100 min-h-[80px]">
                            {plan.description || 'Không có mô tả chi tiết cho kế hoạch này.'}
                        </div>
                    </div>

                    {/* Review Note if exists */}
                    {plan.reviewNote && (
                        <div className="mt-4 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
                            <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-orange-500 uppercase">Ghi chú phê duyệt</span>
                                <p className="text-sm text-orange-800">{plan.reviewNote}</p>
                            </div>
                        </div>
                    )}
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
