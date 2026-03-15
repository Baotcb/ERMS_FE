'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpenCheck, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/features/hr/types/course-types';

interface LearnerCourseItem {
    course: Course;
    progressPercentage: number;
    quizUnlocked: boolean;
}

export function LearningCoursesPage({
    initialCourses,
    learningBasePath = '/enterprise/employee/learning',
}: {
    initialCourses: LearnerCourseItem[];
    learningBasePath?: string;
}) {
    const [search, setSearch] = useState('');

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
        });
    }, [initialCourses, search]);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Tìm khóa học..."
                    className="border-0 shadow-none focus-visible:ring-0"
                />
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {courses.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                        Hiện chưa có khóa học nào được phân công cho bạn, hoặc chưa có tiến độ học để hiển thị.
                    </div>
                ) : (
                    courses.map(({ course, progressPercentage, quizUnlocked }) => (
                        <div key={course.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <Badge variant="secondary" className="bg-[#BBE1FA]/30 text-[#0F4C75] border-0">
                                    {course.courseCode}
                                </Badge>
                                <Badge className={course.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                    {course.status}
                                </Badge>
                            </div>

                            <h3 className="line-clamp-2 text-lg font-bold text-[#0F4C75]">{course.courseName}</h3>
                            <p className="mt-2 line-clamp-3 text-sm text-gray-500">{course.description || 'Chưa có mô tả.'}</p>

                            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                                <span>{course.lessonCount || 0} bài học</span>
                                <span>{course.enrollmentCount || 0} học viên</span>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                <span>Tiến độ của bạn: {progressPercentage}%</span>
                                <Badge className={quizUnlocked ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                    {quizUnlocked ? 'Đã mở quiz' : 'Chưa mở quiz'}
                                </Badge>
                            </div>

                            <Link href={`${learningBasePath}/course/${course.id}`} className="mt-4 block">
                                <Button className="w-full bg-[#0F4C75] hover:bg-[#1A5F8C] text-white">
                                    <BookOpenCheck className="w-4 h-4 mr-2" />
                                    Vào học và làm quiz
                                </Button>
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
