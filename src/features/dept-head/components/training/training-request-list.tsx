'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { LucideIcon, Plus, Search, MoreHorizontal, Eye, Clock, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TrainingRequestForm } from './training-request-form';
import { trainingService } from '../../api/training-service';
import type { TrainingRequestsResult } from '../../types/training-types';

const URGENCY_ICONS: Record<string, LucideIcon> = {
    Normal: Info,
    High: AlertTriangle,
    Urgent: AlertCircle,
};

const URGENCY_COLORS: Record<string, string> = {
    Normal: 'text-blue-500',
    High: 'text-orange-500',
    Urgent: 'text-red-600',
};

const STATUS_COLORS: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Rejected: 'Từ chối',
};

import { TrainingRequestDetail } from './training-request-detail';
import { TrainingRequest } from '../../types/training-types';

export function TrainingRequestList({ initialData }: { initialData?: TrainingRequestsResult }) {
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const debouncedSearch = useDebouncedValue(search, 300);

    const { data, isLoading, mutate } = useSWR<TrainingRequestsResult>(
        ['/api/TrainingRequest', debouncedSearch],
        () => trainingService.getRequests({ search: debouncedSearch }),
        { fallbackData: initialData }
    );

    const renderUrgency = (urgency: string) => {
        const Icon = URGENCY_ICONS[urgency] || Info;
        const colorClass = URGENCY_COLORS[urgency] || 'text-gray-500';
        
        let label = 'Bình thường';
        if (urgency === 'High') label = 'Cao';
        if (urgency === 'Urgent') label = 'Khẩn cấp';

        return (
            <div className={`flex items-center gap-1.5 font-medium ${colorClass}`}>
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Yêu cầu đào tạo</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Theo dõi và quản lý các yêu cầu đào tạo của phòng ban (Bản mô phỏng)
                    </p>
                </div>
                <Button 
                    onClick={() => setIsCreateOpen(true)} 
                    className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.02]"
                >
                    <Plus className="mr-2 h-4 w-4" /> Gửi yêu cầu mới
                </Button>
            </div>

            <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm theo chủ đề..."
                        className="pl-10 border-gray-200 focus:border-[#3282B8]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-bold text-[#0F4C75]">Chủ đề đào tạo</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Mức độ ưu tiên</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Dự kiến</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Ngân sách</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Ngày gửi</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Trạng thái</TableHead>
                            <TableHead className="text-right font-bold text-[#0F4C75]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                        <span className="text-sm text-gray-500">Đang tải dữ liệu...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : data?.items?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-400 italic">
                                    Chưa có yêu cầu đào tạo nào được gửi
                                </TableCell>
                            </TableRow>
                        ) : (
                            data?.items?.map((request) => (
                                <TableRow key={request.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium text-gray-900 max-w-[250px] truncate">
                                        {request.subject}
                                    </TableCell>
                                    <TableCell>
                                        {renderUrgency(request.urgency)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <Clock className="w-3.5 h-3.5" />
                                            {request.estimatedParticipants || 0} học viên
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {request.estimatedBudget 
                                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(request.estimatedBudget)
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {format(new Date(request.createdAt), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`border-0 font-semibold px-2.5 py-0.5 ${STATUS_COLORS[request.status] || 'bg-gray-100'}`}>
                                            {STATUS_LABELS[request.status] || request.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                <DropdownMenuItem 
                                                    className="cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setIsDetailOpen(true);
                                                    }}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <TrainingRequestForm
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={() => mutate()}
            />

            <TrainingRequestDetail
                request={selectedRequest}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </div>
    );
}
