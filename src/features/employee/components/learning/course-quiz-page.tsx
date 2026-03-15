'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Trophy } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Course } from '@/features/hr/types/course-types';
import type { CourseProgressDto, LearnerQuizQuestionDto, LearnerQuizResultDto } from '@/features/employee/types/learning-quiz-types';
import { learningQuizService } from '@/features/employee/api/learning-quiz-service';

const ANSWER_LABELS = ['A', 'B', 'C', 'D'] as const;

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

export function CourseQuizPage({
    initialCourse,
    initialQuizId = '',
}: {
    initialCourse: Course;
    initialQuizId?: string;
}) {
    const { toast } = useToast();

    const [progress, setProgress] = useState<CourseProgressDto | null>(null);
    const [isLoadingProgress, setIsLoadingProgress] = useState(false);

    const [quizId, setQuizId] = useState('');

    const [attemptId, setAttemptId] = useState('');
    const [questions, setQuestions] = useState<LearnerQuizQuestionDto[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});

    const [isStarting, setIsStarting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<LearnerQuizResultDto | null>(null);

    const normalizedQuizId = quizId.trim();

    useEffect(() => {
        const normalizedInitialQuizId = initialQuizId.trim();
        const storedQuizId = localStorage.getItem(getLearnerQuizIdKey(initialCourse.id)) || '';
        const resolvedQuizId = normalizedInitialQuizId || storedQuizId;

        if (resolvedQuizId) {
            setQuizId(resolvedQuizId);
            localStorage.setItem(getLearnerQuizIdKey(initialCourse.id), resolvedQuizId);
        }
    }, [initialCourse.id, initialQuizId]);

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
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể tải tiến độ khóa học.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsLoadingProgress(false);
        }
    };

    const handleStartQuiz = async () => {
        if (!normalizedQuizId) {
            toast({ title: 'Thiếu Quiz ID', description: 'Vui lòng nhập Quiz ID do HR/Trainer cung cấp.', variant: 'destructive' });
            return;
        }

        if (!progress) {
            toast({ title: 'Thiếu tiến độ', description: 'Vui lòng tải tiến độ khóa học trước khi bắt đầu.', variant: 'destructive' });
            return;
        }

        if (!progress.quizUnlocked) {
            toast({ title: 'Chưa mở khóa quiz', description: 'Bạn cần hoàn thành toàn bộ bài học trước khi làm quiz.', variant: 'destructive' });
            return;
        }

        setIsStarting(true);
        try {
            const { attemptId: startedAttemptId } = await learningQuizService.startQuiz(normalizedQuizId);
            if (!startedAttemptId) {
                throw new Error('Không nhận được mã lượt làm bài từ backend.');
            }

            const loadedQuestions = await learningQuizService.getQuizQuestions(startedAttemptId);
            setAttemptId(startedAttemptId);
            setQuestions(loadedQuestions);
            setAnswers({});
            setResult(null);
            localStorage.setItem(getLearnerQuizIdKey(initialCourse.id), normalizedQuizId);

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
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                <h1 className="text-2xl font-bold text-[#0F4C75]">{initialCourse.courseName}</h1>
                <p className="text-sm text-gray-600 mt-1">Mã khóa học: {initialCourse.courseCode}</p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                    Hiện backend chưa có endpoint lấy quiz theo course cho học viên, nên bạn cần nhập Quiz ID do trainer/HR cung cấp để bắt đầu.
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
                    <Label htmlFor="quiz-id">Quiz ID</Label>
                    <Input
                        id="quiz-id"
                        value={quizId}
                        onChange={(event) => setQuizId(event.target.value)}
                        placeholder="Dán Quiz ID..."
                        className="font-mono"
                    />
                    <Button onClick={loadProgress} variant="outline" disabled={isLoadingProgress}>
                        {isLoadingProgress ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Tải tiến độ khóa học
                    </Button>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-2">
                    <p className="text-sm text-gray-500">Tiến độ học</p>
                    {progress ? (
                        <>
                            <p className="text-sm text-gray-700">{progress.completedLessons}/{progress.totalLessons} bài học đã hoàn thành ({progress.progressPercentage}%)</p>
                            <Badge className={progress.quizUnlocked ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                {progress.quizUnlocked ? 'Quiz đã mở khóa' : 'Quiz chưa mở khóa'}
                            </Badge>
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">Chưa có dữ liệu tiến độ.</p>
                    )}
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <Button
                    onClick={handleStartQuiz}
                    disabled={isStarting || !progress?.quizUnlocked}
                    className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white"
                >
                    {isStarting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Bắt đầu làm quiz
                </Button>
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
