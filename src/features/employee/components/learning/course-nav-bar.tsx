'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ClipboardCheck, BarChart3, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CourseNavBarProps {
    courseId: string;
    completedLessons: number;
    totalLessons: number;
    isAllLessonsComplete: boolean;
    hasQuizResult?: boolean;
    hasFeedback?: boolean;
}

const BASE = '/enterprise/employee/learning/course';

export function CourseNavBar({
    courseId,
    completedLessons,
    totalLessons,
    isAllLessonsComplete,
    hasQuizResult = false,
    hasFeedback = false,
}: CourseNavBarProps) {
    const pathname = usePathname();
    const base = `${BASE}/${courseId}`;

    const tabs = [
        {
            href: base,
            label: 'Bài học',
            icon: BookOpen,
            badge: `${completedLessons}/${totalLessons}`,
            matchExact: true,
            disabled: false,
        },
        {
            href: `${base}/quiz`,
            label: 'Kiểm tra',
            icon: ClipboardCheck,
            badge: undefined,
            matchExact: false,
            disabled: false,
        },
        {
            href: `${base}/result`,
            label: 'Kết quả',
            icon: BarChart3,
            badge: undefined,
            matchExact: false,
            disabled: !hasQuizResult,
        },
        {
            href: `${base}/review`,
            label: 'Đánh giá',
            icon: Star,
            badge: hasFeedback ? '✓' : undefined,
            matchExact: false,
            disabled: !hasQuizResult,
        },
    ];

    return (
        <nav className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-gray-50/80 border border-gray-100 w-fit">
            {tabs.map(({ href, label, icon: Icon, badge, matchExact, disabled }) => {
                const isActive = matchExact
                    ? pathname === href
                    : pathname.startsWith(href);

                if (disabled) {
                    return (
                        <span
                            key={href}
                            className="course-nav-tab course-nav-tab--disabled"
                            title="Chưa khả dụng"
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{label}</span>
                        </span>
                    );
                }

                return (
                    <Link
                        key={href}
                        href={href}
                        className={`course-nav-tab ${isActive ? 'course-nav-tab--active' : 'course-nav-tab--inactive'}`}
                    >
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{label}</span>
                        {badge && (
                            <Badge className={`text-[10px] px-1.5 py-0 border-0 font-semibold ${
                                isActive
                                    ? 'bg-white/25 text-white'
                                    : 'bg-gray-200/80 text-gray-600'
                            }`}>
                                {badge}
                            </Badge>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
