'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap, ChevronRight, BookOpen, Calendar, Users, ClipboardList, PenTool } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
}

const HR_TRAINING_TABS: NavItem[] = [
    { label: 'Kế hoạch', href: '/enterprise/hr/training/plans', icon: ClipboardList },
    { label: 'Yêu cầu', href: '/enterprise/hr/training/requests', icon: Users },
    { label: 'Lịch ĐT', href: '/enterprise/hr/training/schedule', icon: Calendar },
    { label: 'Khóa học', href: '/enterprise/hr/training/courses', icon: BookOpen },
    { label: 'Workshop', href: '/enterprise/hr/training/workshop', icon: Users },
];

const DEPT_HEAD_TRAINING_TABS: NavItem[] = [
    { label: 'Yêu cầu', href: '/enterprise/dept-head/training', icon: ClipboardList },
    { label: 'Phân công', href: '/enterprise/dept-head/training/assign', icon: Users },
    { label: 'Kết quả', href: '/enterprise/dept-head/training/results', icon: GraduationCap },
];

const DIRECTOR_TEACHING_TABS: NavItem[] = [
    { label: 'Nhiệm vụ giảng dạy', href: '/enterprise/director/teaching', icon: PenTool },
];

const EMPLOYEE_LEARNING_TABS: NavItem[] = [
    { label: 'Bàn học của tôi', href: '/enterprise/employee/learning', icon: BookOpen },
];

interface TrainingLayoutShellProps {
    children: React.ReactNode;
    roleSegment: 'hr' | 'dept-head' | 'director' | 'employee';
    title?: string;
    description?: string;
}

export function TrainingLayoutShell({ children, roleSegment, title, description }: TrainingLayoutShellProps) {
    const pathname = usePathname();

    const tabs = useMemo(() => {
        switch (roleSegment) {
            case 'hr': return HR_TRAINING_TABS;
            case 'dept-head': return DEPT_HEAD_TRAINING_TABS;
            case 'director': return DIRECTOR_TEACHING_TABS;
            case 'employee': return EMPLOYEE_LEARNING_TABS;
            default: return [];
        }
    }, [roleSegment]);

    // Handle exact matching vs sub-route matching for active state
    // We treat the base tab href as active if pathname starts with it, 
    // BUT we must be careful with root paths like "/enterprise/dept-head/training"
    const isActive = (itemHref: string) => {
        if (itemHref === `/enterprise/${roleSegment}/training`) {
            return pathname === itemHref || pathname === `${itemHref}/`;
        }
        return pathname.startsWith(itemHref);
    };

    const activeTab = tabs.find(t => isActive(t.href)) || tabs[0];

    return (
        <div className="flex flex-col min-h-full">
            {/* Unified Header & Breadcrumbs */}
            <div className="max-w-7xl mx-auto w-full px-6 mt-6 mb-6">
                <div className="bg-white border border-gray-200 rounded-2xl px-6 py-6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] space-y-4">
                    {/* Breadcrumbs */}
                    <div className="flex items-center text-sm text-gray-500 gap-2 font-medium">
                        <GraduationCap className="w-4 h-4 text-[#0F4C75]" />
                        <span className="text-[#0F4C75]">Đào tạo & Phát triển</span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        <span className="text-gray-700">{activeTab?.label || 'Tổng quan'}</span>
                    </div>

                    {/* Title & Unified Headers */}
                    <div className="pb-4">
                        <h1 className="text-2xl font-black tracking-tight text-[#0F4C75]">
                            {title || activeTab?.label || 'Trung tâm Đào tạo'}
                        </h1>
                        {description && (
                            <p className="text-sm text-gray-500 mt-1">{description}</p>
                        )}
                    </div>

                    {/* Sub-navigation Tabs */}
                    {tabs.length > 1 && (
                        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                            {tabs.map(tab => {
                                const active = isActive(tab.href);
                                const Icon = tab.icon;
                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        className={cn(
                                            "flex items-center gap-2 pb-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
                                            active
                                                ? "border-[#0F4C75] text-[#0F4C75]"
                                                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200"
                                        )}
                                    >
                                        <Icon className={cn("w-4 h-4", active ? "text-[#0F4C75]" : "text-gray-400")} />
                                        {tab.label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Content Injection */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-6 pb-10">
                {children}
            </div>
        </div>
    );
}
