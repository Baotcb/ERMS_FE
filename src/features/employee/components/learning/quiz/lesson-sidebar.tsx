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

export function LessonSidebar({
    sections, allLessons, completedLessonSet, lessonIndexMap,
    activeLessonId, isLoading, progress, completedCount, totalLessons,
    onSelectLesson,
}: LessonSidebarProps) {
    return (
        <aside className="learning-card overflow-hidden h-fit">
            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#F8FBFF] to-white">
                <h2 className="font-black tracking-tight text-[#0F4C75]">Nội dung khóa học</h2>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">{completedCount}/{totalLessons} bài đã hoàn thành</p>
            </div>

            {isLoading ? (
                <div className="p-6 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang tải curriculum...
                </div>
            ) : allLessons.length === 0 ? (
                <div className="p-6 space-y-2 text-sm text-gray-500">
                    <p>Chưa có bài học nào trong curriculum của khóa học này.</p>
                    {progress && progress.totalLessons > 0 ? (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                            Backend đang ghi nhận {progress.totalLessons} lesson nhưng API curriculum chưa trả danh sách chi tiết lesson.
                        </p>
                    ) : null}
                </div>
            ) : (
                <div className="max-h-[640px] overflow-y-auto">
                    {sections.map((section, index) => (
                        <div key={section.id} className="border-b border-gray-100 last:border-b-0">
                            <div className="learning-section-bar">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-[#3282B8]">Module {index + 1}</p>
                                <p className="text-sm font-bold text-[#0F4C75]">{section.title}</p>
                            </div>
                            <div className="p-2 space-y-1.5">
                                {section.lessons.map((lesson: Lesson) => {
                                    const lessonGlobalIndex = lessonIndexMap.get(lesson.id) ?? -1;
                                    const isCompleted = completedLessonSet.has(lesson.id);
                                    const isActive = activeLessonId === lesson.id;
                                    const isLocked = lessonGlobalIndex > 0 && !completedLessonSet.has(allLessons[lessonGlobalIndex - 1].id);

                                    return (
                                        <button
                                            key={lesson.id}
                                            type="button"
                                            onClick={() => { if (!isLocked) onSelectLesson(lesson.id); }}
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
        </aside>
    );
}
