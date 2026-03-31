'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpenCheck, Search, Clock, Users, GraduationCap, ArrowRight, BookOpen } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/features/hr/types/course-types';

interface LearnerCourseItem {
    course: Course;
    progressPercentage: number;
    quizUnlocked: boolean;
}

/* ── Gradient thumbnails based on course code hash ── */
const COURSE_GRADIENTS = [
    'from-[#0F4C75] to-[#3282B8]',
    'from-[#1B262C] to-[#0F4C75]',
    'from-[#3282B8] to-[#BBE1FA]',
    'from-[#0F4C75] via-[#3282B8] to-[#1B262C]',
    'from-[#1B262C] via-[#0F4C75] to-[#3282B8]',
    'from-[#3282B8] via-[#0F4C75] to-[#1B262C]',
];

function getGradient(code: string): string {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
        hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COURSE_GRADIENTS[Math.abs(hash) % COURSE_GRADIENTS.length];
}

/* ── Circular progress ring SVG ── */
function ProgressRing({ percent, size = 56, stroke = 4 }: { percent: number; size?: number; stroke?: number }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    const color = percent >= 100 ? '#22c55e' : '#3282B8';

    return (
        <svg width={size} height={size} className="shrink-0 -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={stroke} />
            <circle
                cx={size / 2} cy={size / 2} r={radius} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700"
            />
            <text
                x={size / 2} y={size / 2}
                textAnchor="middle" dominantBaseline="central"
                className="rotate-90 origin-center fill-current text-[11px] font-black"
                style={{ fill: color }}
            >
                {percent}%
            </text>
        </svg>
    );
}

