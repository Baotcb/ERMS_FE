'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, FileText, Lock, Loader2, Paperclip, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/features/hr/types/course-types';
import type { CourseProgressDto, LearnerQuizQuestionDto, LearnerQuizResultDto } from '@/features/employee/types/learning-quiz-types';
import { learningQuizService } from '@/features/employee/api/learning-quiz-service';
import { courseContentService } from '@/features/hr/api/course-content-service';
import type { CourseSection, Lesson } from '@/features/hr/types/course-content-types';

const ANSWER_LABELS = ['A', 'B', 'C', 'D'] as const;

const GUID_REGEX = /^[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}$/;

function isServerLessonId(lessonId: string): boolean {
    if (!lessonId) {
        return false;
    }

    if (lessonId.startsWith('fallback-') || lessonId.startsWith('local-')) {
        return false;
    }

    return GUID_REGEX.test(lessonId);
}

function parseOptions(raw: string): string[] {
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
            return parsed.map((item) => String(item));
        }

        if (parsed && typeof parsed === 'object') {
            return Object.values(parsed as Record<string, unknown>).map((item) => String(item));
        }
    } catch {
        // Fallback for legacy/plain-text formats.
    }

    return raw.split('|').map((item) => item.trim()).filter(Boolean);
}

function getLearnerQuizIdKey(courseId: string): string {
    return `learner-quiz-id:${courseId}`;
}

function getLessonCompletionKey(courseId: string): string {
    return `learner-lesson-completion:${courseId}`;
}

function buildFallbackSections(courseId: string, totalLessons: number): CourseSection[] {
    if (totalLessons <= 0) {
        return [];
    }

    return [
        {
            id: `fallback-section-${courseId}`,
            courseId,
            title: 'Learning Path (Fallback)',
            orderIndex: 1,
            lessons: Array.from({ length: totalLessons }).map((_, index) => ({
                id: `fallback-lesson-${courseId}-${index + 1}`,
                courseId,
                title: `Lesson ${index + 1}`,
                description: 'Backend chưa trả curriculum chi tiết. Đây là lesson placeholder theo tổng số lesson từ tiến độ backend.',
                content: 'Vui lòng học theo tài liệu/video đã được trainer cung cấp. Khi backend mở curriculum endpoint, hệ thống sẽ hiển thị lesson chi tiết.',
                durationMinutes: 0,
                orderIndex: index + 1,
                materials: [],
            })),
        },
    ];
}

function loadLocalDraftCurriculum(courseId: string): CourseSection[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(`teaching-curriculum-draft:${courseId}`);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as CourseSection[];
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter((section) => Array.isArray(section.lessons) && section.lessons.length > 0);
    } catch {
        return [];
    }
}

interface MaterialMirrorItem {
    lessonId: string;
    orderIndex: number;
    lessonTitle: string;
    materials: Array<{
        id: string;
        lessonId: string;
        title: string;
        fileUrl: string;
        fileType: string;
        fileSize: number;
    }>;
}

function loadLocalMaterialMirror(courseId: string): MaterialMirrorItem[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(`teaching-materials-draft:${courseId}`);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw) as MaterialMirrorItem[];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function mergeMaterialMirror(sections: CourseSection[], materialMirror: MaterialMirrorItem[]): CourseSection[] {
    if (materialMirror.length === 0 || sections.length === 0) {
        return sections;
    }

    const byLessonId = new Map(materialMirror.map((item) => [item.lessonId, item]));
    const byOrderIndex = new Map(materialMirror.map((item) => [item.orderIndex, item]));

    return sections.map((section) => ({
        ...section,
        lessons: (section.lessons || []).map((lesson) => {
            const source = byLessonId.get(lesson.id) || byOrderIndex.get(lesson.orderIndex);
            if (!source || source.materials.length === 0) {
                return lesson;
            }

            return {
                ...lesson,
                materials: source.materials.map((material) => ({
                    ...material,
                    lessonId: lesson.id,
                })),
            };
        }),
    }));
}

