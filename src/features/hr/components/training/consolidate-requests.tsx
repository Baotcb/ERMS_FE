'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { ChevronLeft, Save, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { hrTrainingService } from '../../api/hr-training-service';
import type { TrainingRequest } from '../../../dept-head/types/training-types';

export function ConsolidateRequests() {
    const router = useRouter();
    const { toast } = useToast();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [planName, setPlanName] = useState(`Kế hoạch đào tạo năm ${new Date().getFullYear() + 1}`);
    const [startDate, setStartDate] = useState(`${new Date().getFullYear() + 1}-01-01`);
    const [endDate, setEndDate] = useState(`${new Date().getFullYear() + 1}-12-31`);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, isLoading } = useSWR<{ items: TrainingRequest[] }>(
        '/api/TrainingRequest?status=Pending',
        () => hrTrainingService.getAllRequests({ status: 'Pending' })
    );

    const pendingRequests = data?.items || [];

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleCreatePlan = async () => {
        if (selectedIds.length === 0) {
            toast({
                title: 'Lỗi',
                description: 'Vui lòng chọn ít nhất một yêu cầu để lập kế hoạch.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await hrTrainingService.createPlan({
                planCode: `TP-${new Date().getFullYear() + 1}-${Math.floor(1000 + Math.random() * 9000)}`,
                planName,
                description: `Kế hoạch tổng hợp từ ${selectedIds.length} yêu cầu của các phòng ban.`,
                startDate: startDate,
                endDate: endDate,
                totalBudget: totalSelectedBudget,
                status: 'Pending',
                trainingRequestIds: selectedIds,
            });

            if (res.ok) {
                toast({
                    title: 'Thành công',
                    description: 'Đã tạo kế hoạch đào tạo năm và cập nhật trạng thái các yêu cầu.',
                });
                router.push('/enterprise/hr/training/plans');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể tạo kế hoạch.';
            toast({
                title: 'Lỗi',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalSelectedBudget = pendingRequests
        .filter((r: TrainingRequest) => selectedIds.includes(r.id))
        .reduce((sum: number, r: TrainingRequest) => sum + (r.estimatedBudget || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-[#0F4C75]">Tổng hợp & Lập kế hoạch</h2>
                    <p className="text-sm text-gray-500">Xem và chọn các yêu cầu từ phòng ban để đưa vào kế hoạch năm</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                                {pendingRequests.length} Yêu cầu đang chờ
                            </Badge>
                            <span className="text-sm text-gray-400">|</span>
                            <span className="text-sm font-medium text-gray-600">Đã chọn: {selectedIds.length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedIds(pendingRequests.map((r: TrainingRequest) => r.id))}>Chọn tất cả</Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>Bỏ chọn</Button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="w-[50px]"></TableHead>
                                    <TableHead className="font-bold text-[#0F4C75]">Phòng ban</TableHead>
                                    <TableHead className="font-bold text-[#0F4C75]">Chủ đề</TableHead>
                                    <TableHead className="font-bold text-[#0F4C75]">Ưu tiên</TableHead>
                                    <TableHead className="font-bold text-[#0F4C75]">Dự kiến</TableHead>
                                    <TableHead className="text-right font-bold text-[#0F4C75]">Ngân sách</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell></TableRow>
                                ) : pendingRequests.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-8 italic text-gray-400">Không có yêu cầu nào đang chờ xử lý</TableCell></TableRow>
                                ) : (
                                    pendingRequests.map((request: TrainingRequest) => (
                                        <TableRow key={request.id} className={selectedIds.includes(request.id) ? 'bg-blue-50/30' : ''}>
                                            <TableCell>
                                                <Checkbox 
                                                    checked={selectedIds.includes(request.id)}
                                                    onCheckedChange={() => toggleSelect(request.id)}
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">{request.departmentName}</TableCell>
                                            <TableCell>{request.subject}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={request.urgency === 'Urgent' ? 'bg-red-50 text-red-700 border-red-100' : ''}>
                                                    {request.urgency}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{request.estimatedParticipants} học viên</TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.estimatedBudget || 0)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Sidebar - Plan Summary */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="font-bold text-[#0F4C75] mb-4 flex items-center gap-2">
                             <Save className="w-4 h-4" /> Chi tiết kế hoạch mới
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên kế hoạch</label>
                                <Input 
                                    value={planName} 
                                    onChange={(e) => setPlanName(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Từ ngày</label>
                                    <Input 
                                        type="date"
                                        value={startDate} 
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đến ngày</label>
                                    <Input 
                                        type="date"
                                        value={endDate} 
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Số lượng khóa:</span>
                                    <span className="font-bold text-gray-700">{selectedIds.length}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tổng ngân sách:</span>
                                    <span className="font-bold text-[#0F4C75]">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalSelectedBudget)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <p>Các yêu cầu được chọn sẽ được chuyển sang trạng thái &quot;Đã duyệt&quot; và gán vào kế hoạch này.</p>
                            </div>

                            <Button 
                                className="w-full bg-[#0F4C75] hover:bg-[#1A5F8C] h-11"
                                disabled={selectedIds.length === 0 || isSubmitting}
                                onClick={handleCreatePlan}
                            >
                                {isSubmitting ? 'Đang xử lý...' : 'Lưu kế hoạch & Gửi duyệt'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
