'use client';

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { Search, BookOpen, Eye, Star, MessageSquare, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { courseService } from '@/features/hr/api/course-service';
import { feedbackService, type CourseFeedbackDto } from '@/features/employee/api/feedback-service';
import type { Course } from '@/features/hr/types/course-types';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';

// ── helpers ──
const STATUS_COLORS: Record<string, string> = {
    Published: 'bg-green-100 text-green-800',
    Draft: 'bg-gray-100 text-gray-800',
    Archived: 'bg-slate-100 text-slate-700',
};

function getDeploymentLabel(course: Course): string {
    const hasTrainer = Boolean(course.trainerEmail?.trim());
    const hasTrainees = (course.enrollmentCount || 0) > 0;
    const hasSchedule = Boolean(course.description?.includes('Lịch trình:'));
    if (course.status === 'Published') return 'Đã xuất bản';
    if (hasTrainer && hasTrainees && hasSchedule) return 'Sẵn sàng triển khai';
    if (hasTrainer && hasSchedule) return 'Đã có lịch';
    if (hasTrainer) return 'Đã phân công';
    return 'Khóa học nháp';
}

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
            ))}
            <span className="ml-1.5 text-sm font-bold text-gray-700">{rating}</span>
        </div>
    );
}

// ── main component ──
export default function HRCoursesPage() {
    const [activeTab, setActiveTab] = useState<'courses' | 'feedback'>('courses');
    const [feedbackCourseFilter, setFeedbackCourseFilter] = useState('all');

    return (
        <div className="space-y-5 max-w-7xl mx-auto">
            {/* Header + Tabs */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Quản lý khóa học</h1>
                    <p className="text-sm text-gray-500 mt-1">Danh sách khóa học và phản hồi từ học viên.</p>
                </div>
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'courses' ? 'bg-white text-[#0F4C75] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <BookOpen className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                        Khóa học
                    </button>
                    <button
                        onClick={() => setActiveTab('feedback')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'feedback' ? 'bg-white text-[#0F4C75] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <MessageSquare className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
                        Phản hồi
                    </button>
                </div>
            </div>

            {activeTab === 'courses' ? (
                <CoursesTab onSwitchToFeedback={(courseName) => {
                    setFeedbackCourseFilter(courseName);
                    setActiveTab('feedback');
                }} />
            ) : (
                <FeedbackTab initialCourseFilter={feedbackCourseFilter} onCourseFilterChange={setFeedbackCourseFilter} />
            )}
        </div>
    );
}

// ── parse raw description to extract clean parts ──
function parseCourseDescription(raw: string | undefined) {
    if (!raw) return { description: '', schedule: null, location: null };
    const lines = raw.split('\n');
    let description = '';
    let schedule = null as { start: string; end: string } | null;
    let location = null as string | null;

    for (const line of lines) {
        const scheduleMatch = line.match(/(?:\[DRAFT\] )?Lịch trình:\s*(.+?)\s*đến\s*(.+?)\.\s*Địa điểm:\s*(.+)/i);
        if (scheduleMatch) {
            schedule = { start: scheduleMatch[1], end: scheduleMatch[2] };
            location = scheduleMatch[3].trim();
            continue;
        }
        if (line.match(/Thông báo:\s*giangvien_khi_phancong/i)) continue;
        if (line.trim()) description += (description ? '\n' : '') + line.trim();
    }
    return { description, schedule, location };
}

// ── course detail dialog shared component ──
function CourseDetailContent({ course, onViewFeedback }: { course: Course; onViewFeedback?: (courseName: string) => void }) {
    const { description, schedule, location } = parseCourseDescription(course.description);
    const isOnline = course.isOnline !== false;

    return (
        <div className="space-y-5">
            {/* Course name header */}
            <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center text-white shrink-0">
                    <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#0F4C75] leading-tight">{course.courseName}</h3>
                    <p className="text-sm text-gray-500">{course.courseCode}</p>
                </div>
                <Badge variant="outline" className={`border-0 font-semibold px-2.5 py-0.5 shrink-0 ${STATUS_COLORS[course.status] || 'bg-gray-100 text-gray-700'}`}>
                    {getDeploymentLabel(course)}
                </Badge>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Giảng viên', value: course.trainerName || course.trainerEmail || 'Chưa gán', icon: '👨‍🏫' },
                    { label: 'Thời lượng', value: `${course.durationMinutes || 0} phút`, icon: '⏱️' },
                    { label: 'Bài học', value: String(course.lessonCount || 0), icon: '📚' },
                    { label: 'Học viên', value: String(course.enrollmentCount || 0), icon: '👥' },
                ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg mb-0.5">{icon}</div>
                        <p className="text-sm font-bold text-gray-800">{value}</p>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
                    </div>
                ))}
            </div>

            {/* Schedule & Location — only if present */}
            {(schedule || location) && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        {isOnline ? '📹 Online' : '🏢 Offline'} • Lịch trình
                    </p>
                    {schedule && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="font-medium">🗓️</span>
                            <span>{schedule.start} → {schedule.end}</span>
                        </div>
                    )}
                    {location && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="font-medium">📍</span>
                            <span>{location}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Description */}
            {description && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Mô tả</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
            )}

            {/* View Feedback button */}
            {onViewFeedback && course.status === 'Published' && (
                <Button
                    variant="outline"
                    className="w-full border-[#0F4C75] text-[#0F4C75] hover:bg-blue-50"
                    onClick={() => onViewFeedback(course.courseName)}
                >
                    <MessageSquare className="w-4 h-4 mr-2" /> Xem phản hồi của khóa học này
                </Button>
            )}
        </div>
    );
}

