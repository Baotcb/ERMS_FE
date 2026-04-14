'use client';

import { useMemo, useState } from 'react';
import {
    Clock, Users, ArrowRight, CheckCircle2, Search, GraduationCap, CalendarDays,
    BookOpen, Layers, Send, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/features/core/auth/hooks/use-auth';
import { Course } from '@/features/hr/types/course-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { isCourseOwnedByUser } from '@/features/hr/utils/course-workflow';

/* ── Step config ── */
const STEPS = [
    { key: 1, label: 'Thiết lập nội dung', cta: 'Thiết lập nội dung', icon: BookOpen },
    { key: 2, label: 'Tạo bài kiểm tra', cta: 'Tạo quiz cuối khóa', icon: Layers },
    { key: 3, label: 'Hoàn thành', cta: 'Xem chi tiết', icon: CheckCircle2 },
] as const;

function getStatusStep(course: Course): number {
    if (course.status === 'Public') return 3;
    if (course.description && course.durationMinutes) return 2;
    return 1;
}

/* ── Stepper dots ── */
function StepperDots({ current }: { current: number }) {
    return (
        <div className="flex items-center gap-1">
            {STEPS.map(({ key }, i) => (
                <div key={key} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        current >= key
                            ? current === 3 ? 'bg-green-500' : 'bg-[#3282B8]'
                            : 'bg-gray-200'
                    }`} />
                    {i < STEPS.length - 1 && (
                        <div className={`w-4 h-0.5 ${current > key ? current === 3 ? 'bg-green-300' : 'bg-[#BBE1FA]' : 'bg-gray-100'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export function TeachingTasksPage({
    teachingBasePath = '/enterprise/employee/teaching',
    initialCourses = [],
}: {
    teachingBasePath?: string;
    initialCourses?: Course[];
}) {
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'public'>('all');
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 6;

    const courses = useMemo(() => {
        if (!user) {
            return [];
        }

        const normalizedSearch = search.trim().toLowerCase();

        return initialCourses.filter((course) => {
            const matchesOwnership = isCourseOwnedByUser(course, user, user.role);

            if (!matchesOwnership) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            return (
                course.courseName.toLowerCase().includes(normalizedSearch) ||
                course.courseCode.toLowerCase().includes(normalizedSearch) ||
                (course.description || '').toLowerCase().includes(normalizedSearch)
            );
        }).filter(course => {
            if (statusFilter === 'all') return true;
            if (statusFilter === 'public') return course.status === 'Public';
            return course.status !== 'Public';
        });
    }, [initialCourses, search, user, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
    const paginatedCourses = courses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleStatusFilter = (key: 'all' | 'draft' | 'public') => {
        setStatusFilter(key);
        setPage(1);
    };

    const stats = useMemo(() => {
        const all = initialCourses.filter(c => user ? isCourseOwnedByUser(c, user, user.role) : false);
        const published = all.filter(c => c.status === 'Public' || c.status === 'Published').length;
        const draft = all.length - published;
        const totalEnroll = all.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0);
        return { total: all.length, published, draft, totalEnroll };
    }, [initialCourses, user]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4C75] via-[#1B262C] to-[#0F4C75] p-8 md:p-10 text-white">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#3282B8]/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#BBE1FA]/5 rounded-full translate-y-1/3 -translate-x-1/4" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#BBE1FA]/70">Quản lý giảng dạy</p>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                            Xin chào, {user?.fullName?.split(' ').pop() || 'Giảng viên'} 👋
                        </h1>
                        <p className="text-[#BBE1FA]/80 text-sm">Quản lý các khóa đào tạo được phân công cho bạn.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {[
                            { label: 'Tổng khóa', value: stats.total, color: 'text-[#BBE1FA]' },
                            { label: 'Đang xử lý', value: stats.draft, color: 'text-amber-300' },
                            { label: 'Hoàn thành', value: stats.published, color: 'text-green-300' },
                            { label: 'Học viên', value: stats.totalEnroll, color: 'text-[#BBE1FA]' },
                        ].map(({ label, value, color }) => (
                            <div key={label} className="bg-white/10 backdrop-blur rounded-2xl px-5 py-3 text-center min-w-[80px] border border-white/10">
                                <p className={`text-2xl font-black ${color}`}>{value}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#BBE1FA]/60">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Search + Filter ── */}
            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Tìm khóa học theo tên hoặc mã..."
                        className="pl-12 h-12 rounded-2xl border-gray-200 bg-white shadow-sm text-sm focus:border-[#3282B8] focus:ring-[#3282B8]/20"
                    />
                </div>
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1 shrink-0">
                    {[
                        { key: 'all' as const, label: 'Tất cả' },
                        { key: 'draft' as const, label: 'Đang thiết lập' },
                        { key: 'public' as const, label: 'Hoàn thành' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => handleStatusFilter(key)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                statusFilter === key ? 'bg-white text-[#0F4C75] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Course Grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCourses.length === 0 ? (
                    <div className="col-span-full rounded-3xl border-2 border-dashed border-gray-200 bg-white p-16 text-center space-y-4">
                        <div className="w-16 h-16 bg-[#BBE1FA]/30 rounded-full flex items-center justify-center mx-auto">
                            {search.trim() ? <Search className="w-7 h-7 text-[#3282B8]" /> : <GraduationCap className="w-7 h-7 text-[#3282B8]" />}
                        </div>
                        <p className="text-lg font-bold text-[#0F4C75]">
                            {search.trim() ? 'Không tìm thấy khóa học phù hợp' : teachingBasePath?.includes('hr') ? 'Không có khóa học nào từ Giảng viên ngoài' : 'Chưa có nhiệm vụ nào'}
                        </p>

                    </div>
                ) : (
                    paginatedCourses.map((course) => {
                        const currentStep = getStatusStep(course);
                        const stepConfig = STEPS[currentStep - 1];
                        const isPublished = course.status === 'Public' || course.status === 'Published';

                        return (
                            <div key={course.id} className="group rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-[#BBE1FA] transition-all duration-300 flex flex-col overflow-hidden">

                                {/* Top Strip */}
                                <div className={`h-1.5 ${isPublished ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-[#3282B8] to-[#0F4C75]'}`} />

                                {/* Card Body */}
                                <div className="p-6 flex-1 flex flex-col">

                                    {/* Header Row */}
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <Badge className="bg-[#BBE1FA]/30 text-[#0F4C75] border-0 font-bold text-xs px-3 py-1">
                                            {course.courseCode}
                                        </Badge>
                                        <Badge className={`border-0 font-semibold text-[10px] px-2.5 ${
                                            isPublished
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {isPublished ? '✓ Hoàn thành' : '◉ Đang xử lý'}
                                        </Badge>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-[#0F4C75] leading-snug line-clamp-2 group-hover:text-[#3282B8] transition-colors mb-3">
                                        {course.courseName}
                                    </h3>

                                    {/* Meta */}
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-medium mb-4">
                                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.durationMinutes || 0}p</span>
                                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.enrollmentCount || 0}</span>
                                        {course.startTime && (
                                            <span className="flex items-center gap-1">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {new Date(course.startTime).toLocaleDateString('vi-VN')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Step Progress */}
                                    <div className="flex items-center justify-between gap-3 mb-4">
                                        <div className="flex items-center gap-2">
                                            <StepperDots current={currentStep} />
                                            <span className="text-[11px] font-semibold text-gray-500">{stepConfig.label}</span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-auto pt-4 border-t border-gray-50">
                                        <Button
                                            className={`w-full rounded-xl py-5 font-bold flex items-center justify-center gap-2 transition-all ${
                                                isPublished
                                                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-100'
                                                    : 'bg-[#0F4C75] hover:bg-[#1B262C] text-white'
                                            }`}
                                            asChild
                                        >
                                            <a href={`${teachingBasePath}/course/${course.id}`}>
                                                {isPublished ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                                {stepConfig.cta}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {courses.length > PAGE_SIZE && (
                <div className="flex items-center justify-center gap-4 pt-2">
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
            )}
        </div>
    );
}
