'use client';

import { useMemo, useState } from 'react';
import { BarChart3, BookOpenCheck, Filter, GraduationCap, Search, Trophy } from 'lucide-react';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { DepartmentTrainingResultItem } from '../../api/dept-head-service';

function getEvaluationBadge(status: DepartmentTrainingResultItem['evaluationStatus']) {
    switch (status) {
        case 'Passed':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'Failed':
            return 'bg-red-100 text-red-700 border-red-200';
        default:
            return 'bg-amber-100 text-amber-700 border-amber-200';
    }
}

function getLearningBadge(status: DepartmentTrainingResultItem['learningStatus']) {
    switch (status) {
        case 'Completed':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'InProgress':
            return 'bg-violet-100 text-violet-700 border-violet-200';
        default:
            return 'bg-slate-100 text-slate-700 border-slate-200';
    }
}

export function TrainingResultsTrackingPage({ initialData }: { initialData: DepartmentTrainingResultItem[] }) {
    const [search, setSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [evaluationFilter, setEvaluationFilter] = useState('all');

    const courseOptions = useMemo(
        () => Array.from(new Set(initialData.map((item) => item.courseName))),
        [initialData]
    );

    const filteredItems = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return initialData.filter((item) => {
            const matchesSearch = !normalizedSearch || [item.employeeName, item.employeeEmail, item.departmentName, item.courseName]
                .some((value) => value.toLowerCase().includes(normalizedSearch));
            const matchesCourse = courseFilter === 'all' || item.courseName === courseFilter;
            const matchesEvaluation = evaluationFilter === 'all' || item.evaluationStatus === evaluationFilter;

            return matchesSearch && matchesCourse && matchesEvaluation;
        });
    }, [courseFilter, evaluationFilter, initialData, search]);

    const summary = useMemo(() => {
        const passed = filteredItems.filter((item) => item.evaluationStatus === 'Passed').length;
        const failed = filteredItems.filter((item) => item.evaluationStatus === 'Failed').length;
        const inProgress = filteredItems.filter((item) => item.learningStatus === 'InProgress').length;

        return {
            total: filteredItems.length,
            passed,
            failed,
            inProgress,
        };
    }, [filteredItems]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F4C75]">Theo dõi kết quả đào tạo</h1>
                    <p className="text-sm text-gray-500">Theo dõi tiến độ học và trạng thái đạt/không đạt của thành viên phòng ban đã được cử đi học.</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 max-w-2xl">
                    Dữ liệu chi tiết theo từng học viên hiện đang dùng fallback UI vì backend chưa có endpoint tracking kết quả đào tạo theo phòng ban. Khi BE bổ sung query, màn này chỉ cần thay source dữ liệu.
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-[#0F4C75] mb-3"><GraduationCap className="w-5 h-5" /> Tổng lượt cử đi học</div>
                    <p className="text-3xl font-bold text-[#0F4C75]">{summary.total}</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-green-700 mb-3"><Trophy className="w-5 h-5" /> Đạt quiz cuối khóa</div>
                    <p className="text-3xl font-bold text-green-700">{summary.passed}</p>
                </div>
                <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-red-700 mb-3"><BarChart3 className="w-5 h-5" /> Chưa đạt</div>
                    <p className="text-3xl font-bold text-red-700">{summary.failed}</p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-violet-700 mb-3"><BookOpenCheck className="w-5 h-5" /> Đang học</div>
                    <p className="text-3xl font-bold text-violet-700">{summary.inProgress}</p>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[#0F4C75] font-semibold"><Filter className="w-4 h-4" /> Bộ lọc kết quả</div>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo nhân viên, email, khóa học..." className="pl-9" />
                    </div>
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Chọn khóa học" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả khóa học</SelectItem>
                            {courseOptions.map((courseName) => (
                                <SelectItem key={courseName} value={courseName}>{courseName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={evaluationFilter} onValueChange={setEvaluationFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Kết quả đánh giá" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả trạng thái</SelectItem>
                            <SelectItem value="Passed">Đạt</SelectItem>
                            <SelectItem value="Failed">Không đạt</SelectItem>
                            <SelectItem value="Pending">Chờ đánh giá</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => {
                        setSearch('');
                        setCourseFilter('all');
                        setEvaluationFilter('all');
                    }}>Xóa lọc</Button>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Nhân viên</TableHead>
                            <TableHead>Khóa học</TableHead>
                            <TableHead>Tiến độ</TableHead>
                            <TableHead>Quiz</TableHead>
                            <TableHead>Trạng thái học</TableHead>
                            <TableHead>Kết quả</TableHead>
                            <TableHead>Ghi chú</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-10 text-center text-sm text-gray-500">Không có dữ liệu phù hợp với bộ lọc hiện tại.</TableCell>
                            </TableRow>
                        ) : filteredItems.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-semibold text-gray-800">{item.employeeName}</div>
                                        <div className="text-xs text-gray-500">{item.employeeEmail}</div>
                                        <div className="text-xs text-gray-400">{item.departmentName}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="font-medium text-gray-800">{item.courseName}</div>
                                        <div className="text-xs text-gray-500">Cử đi học: {format(new Date(item.assignedAt), 'dd/MM/yyyy')}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="min-w-[180px]">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Hoàn thành bài học</span>
                                            <span>{item.progressPercentage}%</span>
                                        </div>
                                        <Progress value={item.progressPercentage} className="h-2" />
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {item.quizScore !== null ? (
                                        <span className="font-bold text-[#0F4C75]">{item.quizScore}%</span>
                                    ) : (
                                        <span className="text-sm text-gray-400">Chưa có</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getLearningBadge(item.learningStatus)}>{item.learningStatus}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getEvaluationBadge(item.evaluationStatus)}>{item.evaluationStatus}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 max-w-[280px]">{item.note || '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}