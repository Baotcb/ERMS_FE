'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Search, BookOpen, Eye } from 'lucide-react';
import { format } from 'date-fns';

import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { courseService } from '@/features/hr/api/course-service';
import type { Course } from '@/features/hr/types/course-types';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

const STATUS_COLORS: Record<string, string> = {
    Published: 'bg-green-100 text-green-800',
    Draft: 'bg-gray-100 text-gray-800',
    Archived: 'bg-slate-100 text-slate-700',
};

const STATUS_LABELS: Record<string, string> = {
    Published: 'Khả dụng',
    Draft: 'Nháp',
    Archived: 'Lưu trữ',
};

function getDeploymentLabel(course: Course): string {
    const hasTrainer = Boolean(course.trainerId);
    const hasTrainees = (course.enrollmentCount || 0) > 0;
    const hasSchedule = Boolean(course.description?.includes('Lịch trình:'));

    if (course.status === 'Published') {
        return 'Đã xuất bản';
    }

    if (hasTrainer && hasTrainees && hasSchedule) {
        return 'Sẵn sàng triển khai';
    }

    if (hasTrainer && hasSchedule) {
        return 'Đã có lịch';
    }

    if (hasTrainer) {
        return 'Đã phân công';
    }

    return 'Khóa học nháp';
}

export function DeptHeadAvailableCoursesList({ initialData }: { initialData?: { items: Course[] } }) {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data, isLoading } = useSWR<{ items: Course[] }>(
        ['/api/Course', 'dept-head-available-courses', debouncedSearch],
        () => courseService.getAllCourses({ search: debouncedSearch, pageSize: 100 }),
        { fallbackData: initialData }
    );

    const courses = data?.items || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Khóa học khả dụng</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Danh sách các khóa học trong công ty, kèm trạng thái sẵn sàng triển khai
                    </p>
                </div>
            </div>

            <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm khóa học..."
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
                            <TableHead className="font-bold text-[#0F4C75]">Khóa học</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Giảng viên</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Cấp độ</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Bài học</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Học viên</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Ngày tạo</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Trạng thái</TableHead>
                            <TableHead className="text-right font-bold text-[#0F4C75]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-gray-400">
                                    Đang tải dữ liệu...
                                </TableCell>
                            </TableRow>
                        ) : courses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-gray-400 italic">
                                    Chưa có khóa học nào trong công ty
                                </TableCell>
                            </TableRow>
                        ) : (
                            courses.map((course) => (
                                <TableRow key={course.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell className="font-medium text-gray-900">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-4 h-4 text-blue-500" />
                                            <div>
                                                <div>{course.courseName}</div>
                                                <div className="text-xs text-gray-500">{course.courseCode}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-700">{course.trainerName || 'Chưa gán'}</TableCell>
                                    <TableCell className="text-gray-700">{course.level || 'N/A'}</TableCell>
                                    <TableCell className="text-gray-700">{course.lessonCount || 0}</TableCell>
                                    <TableCell className="text-gray-700">{course.enrollmentCount || 0}</TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {format(new Date(course.createdAt), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`border-0 font-semibold px-2.5 py-0.5 ${STATUS_COLORS[course.status] || 'bg-gray-100 text-gray-700'}`}
                                        >
                                            {getDeploymentLabel(course)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            className="h-8 px-2 text-[#0F4C75] hover:bg-blue-50"
                                            onClick={() => {
                                                setSelectedCourse(course);
                                                setIsDetailOpen(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-1" /> Xem
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#0F4C75]">Chi tiết khóa học</DialogTitle>
                        <DialogDescription>
                            Thông tin tổng quan của khóa học trong công ty
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCourse && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div><span className="font-semibold">Tên khóa học:</span> {selectedCourse.courseName}</div>
                            <div><span className="font-semibold">Mã khóa học:</span> {selectedCourse.courseCode}</div>
                            <div><span className="font-semibold">Giảng viên:</span> {selectedCourse.trainerName || 'Chưa gán'}</div>
                            <div><span className="font-semibold">Cấp độ:</span> {selectedCourse.level || 'N/A'}</div>
                            <div><span className="font-semibold">Thời lượng:</span> {selectedCourse.durationMinutes || 0} phút</div>
                            <div><span className="font-semibold">Số bài học:</span> {selectedCourse.lessonCount || 0}</div>
                            <div><span className="font-semibold">Số học viên:</span> {selectedCourse.enrollmentCount || 0}</div>
                            <div><span className="font-semibold">Trạng thái:</span> {getDeploymentLabel(selectedCourse)}</div>
                            <div className="md:col-span-2">
                                <span className="font-semibold">Mô tả:</span> {selectedCourse.description || 'Chưa có mô tả'}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
