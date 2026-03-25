'use client';

import { Clock3, Lock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CourseSection, Lesson } from '@/features/hr/types/course-content-types';
import type { CourseProgressDto } from '@/features/employee/types/learning-quiz-types';

interface LessonSidebarProps {
    sections: CourseSection[];
    allLessons: Lesson[];
    completedLessonSet: Set<string>;
    lessonIndexMap: Map<string, number>;
    activeLessonId: string;
    isLoading: boolean;
    progress: CourseProgressDto | null;
    completedCount: number;
    totalLessons: number;
    onSelectLesson: (lessonId: string) => void;
}

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

export function LessonSidebar(props: LessonSidebarProps) {
    const listContent = (
        <div className="flex flex-col h-full bg-white">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#F8FBFF] to-white shrink-0">
                <h2 className="font-black tracking-tight text-[#0F4C75]">Nội dung khóa học</h2>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">{props.completedCount}/{props.totalLessons} bài đã hoàn thành</p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {props.isLoading ? (
                    <div className="p-6 flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Đang tải curriculum...
                    </div>
                ) : props.allLessons.length === 0 ? (
                    <div className="p-6 space-y-2 text-sm text-gray-500">
                        <p>Chưa có bài học nào trong curriculum của khóa học này.</p>
                        {props.progress && props.progress.totalLessons > 0 ? (
                            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                                Backend đang ghi nhận {props.progress.totalLessons} lesson nhưng API curriculum chưa trả danh sách chi tiết lesson.
                            </p>
                        ) : null}
                    </div>
                ) : (
                    <div className="pb-6">
                        {props.sections.map((section, index) => (
                            <div key={section.id} className="border-b border-gray-100 last:border-b-0">
                                <div className="learning-section-bar sticky top-0 bg-[#F8FBFF]/90 backdrop-blur z-10">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#3282B8]">Module {index + 1}</p>
                                    <p className="text-sm font-bold text-[#0F4C75]">{section.title}</p>
                                </div>
                                <div className="p-2 space-y-1.5">
                                    {section.lessons.map((lesson: Lesson) => {
                                        const lessonGlobalIndex = props.lessonIndexMap.get(lesson.id) ?? -1;
                                        const isCompleted = props.completedLessonSet.has(lesson.id);
                                        const isActive = props.activeLessonId === lesson.id;
                                        const isLocked = lessonGlobalIndex > 0 && !props.completedLessonSet.has(props.allLessons[lessonGlobalIndex - 1].id);

                                        return (
                                            <button
                                                key={lesson.id}
                                                type="button"
                                                onClick={() => { if (!isLocked) props.onSelectLesson(lesson.id); }}
                                                disabled={isLocked}
                                                className={`w-full text-left rounded-xl px-3 py-3 border transition ${
                                                    isLocked
                                                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                                        : isActive
                                                        ? 'border-[#0F4C75] bg-[#EAF4FF]'
                                                        : 'border-gray-100 hover:border-blue-200 hover:bg-blue-50/40'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-[#0F4C75] truncate">{lesson.title}</p>
                                                        <p className="text-xs text-gray-500 inline-flex items-center gap-1 mt-1">
                                                            <Clock3 className="w-3 h-3" /> {lesson.durationMinutes || 0} phút
                                                        </p>
                                                    </div>
                                                    {isLocked ? (
                                                        <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                    ) : (
                                                        <Badge className={isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                                                            {isCompleted ? 'Hoàn thành' : 'Chưa làm'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block learning-card overflow-hidden h-fit max-h-[calc(100vh-120px)] flex flex-col">
                {listContent}
            </aside>

            {/* Mobile Drawer Button */}
            <div className="lg:hidden block bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-[#0F4C75]">Chương trình học</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{props.completedCount}/{props.totalLessons} bài hoàn thành</p>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Menu className="w-4 h-4" />
                            Mở danh sách
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[85vw] max-w-[400px] p-0 flex flex-col">
                        <SheetHeader className="sr-only">
                            <SheetTitle>Danh sách bài học</SheetTitle>
                        </SheetHeader>
                        {listContent}
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
