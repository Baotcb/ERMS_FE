'use client';

import { useState } from 'react';
import { Search, BookOpen, Eye } from 'lucide-react';
import { format } from 'date-fns';

import { courseService } from '@/features/hr/api/course-service';
import type { Course, CourseResult } from '@/features/hr/types/course-types';

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

import { STATUS_COLORS } from '@/features/hr/utils/training-status-utils';
import { usePaginatedList } from '@/hooks/use-paginated-list';
import { TablePagination } from '@/components/common/table-pagination';


function getDeploymentLabel(course: Course): string {
    const hasTrainer = Boolean(course.trainerEmail?.trim());
    const hasTrainees = (course.enrollmentCount || 0) > 0;
    const hasSchedule = Boolean(course.description?.includes('Lịch trình:'));

    if ((course.status === 'Public' || course.status === 'Published')) {
        return 'Đã mở khóa';
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

export function DeptHeadAvailableCoursesList({ initialData }: { initialData?: CourseResult }) {
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const {
        items: courses, totalCount, totalPages, page, setPage,
        search, handleSearch, isLoading,
    } = usePaginatedList({
        key: ['/api/Course', 'dept-head-available-courses'],
        fetcher: (params) => courseService.getAllCourses({ ...params, status: 'Published' }),
        initialData,
        extraParams: { status: 'Published' },
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Khóa học khả dụng</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Danh sách các khóa học trong công ty ({totalCount} khóa học)
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
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[420px]">
                <div className="flex-1 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="font-bold text-[#0F4C75]">Khóa học</TableHead>
                                <TableHead className="font-bold text-[#0F4C75]">Giảng viên</TableHead>
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
                                    <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-gray-400 italic">
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
                                        <TableCell className="text-gray-700">{course.trainerName || course.trainerEmail || 'Chưa gán'}</TableCell>
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

                {/* Pagination */}
                <TablePagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#0F4C75]">Chi tiết khóa học</DialogTitle>
                        <DialogDescription>
                            Thông tin tổng quan của khóa học trong công ty
                        </DialogDescription>
                    </DialogHeader>

                    {selectedCourse && (() => {
                        const raw = selectedCourse.description || '';
                        const lines = raw.split('\n');
                        let desc = '';
                        let schedule = null as { start: string; end: string } | null;
                        let location = null as string | null;

                        for (const line of lines) {
                            const m = line.match(/(?:\[DRAFT\] )?Lịch trình:\s*(.+?)\s*đến\s*(.+?)\.\s*Địa điểm:\s*(.+)/i);
                            if (m) { schedule = { start: m[1], end: m[2] }; location = m[3].trim(); continue; }
                            if (line.match(/Thông báo:\s*giangvien_khi_phancong/i)) continue;
                            if (line.trim()) desc += (desc ? '\n' : '') + line.trim();
                        }

                        return (
                            <div className="space-y-5">
                                {/* Header */}
                                <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center text-white shrink-0">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-[#0F4C75] leading-tight">{selectedCourse.courseName}</h3>
                                        <p className="text-sm text-gray-500">{selectedCourse.courseCode}</p>
                                    </div>
                                    <Badge variant="outline" className={`border-0 font-semibold px-2.5 py-0.5 shrink-0 ${STATUS_COLORS[selectedCourse.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {getDeploymentLabel(selectedCourse)}
                                    </Badge>
                                </div>

                                {/* Info grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Giảng viên', value: selectedCourse.trainerName || selectedCourse.trainerEmail || 'Chưa gán', icon: '👨‍🏫' },
                                        { label: 'Thời lượng', value: `${selectedCourse.durationMinutes || 0} phút`, icon: '⏱️' },
                                        { label: 'Bài học', value: String(selectedCourse.lessonCount || 0), icon: '📚' },
                                        { label: 'Học viên', value: String(selectedCourse.enrollmentCount || 0), icon: '👥' },
                                    ].map(({ label, value, icon }) => (
                                        <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                                            <div className="text-lg mb-0.5">{icon}</div>
                                            <p className="text-sm font-bold text-gray-800">{value}</p>
                                            <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Schedule */}
                                {(schedule || location) && (
                                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">🏢 Lịch trình</p>
                                        {schedule && (
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <span>🗓️</span>
                                                <span>{schedule.start} → {schedule.end}</span>
                                            </div>
                                        )}
                                        {location && (
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                                <span>📍</span>
                                                <span>{location}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Description */}
                                {desc && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Mô tả</p>
                                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{desc}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </div>
    );
}