export function LearningCoursesPage({
    initialCourses,
    learningBasePath = '/enterprise/employee/learning',
}: {
    initialCourses: LearnerCourseItem[];
    learningBasePath?: string;
}) {
    const [search, setSearch] = useState('');
    const [progressFilter, setProgressFilter] = useState<'all' | 'inProgress' | 'completed'>('all');

    const courses = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();
        if (!normalizedSearch) {
            return initialCourses;
        }

        return initialCourses.filter((item) => {
            const course = item.course;
            return (
                course.courseName.toLowerCase().includes(normalizedSearch) ||
                course.courseCode.toLowerCase().includes(normalizedSearch) ||
                (course.description || '').toLowerCase().includes(normalizedSearch)
            );
        }).filter(item => {
            if (progressFilter === 'all') return true;
            if (progressFilter === 'completed') return item.progressPercentage >= 100;
            return item.progressPercentage < 100;
        });
    }, [initialCourses, search, progressFilter]);

    const stats = useMemo(() => {
        const total = initialCourses.length;
        const completed = initialCourses.filter(c => c.progressPercentage >= 100).length;
        const inProgress = total - completed;
        return { total, completed, inProgress };
    }, [initialCourses]);

    const resumeCourse = useMemo(() => {
        const inProgress = initialCourses.filter(c => c.progressPercentage > 0 && c.progressPercentage < 100);
        if (inProgress.length > 0) {
            inProgress.sort((a, b) => b.progressPercentage - a.progressPercentage);
            return inProgress[0];
        }
        return null;
    }, [initialCourses]);

    return (
        <div className="space-y-8 max-w-7xl mx-auto">

            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4C75] via-[#1B262C] to-[#0F4C75] p-8 md:p-10 text-white">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#3282B8]/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#BBE1FA]/5 rounded-full translate-y-1/3 -translate-x-1/4" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#BBE1FA]/70">Học tập</p>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight">Khóa học của tôi</h1>
                        <p className="text-[#BBE1FA]/80 text-sm max-w-md">Theo dõi tiến độ học tập và hoàn thành các khóa đào tạo được phân công.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {[
                            { label: 'Tổng khóa', value: stats.total, icon: BookOpen },
                            { label: 'Đang học', value: stats.inProgress, icon: GraduationCap },
                            { label: 'Hoàn thành', value: stats.completed, icon: BookOpenCheck },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-white/10 backdrop-blur rounded-2xl px-5 py-3 text-center min-w-[90px] border border-white/10">
                                <Icon className="w-4 h-4 mx-auto mb-1 text-[#BBE1FA]" />
                                <p className="text-2xl font-black">{value}</p>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#BBE1FA]/70">{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Continue Learning Highlight ── */}
            {resumeCourse && !search && progressFilter === 'all' && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                        <div className="flex items-center gap-4">
                            <ProgressRing percent={resumeCourse.progressPercentage} size={56} stroke={4} />
                            <div>
                                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Tiến độ gần nhất</h3>
                                <p className="text-xl font-black text-[#0F4C75] leading-tight mb-1">{resumeCourse.course.courseName}</p>
                                <p className="text-sm text-gray-500">Mã: {resumeCourse.course.courseCode} • {resumeCourse.course.lessonCount} bài học</p>
                            </div>
                        </div>
                        <Button
                            asChild
                            className="bg-gradient-to-r from-[#0F4C75] to-[#3282B8] text-white hover:opacity-90 rounded-xl px-8 shadow-md"
                        >
                            <Link href={`${learningBasePath}/course/${resumeCourse.course.id}`}>
                                Tiếp tục học tập <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Search + Filter ── */}
            <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Tìm khóa học theo tên, mã hoặc mô tả..."
                        className="pl-12 h-12 rounded-2xl border-gray-200 bg-white shadow-sm text-sm focus:border-[#3282B8] focus:ring-[#3282B8]/20"
                    />
                </div>
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1 shrink-0">
                    {[
                        { key: 'all' as const, label: 'Tất cả' },
                        { key: 'inProgress' as const, label: 'Đang học' },
                        { key: 'completed' as const, label: 'Hoàn thành' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setProgressFilter(key)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                progressFilter === key ? 'bg-white text-[#0F4C75] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Course Grid ── */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {courses.length === 0 ? (
                    <div className="col-span-full rounded-3xl border-2 border-dashed border-gray-200 bg-white p-16 text-center space-y-4">
                        <div className="w-16 h-16 bg-[#BBE1FA]/30 rounded-full flex items-center justify-center mx-auto">
                            {search.trim() ? <Search className="w-7 h-7 text-[#3282B8]" /> : <GraduationCap className="w-7 h-7 text-[#3282B8]" />}
                        </div>
                        <p className="text-lg font-bold text-[#0F4C75]">
                            {search.trim() ? 'Không tìm thấy khóa học phù hợp' : 'Chưa có khóa học nào'}
                        </p>
                        <p className="text-sm text-gray-400">
                            {search.trim() ? 'Thử từ khóa khác.' : 'Bạn sẽ nhận thông báo khi có khóa học mới được phân công.'}
                        </p>
                    </div>
                ) : (
                    courses.map(({ course, progressPercentage, quizUnlocked }) => (
                        <Link
                            key={course.id}
                            href={`${learningBasePath}/course/${course.id}`}
                            className="group block"
                        >
                            <div className="rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-[#BBE1FA] transition-all duration-300 overflow-hidden flex flex-col h-full">

                                {/* Gradient Thumbnail */}
                                <div className={`relative h-36 bg-gradient-to-br ${getGradient(course.courseCode)} p-5 flex flex-col justify-between`}>
                                    <div className="flex items-start justify-between">
                                        <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm font-bold text-xs px-3">
                                            {course.courseCode}
                                        </Badge>
                                        <Badge className={`border-0 backdrop-blur-sm font-semibold text-xs ${
                                            course.status === 'Public'
                                                ? 'bg-green-500/20 text-green-100'
                                                : 'bg-yellow-500/20 text-yellow-100'
                                        }`}>
                                            {course.status === 'Public' ? 'Đang mở' : course.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-white/70 text-xs font-medium">
                                        <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course.lessonCount || 0} bài học</span>
                                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {course.enrollmentCount || 0}</span>
                                        {course.durationMinutes ? (
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {course.durationMinutes}p</span>
                                        ) : null}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-[#0F4C75] leading-snug line-clamp-2 group-hover:text-[#3282B8] transition-colors">
                                        {course.courseName}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">
                                        {course.description || 'Chưa có mô tả.'}
                                    </p>

                                    {/* Progress + Quiz Status */}
                                    <div className="mt-4 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <ProgressRing percent={progressPercentage} size={48} stroke={3.5} />
                                            <div>
                                                <p className="text-xs font-bold text-[#0F4C75]">Tiến độ</p>
                                                <p className="text-[11px] text-gray-400">{progressPercentage >= 100 ? 'Hoàn thành' : 'Đang học'}</p>
                                            </div>
                                        </div>
                                        <Badge className={`text-[10px] font-semibold px-2.5 py-1 border-0 ${
                                            quizUnlocked
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-amber-50 text-amber-700'
                                        }`}>
                                            {quizUnlocked ? '✓ Đã mở khóa' : '🔒 Chưa mở khóa'}
                                        </Badge>
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-4 pt-4 border-t border-gray-50">
                                        <div className="flex items-center justify-between text-sm font-bold text-[#3282B8] group-hover:text-[#0F4C75] transition-colors">
                                            <span>{progressPercentage >= 100 ? 'Xem lại & Xem chứng chỉ' : progressPercentage > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
