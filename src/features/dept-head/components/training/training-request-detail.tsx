'use client';

import { 
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, Users, DollarSign, Target, AlignLeft, Calendar, User, Building2, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { TrainingRequest } from '../../types/training-types';
import { formatVND } from '@/lib/utils';

interface TrainingRequestDetailProps {
    request: TrainingRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const URGENCIES: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    Normal: { label: 'Bình thường', color: 'bg-blue-100 text-blue-800', icon: Clock },
    High: { label: 'Cao', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
    Urgent: { label: 'Khẩn cấp', color: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const STATUSES: Record<string, { label: string; color: string }> = {
    Pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    Approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-800 border-green-200' },
    Rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-800 border-red-200' },
    Planned: { label: 'Đã lập kế hoạch', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    AddedToPlan: { label: 'Đã thêm vào KH', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
};

export function TrainingRequestDetail({ request, open, onOpenChange }: TrainingRequestDetailProps) {
    if (!request) return null;

    const urgency = URGENCIES[request.urgency] || URGENCIES.Normal;
    const status = STATUSES[request.status] || { label: request.status, color: 'bg-gray-100 text-gray-800 border-gray-200' };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0F4C75] to-[#3282B8] px-6 py-8 text-white">
                    <DialogHeader>
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold">Chi tiết yêu cầu đào tạo</DialogTitle>
                                <DialogDescription className="text-blue-100 opacity-90">
                                    Mã yêu cầu: #{request.id.substring(0, 8)}
                                </DialogDescription>
                            </div>
                            <Badge className={`${status.color} border font-bold px-3 py-1 shadow-sm`}>
                                {status.label}
                            </Badge>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* Subject Section */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Target className="w-4 h-4" /> Chủ đề đào tạo
                        </h3>
                        <p className="text-lg font-semibold text-[#0F4C75] leading-snug">
                            {request.subject}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Info Items */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" /> Người yêu cầu
                                </span>
                                <p className="text-sm font-semibold text-gray-900">{request.requestedByName}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" /> Phòng ban
                                </span>
                                <p className="text-sm font-semibold text-gray-900">{request.departmentName}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Ngày gửi
                                </span>
                                <p className="text-sm font-semibold text-gray-900">
                                    {format(new Date(request.createdAt), 'dd/MM/yyyy')}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                    <urgency.icon className="w-3.5 h-3.5" /> Mức độ ưu tiên
                                </span>
                                <Badge className={`${urgency.color} font-medium border-0`}>
                                    {urgency.label}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" /> Học viên dự kiến
                                </span>
                                <p className="text-sm font-semibold text-gray-900">{request.estimatedParticipants} nhân viên</p>
                            </div>
                        </div>
                    </div>

                    {/* Target Audience */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Users className="w-4 h-4" /> Đối tượng đào tạo
                        </h3>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            {request.targetAudience || 'Chưa xác định đối tượng cụ thể.'}
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <AlignLeft className="w-4 h-4" /> Mục tiêu & Nội dung
                        </h3>
                        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                            {request.description || 'Không có mô tả chi tiết cho yêu cầu này.'}
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-gray-50 border-t">
                    <Button 
                        variant="secondary" 
                        onClick={() => onOpenChange(false)}
                        className="bg-white border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold px-6"
                    >
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
