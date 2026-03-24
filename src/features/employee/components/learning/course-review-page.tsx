'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Course } from '@/features/hr/types/course-types';
import { CourseFeedbackForm } from './quiz/course-feedback-form';
import { CourseNavBar } from './course-nav-bar';

export function CourseReviewPage({ initialCourse }: { initialCourse: Course }) {
    const router = useRouter();

    return (
        <div className="space-y-6 max-w-3xl mx-auto px-4 py-8">
            <CourseNavBar
                courseId={initialCourse.id}
                completedLessons={0}
                totalLessons={0}
                isAllLessonsComplete
                hasQuizResult
            />

            <div className="learning-card p-8 space-y-6">
                <div>
                    <h2 className="text-xl font-black text-[#0F4C75]">Đánh giá khóa học</h2>
                    <p className="text-sm text-gray-500 mt-1">Chia sẻ trải nghiệm học tập của bạn về khóa &ldquo;{initialCourse.courseName}&rdquo;</p>
                </div>

                <CourseFeedbackForm
                    courseId={initialCourse.id}
                    onSubmitted={() => router.push(`/enterprise/employee/learning/course/${initialCourse.id}/result`)}
                />
            </div>

            <Button
                variant="ghost"
                onClick={() => router.push(`/enterprise/employee/learning/course/${initialCourse.id}/result`)}
                className="text-gray-400 text-sm"
            >
                <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại kết quả
            </Button>
        </div>
    );
}
