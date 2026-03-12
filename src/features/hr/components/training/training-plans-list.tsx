'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Search, MoreHorizontal, Eye, BookOpen } from 'lucide-react';
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
import { hrTrainingService } from '../../api/hr-training-service';
import { TrainingPlan } from '../../types/training-plan-types';
import { useRouter } from 'next/navigation';
import { TrainingPlanDetail } from './training-plan-detail';

const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
    Draft: 'Bản nháp',
    Pending: 'Chờ duyệt',
    Approved: 'Đã duyệt',
    Rejected: 'Từ chối',
};

export function TrainingPlansList({ initialData }: { initialData?: { items: TrainingPlan[] } }) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);

    const { data, isLoading } = useSWR<{ items: TrainingPlan[] }>(
        ['/api/TrainingPlan', debouncedSearch],
        () => hrTrainingService.getPlans({ search: debouncedSearch }),
        { fallbackData: initialData }
    );

    const plans = data?.items || [];
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Kế hoạch đào tạo năm</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Quản lý các kế hoạch đào tạo tổng thể của doanh nghiệp
                    </p>
                </div>
                <Button 
                    onClick={() => router.push('/enterprise/hr/training/requests')}
                    className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white shadow-lg shadow-blue-900/10 transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" /> Tổng hợp & Lập kế hoạch
                </Button>
            </div>

            <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm kế hoạch..."
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
                            <TableHead className="font-bold text-[#0F4C75]">Tên kế hoạch</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Năm</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Số khóa học</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Tổng ngân sách</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Ngày tạo</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Trạng thái</TableHead>
                            <TableHead className="text-right font-bold text-[#0F4C75]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : plans?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-gray-400 italic">
                                    Chưa có kế hoạch đào tạo nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            plans?.map((plan: TrainingPlan) => (
                                <TableRow key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-blue-500" />
                                            {plan.planName}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0">
                                            {plan.year}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {plan.totalCourses} khóa học
                                    </TableCell>
                                    <TableCell className="text-gray-900 font-semibold">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {format(new Date(plan.createdAt), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`border-0 font-semibold px-2.5 py-0.5 ${STATUS_COLORS[plan.status] || 'bg-gray-100'}`}>
                                            {STATUS_LABELS[plan.status] || plan.status}
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
                                                        setSelectedPlan(plan);
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

            <TrainingPlanDetail
                plan={selectedPlan}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </div>
    );
}
