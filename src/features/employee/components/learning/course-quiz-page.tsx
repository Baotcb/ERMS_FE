'use client';

import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Clock3, FileText, Lock, Loader2, Paperclip, Timer, Send, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/features/hr/types/course-types';
import type { CourseProgressDto, LearnerQuizQuestionDto, LearnerQuizResultDto } from '@/features/employee/types/learning-quiz-types';
import { learningQuizService } from '@/features/employee/api/learning-quiz-service';
import { courseContentService } from '@/features/hr/api/course-content-service';
import { quizService } from '@/features/hr/api/quiz-service';
import { feedbackService } from '@/features/employee/api/feedback-service';
import type { CourseSection, Lesson } from '@/features/hr/types/course-content-types';
import { useAuth } from '@/features/core/auth/hooks';
import { CertificateExportDialog } from './certificate-export-dialog';
import { format } from 'date-fns';

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

// getLearnerQuizIdKey removed — no longer used

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
    const [, setIsLoadingProgress] = useState(false);
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
    const [activeTab, setActiveTab] = useState<'lessons' | 'quiz'>('lessons');

    // Quiz attempt tracking
    const [quizMaxAttempts, setQuizMaxAttempts] = useState<number | null>(null);
    const [quizAttemptCount, setQuizAttemptCount] = useState(0);

    // Feedback form
    const [feedbackCourseRating, setFeedbackCourseRating] = useState(0);
    const [feedbackTrainerRating, setFeedbackTrainerRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackAnonymous, setFeedbackAnonymous] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Certificate export
    const { user } = useAuth();
    const [showCertDialog, setShowCertDialog] = useState(false);

    // Quiz countdown timer
    const [quizRemainingSeconds, setQuizRemainingSeconds] = useState<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback((minutes: number) => {
        stopTimer();
        const totalSeconds = minutes * 60;
        setQuizRemainingSeconds(totalSeconds);
        timerRef.current = setInterval(() => {
            setQuizRemainingSeconds(prev => {
                if (prev === null || prev <= 1) {
                    stopTimer();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [stopTimer]);

    useEffect(() => stopTimer, [stopTimer]);

    // Load existing quiz result + feedback status on mount
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const [existingResult, hasFeedback] = await Promise.all([
                    learningQuizService.getQuizResult(initialCourse.id),
                    feedbackService.checkFeedback(initialCourse.id),
                ]);
                if (cancelled) return;
                if (existingResult) {
                    setResult({
                        score: existingResult.score,
                        isPassed: existingResult.isPassed,
                        correctAnswers: existingResult.correctAnswers,
                        totalQuestions: existingResult.totalQuestions,
                    });
                    setQuizAttemptCount(existingResult.attemptCount);
                    if (existingResult.maxAttempts != null) {
                        setQuizMaxAttempts(existingResult.maxAttempts);
                    }
                }
                if (hasFeedback) {
                    setFeedbackSubmitted(true);
                }
            } catch {
                // Silently ignore — user can still start quiz normally
            }
        })();
        return () => { cancelled = true; };
    }, [initialCourse.id]);

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

            // Start countdown timer + get quiz info
            try {
                const quizInfo = await quizService.getCourseQuiz(initialCourse.id);
                if (quizInfo.timeLimitMinutes && quizInfo.timeLimitMinutes > 0) {
                    startTimer(quizInfo.timeLimitMinutes);
                }
                if (quizInfo.maxAttempts) {
                    setQuizMaxAttempts(quizInfo.maxAttempts);
                }
            } catch {
                // Timer is optional, don't block quiz start
            }
            setQuizAttemptCount(prev => prev + 1);

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
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4C75] via-[#1B262C] to-[#0F4C75] p-6 md:p-8 text-white">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#3282B8]/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#BBE1FA]/5 rounded-full translate-y-1/3 -translate-x-1/4" />

                <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#BBE1FA]/60">
                            <span>Học tập</span>
                            <span>›</span>
                            <span className="text-[#BBE1FA]/90">{initialCourse.courseName}</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tight">{initialCourse.courseName}</h1>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-white/15 text-white border-0 font-bold text-xs backdrop-blur-sm">{initialCourse.courseCode}</Badge>
                            <span className="text-sm text-[#BBE1FA]/80">• {knownTotalLessons} bài học • {totalDurationMinutes} phút</span>
                        </div>
                    </div>

                    <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-white/80">Tiến độ học</span>
                            <span className="font-black text-white">{completedLessonsCount}/{knownTotalLessons} ({completionPercent}%)</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#3282B8] to-[#BBE1FA] transition-all duration-500"
                                style={{ width: `${completionPercent}%` }}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge className={localLessonsCompleted ? 'bg-green-500/20 text-green-200 border-0' : 'bg-amber-500/20 text-amber-200 border-0'}>
                                {localLessonsCompleted ? '✓ Hoàn thành lessons' : '◉ Đang học'}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-gray-100/80 w-fit">
                <button
                    type="button"
                    onClick={() => setActiveTab('lessons')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                        activeTab === 'lessons'
                            ? 'bg-white text-[#0F4C75] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                    📚 Bài học ({completedLessonsCount}/{knownTotalLessons})
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('quiz')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                        activeTab === 'quiz'
                            ? 'bg-white text-[#0F4C75] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                    }`}
                >
                    📝 Kiểm tra cuối khóa {result?.isPassed ? '✅' : ''}
                </button>
            </div>

            {/* === TAB: Bài học === */}
            {activeTab === 'lessons' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[360px_1fr]">
                <aside className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden h-fit">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#F8FBFF] to-white">
                        <h2 className="font-black tracking-tight text-[#0F4C75]">Nội dung khóa học</h2>
                        <p className="text-[11px] text-gray-400 mt-1 font-medium">{completedLessonsCount}/{knownTotalLessons} bài đã hoàn thành</p>
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
                                    <div className="px-4 py-3 bg-[#FCFDFF] border-l-3 border-l-[#3282B8]">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#3282B8]">Module {index + 1}</p>
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
                                {/* Video Player */}
                                {activeLesson.videoUrl && (() => {
                                    const url = activeLesson.videoUrl;
                                    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
                                    const isDrive = url.includes('drive.google.com');
                                    let youtubeVideoId: string | null = null;
                                    let driveFileId: string | null = null;

                                    if (isYouTube) {
                                        const match = url.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/e\/|watch\?.*v=)([a-zA-Z0-9_-]{11})/);
                                        youtubeVideoId = match ? match[1] : null;
                                    }

                                    if (isDrive) {
                                        const match = url.match(/\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/);
                                        driveFileId = match ? match[1] : null;
                                    }

                                    return (
                                        <div className="rounded-2xl border border-gray-100 overflow-hidden">
                                            {isYouTube && youtubeVideoId ? (
                                                <div className="relative">
                                                    <iframe
                                                        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                                                        className="w-full aspect-video"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        allowFullScreen
                                                        title={activeLesson.title}
                                                    />
                                                    <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">Video bài giảng</span>
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-semibold text-[#3282B8] hover:underline"
                                                        >
                                                            Xem trên YouTube ↗
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : isDrive && driveFileId ? (
                                                <div className="relative">
                                                    <iframe
                                                        src={`https://drive.google.com/file/d/${driveFileId}/preview`}
                                                        className="w-full aspect-video"
                                                        allow="autoplay; encrypted-media"
                                                        allowFullScreen
                                                        title={activeLesson.title}
                                                    />
                                                    <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">Video từ Google Drive</span>
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-semibold text-[#3282B8] hover:underline"
                                                        >
                                                            Mở trên Drive ↗
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : isYouTube || isDrive ? (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 transition-colors"
                                                >
                                                    <div className={`w-16 h-16 rounded-xl ${isYouTube ? 'bg-red-600' : 'bg-blue-600'} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                        <svg className="w-8 h-8 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">Xem Video bài giảng</p>
                                                        <p className="text-sm text-gray-500 truncate max-w-md">{url}</p>
                                                    </div>
                                                </a>
                                            ) : (
                                                <video
                                                    key={url}
                                                    src={url}
                                                    controls
                                                    className="w-full aspect-video bg-black"
                                                    controlsList="nodownload"
                                                    preload="metadata"
                                                >
                                                    Trình duyệt không hỗ trợ phát video.
                                                </video>
                                            )}
                                        </div>
                                    );
                                })()}

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
                </section>

            </div>
            )}

            {/* === TAB: Quiz === */}
            {activeTab === 'quiz' && (
            <div className="space-y-5">
                    {/* Show result card when quiz has been submitted */}
                    {result ? (
                        <div className="space-y-5">
                            <div className={`rounded-3xl border-2 p-8 text-center space-y-4 ${result.isPassed ? 'border-green-200 bg-gradient-to-b from-green-50 to-white' : 'border-amber-200 bg-gradient-to-b from-amber-50 to-white'}`}>
                                <div className="text-5xl">{result.isPassed ? '🎉' : '💪'}</div>
                                <h3 className={`text-2xl font-black ${result.isPassed ? 'text-green-700' : 'text-amber-700'}`}>
                                    {result.isPassed ? 'Chúc mừng, bạn đã ĐẠT!' : 'Chưa đạt, hãy thử lại!'}
                                </h3>
                                <div className="flex items-center justify-center gap-6 text-sm">
                                    <div className="text-center">
                                        <p className={`text-3xl font-black ${result.isPassed ? 'text-green-600' : 'text-amber-600'}`}>{result.score}%</p>
                                        <p className="text-gray-500 text-xs font-medium">Điểm số</p>
                                    </div>
                                    <div className="w-px h-10 bg-gray-200" />
                                    <div className="text-center">
                                        <p className={`text-3xl font-black ${result.isPassed ? 'text-green-600' : 'text-amber-600'}`}>{result.correctAnswers}/{result.totalQuestions}</p>
                                        <p className="text-gray-500 text-xs font-medium">Câu đúng</p>
                                    </div>
                                </div>

                                {quizMaxAttempts && (
                                    <p className="text-xs text-gray-400 font-medium">
                                        Đã làm: {quizAttemptCount}/{quizMaxAttempts} lượt
                                    </p>
                                )}

                                <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                                    {result.isPassed && (
                                        <Button
                                            onClick={() => setShowCertDialog(true)}
                                            className="bg-gradient-to-r from-[#0F4C75] to-[#3282B8] hover:opacity-90 text-white rounded-xl px-6 py-5 font-bold text-sm gap-2 shadow-lg transition-all active:scale-95"
                                        >
                                            📜 Xuất chứng chỉ
                                        </Button>
                                    )}
                                    {!result.isPassed && (!quizMaxAttempts || quizAttemptCount < quizMaxAttempts) && (
                                        <Button
                                            onClick={handleStartQuiz}
                                            disabled={isStarting}
                                            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6 py-5 font-bold text-sm gap-2"
                                        >
                                            {isStarting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                            🔄 Làm lại ({quizMaxAttempts ? `còn ${quizMaxAttempts - quizAttemptCount} lượt` : 'thử lại'})
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Show start quiz prompt when no result yet */
                        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Final Quiz</p>
                                    <h3 className="text-xl font-black text-[#0F3B64]">Đánh giá cuối khóa</h3>
                                    <p className="text-sm text-gray-500 mt-1">Hoàn thành tất cả bài học để mở khóa bài kiểm tra cuối khóa.</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    onClick={handleStartQuiz}
                                    disabled={isStarting || !canViewQuizSection}
                                    className="bg-[#145DA0] hover:bg-[#0F4C75] text-white"
                                >
                                    {isStarting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Bắt đầu làm quiz
                                </Button>
                                {quizMaxAttempts && (
                                    <span className="text-sm text-gray-500 font-medium">
                                        Số lượt: {quizAttemptCount}/{quizMaxAttempts} (còn {quizMaxAttempts - quizAttemptCount} lượt)
                                    </span>
                                )}
                            </div>

                            {!canViewQuizSection ? (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    {initialCourse.isOnline === false ? (
                                        <>
                                            <strong>Workshop chưa được xác nhận.</strong> HR cần xác nhận hoàn thành workshop trước khi bạn có thể làm bài kiểm tra.
                                        </>
                                    ) : (
                                        <>
                                            Quiz chưa được mở. Tiến độ local của bạn hiện là {completedLessonsCount}/{knownTotalLessons} lesson.
                                        </>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    )}

            {quizQuestions.length > 0 && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm flex items-center justify-between">
                        <p className="text-sm text-gray-600">Đã trả lời {completedCount}/{quizQuestions.length} câu</p>
                        {quizRemainingSeconds !== null && (
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm ${
                                quizRemainingSeconds <= 300
                                    ? 'bg-red-100 text-red-700 animate-pulse'
                                    : 'bg-blue-50 text-[#0F4C75]'
                            }`}>
                                <Timer className="w-4 h-4" />
                                {Math.floor(quizRemainingSeconds / 60).toString().padStart(2, '0')}:{(quizRemainingSeconds % 60).toString().padStart(2, '0')}
                            </div>
                        )}
                        <Badge variant="secondary" className="bg-blue-50 text-[#0F4C75] border-0">Attempt: {attemptId.slice(0, 8)}...</Badge>
                    </div>

                    {quizQuestions.map((question, qIndex) => (
                        <div key={question.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-bold shrink-0">{qIndex + 1}</span>
                                <h3 className="font-bold text-[#0F4C75] text-base leading-relaxed pt-1">{question.questionText}</h3>
                            </div>
                            <div className="space-y-2 pl-11">
                                {question.parsedOptions.map((option, optionIndex) => {
                                    const answerValue = ANSWER_LABELS[optionIndex] || String(optionIndex + 1);
                                    const isSelected = answers[question.id] === answerValue;

                                    return (
                                        <button
                                            key={`${question.id}-${answerValue}`}
                                            type="button"
                                            onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: answerValue }))}
                                            className={`w-full text-left rounded-xl border-2 px-4 py-3.5 transition-all duration-200 flex items-center gap-3 ${isSelected ? 'border-[#0F4C75] bg-[#BBE1FA]/20 shadow-sm' : 'border-gray-100 hover:border-[#BBE1FA] hover:bg-[#BBE1FA]/5'}`}
                                        >
                                            <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-all ${isSelected ? 'border-[#0F4C75] bg-[#0F4C75] text-white' : 'border-gray-300 text-gray-400'}`}>{answerValue}</span>
                                            <span className={`text-sm ${isSelected ? 'font-semibold text-[#0F4C75]' : 'text-gray-700'}`}>{option}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="rounded-2xl bg-gradient-to-r from-[#0F4C75] to-[#1B262C] p-6 shadow-sm">
                        <Button onClick={handleSubmitQuiz} disabled={isSubmitting} className="w-full bg-white text-[#0F4C75] hover:bg-[#BBE1FA] py-6 rounded-xl font-bold text-base gap-2">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Nộp bài thi
                        </Button>
                    </div>
                </div>
            )}


            {result?.isPassed && (
                <CertificateExportDialog
                    open={showCertDialog}
                    onOpenChange={setShowCertDialog}
                    data={{
                        learnerName: user?.fullName || '',
                        learnerEmail: user?.email || '',
                        departmentName: user?.departmentName || '',
                        courseName: initialCourse.courseName,
                        courseCode: initialCourse.courseCode,
                        trainerName: initialCourse.trainerName || initialCourse.trainerEmail || '',
                        score: result.score,
                        completionDate: format(new Date(), 'yyyy-MM-dd'),
                    }}
                />
            )}

            {/* Feedback Form — appears after quiz result */}
            {result?.isPassed && !feedbackSubmitted && (
                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-6 space-y-5">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Đánh giá</p>
                        <h3 className="text-xl font-black text-[#0F3B64]">⭐ Đánh giá khóa học</h3>
                        <p className="text-sm text-gray-500 mt-1">Chia sẻ trải nghiệm của bạn để cải thiện chất lượng đào tạo.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#0F4C75]">Chất lượng khóa học</label>
                            <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map((star) => (
                                    <button key={star} type="button" onClick={() => setFeedbackCourseRating(star)}
                                        className="p-1 transition-transform hover:scale-110">
                                        <Star className={`w-7 h-7 ${star <= feedbackCourseRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-500">{feedbackCourseRating > 0 ? `${feedbackCourseRating}/5` : ''}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#0F4C75]">Giảng viên</label>
                            <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map((star) => (
                                    <button key={star} type="button" onClick={() => setFeedbackTrainerRating(star)}
                                        className="p-1 transition-transform hover:scale-110">
                                        <Star className={`w-7 h-7 ${star <= feedbackTrainerRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                    </button>
                                ))}
                                <span className="ml-2 text-sm text-gray-500">{feedbackTrainerRating > 0 ? `${feedbackTrainerRating}/5` : ''}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#0F4C75]">Nhận xét (tùy chọn)</label>
                        <textarea
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Chia sẻ ý kiến của bạn về khóa học và giảng viên..."
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#3282B8]/30 focus:border-[#3282B8]"
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={feedbackAnonymous} onChange={(e) => setFeedbackAnonymous(e.target.checked)}
                                className="rounded border-gray-300" />
                            <span className="text-sm text-gray-600">Gửi đánh giá ẩn danh</span>
                        </label>
                    </div>

                    <Button
                        onClick={async () => {
                            if (feedbackCourseRating === 0 || feedbackTrainerRating === 0) {
                                toast({ title: 'Vui lòng chọn sao', description: 'Hãy đánh giá cả khóa học và giảng viên.', variant: 'destructive' });
                                return;
                            }
                            setIsSubmittingFeedback(true);
                            try {
                                await feedbackService.submitFeedback({
                                    courseId: initialCourse.id,
                                    courseRating: feedbackCourseRating,
                                    trainerRating: feedbackTrainerRating,
                                    comment: feedbackComment || undefined,
                                    isAnonymous: feedbackAnonymous,
                                });
                                setFeedbackSubmitted(true);
                                toast({ title: 'Cảm ơn bạn!', description: 'Đánh giá của bạn đã được ghi nhận.' });
                            } catch (err) {
                                const msg = err instanceof Error ? err.message : 'Không thể gửi đánh giá.';
                                toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
                            } finally {
                                setIsSubmittingFeedback(false);
                            }
                        }}
                        disabled={isSubmittingFeedback}
                        className="bg-[#145DA0] hover:bg-[#0F4C75] text-white"
                    >
                        {isSubmittingFeedback ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Gửi đánh giá
                    </Button>
                </div>
            )}

            {feedbackSubmitted && (
                <div className="rounded-3xl border-2 border-green-200 bg-gradient-to-b from-green-50 to-white p-8 text-center space-y-3">
                    <div className="text-4xl">🌟</div>
                    <h3 className="text-xl font-black text-green-700">Cảm ơn bạn đã đánh giá!</h3>
                    <p className="text-sm text-gray-500">Phản hồi của bạn sẽ giúp cải thiện chất lượng đào tạo.</p>
                </div>
            )}
            </div>
            )}
        </div>
    );
}