export function CourseQuizPage({
    initialCourse,
    initialProgress = null,
}: {
    initialCourse: Course;
    initialProgress?: CourseProgressDto | null;
}) {
    const { toast } = useToast();

    const [progress, setProgress] = useState<CourseProgressDto | null>(initialProgress);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);
    const [sections, setSections] = useState<CourseSection[]>([]);
    const [isLoadingCurriculum, setIsLoadingCurriculum] = useState(false);
    const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
    const [activeLessonId, setActiveLessonId] = useState<string>('');

    const [attemptId, setAttemptId] = useState('');
    const [questions, setQuestions] = useState<LearnerQuizQuestionDto[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const [isUpdatingLesson, setIsUpdatingLesson] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<LearnerQuizResultDto | null>(null);

    const allLessons = useMemo(() => sections.flatMap((section) => section.lessons || []), [sections]);

    const completedLessonSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);

    const completedLessonsCount = useMemo(() => allLessons.filter((lesson) => completedLessonSet.has(lesson.id)).length, [allLessons, completedLessonSet]);
    const knownTotalLessons = allLessons.length > 0
        ? allLessons.length
        : (progress?.totalLessons ?? 0);

    const localLessonsCompleted = allLessons.length > 0 && completedLessonsCount === allLessons.length;
    const completionPercent = knownTotalLessons > 0 ? Math.round((completedLessonsCount / knownTotalLessons) * 100) : 0;
    const totalDurationMinutes = allLessons.reduce((sum, lesson) => sum + (lesson.durationMinutes || 0), 0);

    const canViewQuizSection = Boolean(progress?.quizUnlocked);

    const activeLesson = useMemo(() => {
        if (!allLessons.length) {
            return null;
        }

        const selected = allLessons.find((lesson) => lesson.id === activeLessonId);
        return selected ?? allLessons[0];
    }, [activeLessonId, allLessons]);

    const activeLessonIndex = useMemo(() => {
        if (!activeLesson) {
            return -1;
        }

        return allLessons.findIndex((lesson) => lesson.id === activeLesson.id);
    }, [activeLesson, allLessons]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(getLessonCompletionKey(initialCourse.id));
            if (!raw) {
                setCompletedLessonIds([]);
                return;
            }

            const parsed = JSON.parse(raw) as unknown;
            setCompletedLessonIds(Array.isArray(parsed) ? parsed.map((id) => String(id)) : []);
        } catch {
            setCompletedLessonIds([]);
        }
    }, [initialCourse.id]);

    useEffect(() => {
        const loadCurriculum = async () => {
            setIsLoadingCurriculum(true);
            try {
                const data = await courseContentService.getCourseCurriculum(initialCourse.id);
                const materialMirror = loadLocalMaterialMirror(initialCourse.id);
                if ((data || []).length > 0) {
                    setSections(mergeMaterialMirror(data || [], materialMirror));
                } else {
                    const draftSections = loadLocalDraftCurriculum(initialCourse.id);
                    if (draftSections.length > 0) {
                        setSections(mergeMaterialMirror(draftSections, materialMirror));
                    } else if ((initialProgress?.totalLessons ?? 0) > 0) {
                        const fallbackSections = buildFallbackSections(initialCourse.id, initialProgress?.totalLessons ?? 0);
                        setSections(mergeMaterialMirror(fallbackSections, materialMirror));
                    } else {
                        setSections([]);
                    }
                }

                if ((data || []).length > 0) {
                    const firstLesson = (data || []).flatMap((section) => section.lessons || [])[0];
                    if (firstLesson) {
                        setActiveLessonId(firstLesson.id);
                    }
                } else {
                    const draftSections = loadLocalDraftCurriculum(initialCourse.id);
                    const firstDraftLesson = draftSections.flatMap((section) => section.lessons || [])[0];

                    if (firstDraftLesson) {
                        setActiveLessonId(firstDraftLesson.id);
                    } else if ((initialProgress?.totalLessons ?? 0) > 0) {
                        setActiveLessonId(`fallback-lesson-${initialCourse.id}-1`);
                    }
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Không thể tải nội dung khóa học.';
                toast({ title: 'Lỗi', description: message, variant: 'destructive' });
                const draftSections = loadLocalDraftCurriculum(initialCourse.id);
                if (draftSections.length > 0) {
                    setSections(draftSections);
                    const firstDraftLesson = draftSections.flatMap((section) => section.lessons || [])[0];
                    if (firstDraftLesson) {
                        setActiveLessonId(firstDraftLesson.id);
                    }
                } else if ((initialProgress?.totalLessons ?? 0) > 0) {
                    setSections(buildFallbackSections(initialCourse.id, initialProgress?.totalLessons ?? 0));
                    setActiveLessonId(`fallback-lesson-${initialCourse.id}-1`);
                } else {
                    setSections([]);
                }
            } finally {
                setIsLoadingCurriculum(false);
            }
        };

        void loadCurriculum();
    }, [initialCourse.id, initialProgress?.totalLessons, toast]);

    useEffect(() => {
        void loadProgress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialCourse.id]);

    const markLessonComplete = (lessonId: string) => {
        setCompletedLessonIds((prev) => {
            if (prev.includes(lessonId)) {
                return prev;
            }

            const next = [...prev, lessonId];
            localStorage.setItem(getLessonCompletionKey(initialCourse.id), JSON.stringify(next));
            return next;
        });
    };

    const handleCompleteActiveLesson = async () => {
        if (!activeLesson) {
            return;
        }

        const alreadyCompleted = completedLessonSet.has(activeLesson.id);
        if (alreadyCompleted) {
            return;
        }

        if (!isServerLessonId(activeLesson.id)) {
            toast({
                title: 'Không thể đồng bộ tiến độ',
                description: 'Lesson hiện tại là dữ liệu fallback/local nên chưa thể ghi nhận tiến độ backend. Vui lòng liên hệ trainer để đồng bộ curriculum lên hệ thống.',
                variant: 'destructive',
            });
            return;
        }

        setIsUpdatingLesson(true);
        try {
            await learningQuizService.updateLessonProgress({
                lessonId: activeLesson.id,
                watchPercentage: 100,
                lastPosition: undefined,
                timeSpentMinutes: activeLesson.durationMinutes || 1,
            });

            markLessonComplete(activeLesson.id);

            try {
                const refreshedProgress = await learningQuizService.getCourseProgress(initialCourse.id);
                setProgress(refreshedProgress);
            } catch {
                // Keep local completion state even if progress refresh fails.
            }

            toast({ title: 'Đã cập nhật tiến độ', description: 'Bài học đã được ghi nhận hoàn thành trên hệ thống.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể cập nhật tiến độ bài học.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
            return;
        } finally {
            setIsUpdatingLesson(false);
        }

        // Move learners through curriculum linearly after first completion.
        if (activeLessonIndex >= 0 && activeLessonIndex < allLessons.length - 1) {
            setActiveLessonId(allLessons[activeLessonIndex + 1].id);
        }
    };

    const quizQuestions = useMemo(() => {
        return questions
            .slice()
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((question) => ({
                ...question,
                parsedOptions: parseOptions(question.options),
            }));
    }, [questions]);

    const completedCount = useMemo(() => {
        return quizQuestions.filter((question) => Boolean(answers[question.id])).length;
    }, [answers, quizQuestions]);

    const loadProgress = async () => {
        setIsLoadingProgress(true);
        try {
            const data = await learningQuizService.getCourseProgress(initialCourse.id);
            setProgress(data);

            if (sections.length === 0 && data.totalLessons > 0) {
                const materialMirror = loadLocalMaterialMirror(initialCourse.id);
                const draftSections = loadLocalDraftCurriculum(initialCourse.id);
                if (draftSections.length > 0) {
                    setSections(mergeMaterialMirror(draftSections, materialMirror));
                    const firstDraftLesson = draftSections.flatMap((section) => section.lessons || [])[0];
                    if (firstDraftLesson) {
                        setActiveLessonId(firstDraftLesson.id);
                    }
                } else {
                    const fallbackSections = buildFallbackSections(initialCourse.id, data.totalLessons);
                    setSections(mergeMaterialMirror(fallbackSections, materialMirror));
                    setActiveLessonId(`fallback-lesson-${initialCourse.id}-1`);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể tải tiến độ khóa học.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsLoadingProgress(false);
        }
    };

    const handleStartQuiz = async () => {
        if (!initialCourse.hasFinalQuiz) {
            toast({ title: 'Chưa có bài thi cuối khóa', description: 'Khóa học này chưa được gắn quiz trên hệ thống hiện tại. Vui lòng liên hệ HR/Trainer.', variant: 'destructive' });
            return;
        }

        let latestProgress = progress;
        try {
            latestProgress = await learningQuizService.getCourseProgress(initialCourse.id);
            setProgress(latestProgress);
        } catch {
            // Keep current progress state if refresh fails.
        }

        if (!latestProgress?.quizUnlocked) {
            toast({
                title: 'Chưa đủ điều kiện làm quiz',
                description: 'Backend chưa mở quiz. Vui lòng hoàn thành thêm bài học hoặc liên hệ HR/Trainer.',
                variant: 'destructive',
            });
            return;
        }

        setIsStarting(true);
        try {
            const { attemptId: startedAttemptId } = await learningQuizService.startQuiz(initialCourse.id);
            if (!startedAttemptId) {
                throw new Error('Không nhận được mã lượt làm bài từ backend.');
            }

            const loadedQuestions = await learningQuizService.getQuizQuestions(startedAttemptId);
            setAttemptId(startedAttemptId);
            setQuestions(loadedQuestions);
            setAnswers({});
            setResult(null);

            toast({ title: 'Bắt đầu bài thi', description: 'Bạn có thể trả lời từng câu và nộp bài khi hoàn tất.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể bắt đầu bài thi.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsStarting(false);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!attemptId || quizQuestions.length === 0) {
            toast({ title: 'Chưa có lượt làm bài', description: 'Vui lòng bắt đầu quiz trước khi nộp.', variant: 'destructive' });
            return;
        }

        if (completedCount !== quizQuestions.length) {
            toast({ title: 'Chưa hoàn tất', description: 'Vui lòng trả lời tất cả câu hỏi trước khi nộp bài.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            for (const question of quizQuestions) {
                await learningQuizService.submitAnswer(attemptId, {
                    questionId: question.id,
                    selectedAnswer: answers[question.id],
                });
            }

            const submittedResult = await learningQuizService.submitQuiz(attemptId);
            setResult(submittedResult);
            toast({ title: 'Đã nộp bài', description: submittedResult.isPassed ? 'Chúc mừng, bạn đã đạt bài thi cuối khóa.' : 'Bạn chưa đạt, vui lòng xem lại nội dung và thử lại.' });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể nộp bài thi.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-1">
            <div className="rounded-3xl border border-[#D9E8FF] bg-[linear-gradient(120deg,#F5FAFF_0%,#EEF6FF_55%,#FFFDF6_100%)] p-6 md:p-8 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#3D6F9A]">Learning Path</p>
                        <h1 className="text-3xl font-black tracking-tight text-[#0F3B64]">{initialCourse.courseName}</h1>
                        <p className="text-sm text-[#4A6A88]">Mã khóa học: {initialCourse.courseCode}</p>
                    </div>

                    <div className="w-full max-w-lg rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-[#1D4E7A]">Hoàn thành lesson</span>
                            <span className="font-bold text-[#0F3B64]">{completedLessonsCount}/{knownTotalLessons} ({completionPercent}%)</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-[#E6EEF7] overflow-hidden">
                            <div
                                className="h-full bg-[linear-gradient(90deg,#145DA0,#2E8BC0)] transition-all duration-500"
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className={localLessonsCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                                {localLessonsCompleted ? 'Đã hoàn thành toàn bộ lesson' : 'Chưa hoàn thành lesson'}
                            </Badge>
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                Tổng thời lượng: {totalDurationMinutes} phút
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
                <aside className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden h-fit">
                    <div className="px-5 py-4 border-b border-gray-100 bg-[#F8FBFF]">
                        <h2 className="font-black tracking-tight text-[#0F3B64]">Course Content</h2>
                        <p className="text-xs text-gray-500 mt-1">Học theo thứ tự từ trên xuống để mở khóa quiz.</p>
                    </div>

                    {isLoadingCurriculum ? (
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
                                    <div className="px-4 py-3 bg-[#FCFDFF]">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Module {index + 1}</p>
                                        <p className="text-sm font-bold text-[#0F4C75]">{section.title}</p>
                                    </div>
                                    <div className="p-2 space-y-1.5">
                                        {section.lessons.map((lesson: Lesson) => {
                                            const lessonGlobalIndex = allLessons.findIndex((l) => l.id === lesson.id);
                                            const isCompleted = completedLessonSet.has(lesson.id);
                                            const isActive = activeLesson?.id === lesson.id;
                                            const isLocked = lessonGlobalIndex > 0 && !completedLessonSet.has(allLessons[lessonGlobalIndex - 1].id);

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    type="button"
                                                    onClick={() => { if (!isLocked) setActiveLessonId(lesson.id); }}
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
                                                                {isCompleted ? 'Done' : 'Todo'}
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

                <section className="space-y-5">
                    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-center">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Bài học đang xem</p>
                                <h3 className="text-2xl font-black tracking-tight text-[#0F3B64]">{activeLesson?.title || 'Chưa có lesson'}</h3>
                            </div>
                            {activeLesson ? (
                                <Button
                                    type="button"
                                    variant={completedLessonSet.has(activeLesson.id) ? 'outline' : 'default'}
                                    onClick={() => void handleCompleteActiveLesson()}
                                    disabled={isUpdatingLesson || completedLessonSet.has(activeLesson.id)}
                                    className={completedLessonSet.has(activeLesson.id) ? 'border-green-200 text-green-700' : 'bg-[#145DA0] hover:bg-[#0F4C75] text-white'}
                                >
                                    {isUpdatingLesson ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    {completedLessonSet.has(activeLesson.id) ? 'Đã hoàn thành lesson' : 'Đánh dấu hoàn thành lesson'}
                                </Button>
                            ) : null}
                        </div>

                        {activeLesson ? (
                            <>
                                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                                    <p className="text-sm font-semibold text-[#0F4C75] mb-2">Nội dung bài học</p>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {activeLesson.content || activeLesson.description || 'Bài học này chưa có nội dung chi tiết, vui lòng học qua video và tài liệu đính kèm.'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (activeLessonIndex > 0) {
                                                setActiveLessonId(allLessons[activeLessonIndex - 1].id);
                                            }
                                        }}
                                        disabled={activeLessonIndex <= 0}
                                    >
                                        Bài trước
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            if (activeLessonIndex >= 0 && activeLessonIndex < allLessons.length - 1) {
                                                setActiveLessonId(allLessons[activeLessonIndex + 1].id);
                                            }
                                        }}
                                        disabled={activeLessonIndex < 0 || activeLessonIndex >= allLessons.length - 1}
                                    >
                                        Bài tiếp theo
                                    </Button>
                                </div>

                                <div className="rounded-2xl border border-gray-100 bg-white">
                                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 text-[#0F4C75] font-semibold">
                                        <FileText className="w-4 h-4" /> Tài liệu học tập
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {activeLesson.materials && activeLesson.materials.length > 0 ? activeLesson.materials.map((material) => (
                                            <a
                                                key={material.id}
                                                href={material.fileUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 hover:border-blue-200 hover:bg-blue-50/40"
                                            >
                                                <span className="inline-flex items-center gap-2 text-sm text-[#0F4C75]">
                                                    <Paperclip className="w-3.5 h-3.5" /> {material.title || 'Tài liệu đính kèm'}
                                                </span>
                                                <span className="text-xs text-gray-500">{material.fileType || 'FILE'}</span>
                                            </a>
                                        )) : (
                                            <p className="text-sm text-gray-500">Bài học này chưa có tài liệu đính kèm.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-gray-500">Chưa có lesson để hiển thị.</div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Final Quiz</p>
                                <h3 className="text-xl font-black text-[#0F3B64]">Đánh giá cuối khóa</h3>
                                <p className="text-sm text-gray-500 mt-1">Hoàn thành tất cả bài học để mở khóa bài kiểm tra cuối khóa. Quiz sẽ được lấy tự động theo khóa học.</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                onClick={handleStartQuiz}
                                disabled={isStarting || !canViewQuizSection}
                                className="bg-[#145DA0] hover:bg-[#0F4C75] text-white"
                            >
                                {isStarting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Bắt đầu làm quiz
                            </Button>
                        </div>

                        {!canViewQuizSection ? (
                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                Quiz chưa được backend mở. Tiến độ local của bạn hiện là {completedLessonsCount}/{knownTotalLessons} lesson.
                            </div>
                        ) : null}


                    </div>
                </section>
            </div>

            {quizQuestions.length > 0 && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-center justify-between">
                        <p className="text-sm text-gray-600">Đã trả lời {completedCount}/{quizQuestions.length} câu</p>
                        <Badge variant="secondary" className="bg-blue-50 text-[#0F4C75] border-0">Attempt: {attemptId.slice(0, 8)}...</Badge>
                    </div>

                    {quizQuestions.map((question, qIndex) => (
                        <div key={question.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
                            <h3 className="font-semibold text-[#0F4C75]">Câu {qIndex + 1}. {question.questionText}</h3>
                            <div className="space-y-2">
                                {question.parsedOptions.map((option, optionIndex) => {
                                    const answerValue = ANSWER_LABELS[optionIndex] || String(optionIndex + 1);
                                    const isSelected = answers[question.id] === answerValue;

                                    return (
                                        <button
                                            key={`${question.id}-${answerValue}`}
                                            type="button"
                                            onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: answerValue }))}
                                            className={`w-full text-left rounded-xl border px-4 py-3 transition ${isSelected ? 'border-[#0F4C75] bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                                        >
                                            <span className="font-bold mr-2">{answerValue}.</span>
                                            <span>{option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                        <Button onClick={handleSubmitQuiz} disabled={isSubmitting} className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Nộp bài thi
                        </Button>
                    </div>
                </div>
            )}

            {result && (
                <div className={`rounded-2xl border p-5 ${result.isPassed ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {result.isPassed ? <CheckCircle2 className="w-5 h-5 text-green-700" /> : <Trophy className="w-5 h-5 text-amber-700" />}
                        <h3 className={`font-bold ${result.isPassed ? 'text-green-700' : 'text-amber-700'}`}>
                            {result.isPassed ? 'Kết quả: ĐẠT' : 'Kết quả: CHƯA ĐẠT'}
                        </h3>
                    </div>
                    <p className="text-sm text-gray-700">Điểm: {result.score}%</p>
                    <p className="text-sm text-gray-700">Số câu đúng: {result.correctAnswers}/{result.totalQuestions}</p>
                </div>
            )}
        </div>
    );
}