// ═══════════════════════ COURSES TAB ═══════════════════════
function CoursesTab({ onSwitchToFeedback }: { onSwitchToFeedback?: (courseName: string) => void }) {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebouncedValue(search, 300);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const { data, isLoading } = useSWR<{ items: Course[] }>(
        ['/api/Course', 'hr-courses', debouncedSearch],
        () => courseService.getAllCourses({ search: debouncedSearch, pageSize: 100 }),
    );

    const courses = data?.items || [];

    return (
        <>
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
                            <TableHead className="font-bold text-[#0F4C75]">Bài học</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Học viên</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Ngày tạo</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Trạng thái</TableHead>
                            <TableHead className="text-right font-bold text-[#0F4C75]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-12 text-gray-400">Đang tải dữ liệu...</TableCell></TableRow>
                        ) : courses.length === 0 ? (
                            <TableRow><TableCell colSpan={7} className="text-center py-12 text-gray-400 italic">Chưa có khóa học nào</TableCell></TableRow>
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
                                    <TableCell className="text-gray-500 text-sm">{format(new Date(course.createdAt), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={`border-0 font-semibold px-2.5 py-0.5 ${STATUS_COLORS[course.status] || 'bg-gray-100 text-gray-700'}`}>
                                            {getDeploymentLabel(course)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" className="h-8 px-2 text-[#0F4C75] hover:bg-blue-50" onClick={() => { setSelectedCourse(course); setIsDetailOpen(true); }}>
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
                        <DialogDescription>Thông tin tổng quan của khóa học trong công ty</DialogDescription>
                    </DialogHeader>
                    {selectedCourse && (
                        <CourseDetailContent
                            course={selectedCourse}
                            onViewFeedback={(courseName) => {
                                setIsDetailOpen(false);
                                onSwitchToFeedback?.(courseName);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

// ═══════════════════════ FEEDBACK TAB ═══════════════════════
function FeedbackTab({ initialCourseFilter = 'all', onCourseFilterChange }: { initialCourseFilter?: string; onCourseFilterChange?: (v: string) => void }) {
    const [feedbacks, setFeedbacks] = useState<CourseFeedbackDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState(initialCourseFilter);

    // Sync external filter changes
    useEffect(() => { setCourseFilter(initialCourseFilter); }, [initialCourseFilter]);

    const handleCourseFilterChange = (v: string) => {
        setCourseFilter(v);
        onCourseFilterChange?.(v);
    };

    useEffect(() => {
        feedbackService.getAllFeedbacks()
            .then(setFeedbacks)
            .catch(() => setFeedbacks([]))
            .finally(() => setLoading(false));
    }, []);

    const courseOptions = useMemo(() => Array.from(new Set(feedbacks.map((f) => f.courseName))), [feedbacks]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return feedbacks.filter((f) => {
            const matchSearch = !q || [f.employeeName, f.employeeEmail, f.courseName, f.trainerEmail, f.comment].some((v) => v?.toLowerCase().includes(q));
            const matchCourse = courseFilter === 'all' || f.courseName === courseFilter;
            return matchSearch && matchCourse;
        });
    }, [feedbacks, search, courseFilter]);

    const stats = useMemo(() => {
        if (filtered.length === 0) return { total: 0, avgCourse: 0, avgTrainer: 0 };
        const avgCourse = filtered.reduce((s, f) => s + f.courseRating, 0) / filtered.length;
        const avgTrainer = filtered.reduce((s, f) => s + f.trainerRating, 0) / filtered.length;
        return { total: filtered.length, avgCourse: +avgCourse.toFixed(1), avgTrainer: +avgTrainer.toFixed(1) };
    }, [filtered]);

    return (
        <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-[#0F4C75] mb-3"><MessageSquare className="w-5 h-5" /> Tổng đánh giá</div>
                    <p className="text-3xl font-bold text-[#0F4C75]">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-amber-700 mb-3"><Star className="w-5 h-5 fill-amber-400" /> Điểm TB khóa học</div>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-amber-700">{stats.avgCourse}</p>
                        <span className="text-sm text-amber-600">/5</span>
                    </div>
                </div>
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-blue-700 mb-3"><TrendingUp className="w-5 h-5" /> Điểm TB giảng viên</div>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-blue-700">{stats.avgTrainer}</p>
                        <span className="text-sm text-blue-600">/5</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr]">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên, email, khóa học, nhận xét..." className="pl-9" />
                    </div>
                    <Select value={courseFilter} onValueChange={handleCourseFilterChange}>
                        <SelectTrigger><SelectValue placeholder="Lọc theo khóa học" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả khóa học</SelectItem>
                            {courseOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Feedback Cards */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Đang tải dữ liệu...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Chưa có đánh giá nào.</div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((f) => (
                        <div key={f.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-blue-200 transition-colors">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900">{f.employeeName}</span>
                                        {f.isAnonymous && <Badge variant="outline" className="text-xs bg-gray-100">Ẩn danh</Badge>}
                                    </div>
                                    {f.employeeEmail && <p className="text-xs text-gray-500">{f.employeeEmail} • {f.departmentName}</p>}
                                    <p className="text-sm font-medium text-[#0F4C75]">{f.courseName} <span className="text-gray-400">({f.courseCode})</span></p>
                                    <p className="text-xs text-gray-400">Giảng viên: {f.trainerEmail}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Khóa học:</span> <StarDisplay rating={f.courseRating} />
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Giảng viên:</span> <StarDisplay rating={f.trainerRating} />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">{format(new Date(f.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                            </div>
                            {f.comment && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-sm text-gray-700 italic">&ldquo;{f.comment}&rdquo;</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
