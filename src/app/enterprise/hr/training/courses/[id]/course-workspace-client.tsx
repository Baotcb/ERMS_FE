'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, BookOpen, MessageSquare, Layout, Pencil } from 'lucide-react';
import type { Course } from '@/features/hr/types/course-types';
import type { CourseFeedbackDto } from '@/features/employee/api/feedback-service';
import { Button } from '@/components/ui/button';
import { CourseDetailContent } from '@/features/hr/components/training/courses/course-detail-content';
import { FeedbackTab } from '@/features/hr/components/training/courses/feedback-tab';
import { UpdateCourseDialog } from '@/features/hr/components/training/update-course-dialog';

export function CourseWorkspaceClient({
    course,
    initialTab,
    feedbacks
}: {
    course: Course;
    initialTab: string;
    feedbacks: CourseFeedbackDto[];
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [localSearch, setLocalSearch] = useState('');
    const [isEditOpen, setIsEditOpen] = useState(false);

    const updateUrl = useCallback((newTab: string) => {
        const params = new URLSearchParams();
        if (newTab !== 'overview') params.set('tab', newTab);
        router.push(`${pathname}?${params.toString()}`);
    }, [router, pathname]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header / Actions */}
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    onClick={() => router.push('/enterprise/hr/training/courses')}
                    className="text-gray-500 hover:text-[#0F4C75] hover:bg-blue-50 -ml-2"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                </Button>
            </div>

            {/* Course Title Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center text-white shadow-lg shrink-0">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-[#0F4C75]">{course.courseName}</h1>
                        <p className="text-sm text-gray-500 font-medium">Mã: {course.courseCode}</p>
                    </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex items-center gap-3 shrink-0">
                    <Button 
                        onClick={() => setIsEditOpen(true)}
                        className="bg-white text-[#0F4C75] border border-gray-200 hover:bg-gray-50 shadow-sm rounded-xl px-4 font-semibold"
                    >
                        <Pencil className="w-4 h-4 mr-2" /> Sửa thông tin
                    </Button>
                    <div className="flex bg-gray-100/80 p-1 rounded-xl shadow-inner shrink-0">
                        <button
                            onClick={() => updateUrl('overview')}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                            initialTab === 'overview' 
                                ? 'bg-white text-[#0F4C75] shadow-sm ring-1 ring-gray-200/50' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                        }`}
                    >
                        <Layout className="w-4 h-4" /> Tổng quan
                    </button>
                    <button
                        onClick={() => updateUrl('feedback')}
                        className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                            initialTab === 'feedback' 
                                ? 'bg-white text-[#0F4C75] shadow-sm ring-1 ring-gray-200/50' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/50'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" /> Phản hồi
                    </button>
                </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                {initialTab === 'overview' ? (
                    <CourseDetailContent 
                        course={course} 
                        onViewFeedback={() => updateUrl('feedback')}
                        hideHeader={true} // new prop to hide duplicated title inside details
                    />
                ) : (
                    <FeedbackTab 
                        feedbacks={feedbacks}
                        localSearch={localSearch}
                        onSearchChange={setLocalSearch}
                        courseFilter={course.courseName}
                        onCourseFilterChange={() => {}} // Disabled filtering in course scope
                        hideCourseFilter={true} // new prop
                    />
                )}
            </div>

            <UpdateCourseDialog 
                course={course}
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                onSuccess={() => {
                    router.refresh(); // Refresh RSC data
                }}
            />
        </div>
    );
}
