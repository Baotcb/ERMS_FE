'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { LucideIcon, Plus, Search, MoreHorizontal, Eye, Clock, AlertTriangle, AlertCircle, Info, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

const PAGE_SIZE = 7;

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
    AddedToPlan: 'bg-blue-100 text-blue-800',
};

const STATUS_LABELS: Record<string, string> = {
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Rejected: 'Từ chối',
    AddedToPlan: 'Đã thêm vào KH',
};

import { TrainingRequestDetail } from './training-request-detail';
import { TrainingRequest } from '../../types/training-types';

export function TrainingRequestList({ initialData }: { initialData?: TrainingRequestsResult }) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TrainingRequest | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const debouncedSearch = useDebouncedValue(search, 300);

    const { data, isLoading, mutate } = useSWR<TrainingRequestsResult>(
        ['/api/TrainingRequest', debouncedSearch, page],
        () => trainingService.getRequests({ search: debouncedSearch, page, pageSize: PAGE_SIZE }),
        { fallbackData: initialData }
    );

    const requests = data?.items || [];
    const totalPages = data?.totalPages ?? 1;
    const totalCount = data?.totalCount ?? requests.length;

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

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
                        Theo dõi và quản lý các yêu cầu đào tạo của phòng ban ({totalCount} yêu cầu)
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => router.push('/enterprise/dept-head/training/plans')}
                        className="border-[#0F4C75] text-[#0F4C75] hover:bg-blue-50"
                    >
                        <ArrowRight className="mr-2 h-4 w-4" /> Kế hoạch đào tạo
                    </Button>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white shadow-lg shadow-blue-900/10 transition-all hover:scale-[1.02]"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Gửi yêu cầu mới
                    </Button>
                </div>
            </div>

            {data?.items?.some((r) => r.status === 'AddedToPlan') && (
                <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-[#0F4C75]">
                    <ArrowRight className="h-5 w-5 shrink-0 text-blue-500" />
                    <span className="flex-1">
                        Một số yêu cầu của bạn đã được thêm vào kế hoạch đào tạo và được Giám đốc phê duyệt.
                        Hãy vào <strong>Kế hoạch đào tạo</strong> để xem khóa học HR đã khởi tạo và phân công trainer, trainee.
                    </span>
                    <Button
                        size="sm"
                        onClick={() => router.push('/enterprise/dept-head/training/plans')}
                        className="shrink-0 bg-[#0F4C75] text-white hover:bg-[#1A5F8C]"
                    >
                        Xem kế hoạch
                    </Button>
                </div>
            )}

            <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm yêu cầu..."
                        className="pl-10 border-gray-200 focus:border-[#3282B8]"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

<<<<<<< HEAD
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-bold text-[#0F4C75]">Chủ đề đào tạo</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Mức độ ưu tiên</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">SL Dự kiến</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Ngân sách</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Ngày gửi</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Trạng thái</TableHead>
                            <TableHead className="text-right font-bold text-[#0F4C75]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
=======
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[420px]">
                <div className="flex-1 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50">
>>>>>>> dev
                            <TableRow>
                                <TableHead className="font-bold text-[#0F4C75]">Chủ đề</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Phòng ban</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Mức độ</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Dự kiến</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Ngân sách</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Ngày tạo</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Trạng thái</TableHead>
                                <TableHead className="text-right font-bold text-[#0F4C75]">Thao tác</TableHead>
                            </TableRow>
<<<<<<< HEAD
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                                        Đang tải dữ liệu...
=======
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
>>>>>>> 17f611a01f129ea84d94a3a291154f47af9f1b4c
                                    </TableCell>
                                </TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-12 text-gray-400 italic">
                                        Chưa có yêu cầu đào tạo nào
                                    </TableCell>
                                </TableRow>
                            ) : (
                                requests.map((request) => (
                                    <TableRow key={request.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-medium text-gray-900 max-w-[220px]">
                                            <p className="line-clamp-2">{request.subject}</p>
                                        </TableCell>
                                        <TableCell className="text-gray-700">{request.departmentName}</TableCell>
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
