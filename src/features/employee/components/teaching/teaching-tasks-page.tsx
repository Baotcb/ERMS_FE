'use client';

import { useMemo, useState } from 'react';
import { 
    Clock, Users, ArrowRight, CheckCircle2, AlertCircle, Search, GraduationCap
} from 'lucide-react';
import { useAuth } from '@/features/core/auth/hooks/use-auth';
import { Course } from '@/features/hr/types/course-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export function TeachingTasksPage({
    teachingBasePath = '/enterprise/employee/teaching',
    initialCourses = [],
}: {
    teachingBasePath?: string;
    initialCourses?: Course[];
}) {
    const { user } = useAuth();
    const [search, setSearch] = useState('');

    const courses = useMemo(() => {
        if (!user) {
            return [];
        }

        const normalizedSearch = search.trim().toLowerCase();

        return initialCourses.filter((course) => {
            const matchesOwnership = course.trainerId === user.id || (
                Boolean(user.fullName) &&
                Boolean(course.trainerName) &&
                course.trainerName!.trim().toLowerCase() === user.fullName!.trim().toLowerCase()
            );

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
        });
    }, [initialCourses, search, user]);

    const getStatusStep = (course: Course) => {
        if (course.status === 'Published') return 4;
        if (course.lessonCount > 0) return 3;
        if (course.description && course.durationMinutes) return 2;
        return 1;
    };

    const getStepLabel = (step: number) => {
        switch (step) {
            case 1: return 'Nhận nhiệm vụ & Khởi tạo';
            case 2: return 'Tải lên tài liệu';
            case 3: return 'Lộ trình học & Bài thi cuối khóa';
            case 4: return 'Xuất bản khóa học';
            default: return 'Khởi tạo';
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-[#0F4C75] tracking-tight">Nhiệm vụ giảng dạy</h1>
                    <p className="text-gray-500 font-medium italic">Chào mừng trở lại, {user?.fullName}. Bạn có {courses.length} khóa học cần xử lý.</p>
                </div>
                
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                        placeholder="Tìm kiếm nhiệm vụ..."
                        className="pl-10 rounded-xl border-gray-200 focus:border-[#3282B8] h-11 shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 ? (
                    <div className="col-span-full bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-[#0F4C75]">Chưa có nhiệm vụ nào</p>
                            <p className="text-sm text-gray-400">Bạn sẽ nhận được thông báo khi có khóa học được phân công.</p>
                        </div>
                    </div>
                ) : (
                    courses.map((course) => {
                        const currentStep = getStatusStep(course);
                        const progress = (currentStep / 4) * 100;

                        return (
                            <div key={course.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col overflow-hidden">
                                {/* Course Status Badge */}
                                <div className="p-6 pb-2">
                                    <div className="flex justify-between items-start mb-4">
                                        <Badge variant="secondary" className="bg-[#BBE1FA]/30 text-[#0F4C75] border-0 font-bold px-3 py-1">
                                            {course.courseCode}
                                        </Badge>
                                        {course.status === 'Published' ? (
                                            <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                                                <CheckCircle2 className="w-5 h-5" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                                <AlertCircle className="w-5 h-5 animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0F4C75] mb-2 leading-tight group-hover:text-[#3282B8] transition-colors line-clamp-2">
                                        {course.courseName}
                                    </h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {course.durationMinutes || 0} phút
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" />
                                            {course.lessonCount || 0} bài học
                                        </div>
                                    </div>
                                </div>

                                {/* Flow Progress */}
                                <div className="p-6 pt-4 space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                            <span>Tiến độ: {getStepLabel(currentStep)}</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <Progress value={progress} className="h-1.5 bg-gray-50" />
                                    </div>

                                    <div className="grid grid-cols-4 gap-2">
                                        {[1, 2, 3, 4].map((step) => (
                                            <div 
                                                key={step} 
                                                className={`h-1.5 rounded-full ${currentStep >= step ? 'bg-[#3282B8]' : 'bg-gray-100'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-auto p-6 pt-2 bg-gray-50/50 border-t border-gray-50">
                                    <Button 
                                        className="w-full bg-[#0F4C75] hover:bg-[#1B262C] text-white rounded-xl py-6 font-bold flex items-center justify-center gap-2 group/btn"
                                        asChild
                                    >
                                        <a href={`${teachingBasePath}/course/${course.id}`}>
                                            Tiếp tục xử lý
                                            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </a>
                                    </Button>
                                    {course.status === 'Published' && (
                                        <p className="text-[10px] text-center mt-2 text-green-600 font-bold uppercase tracking-widest">Khóa học đã sẵn sàng</p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
