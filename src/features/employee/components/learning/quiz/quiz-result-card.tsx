'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { LearnerQuizResultDto } from '@/features/employee/types/learning-quiz-types';

interface QuizResultCardProps {
    result: LearnerQuizResultDto;
    attemptCount: number;
    maxAttempts: number | null;
    isStarting: boolean;
    onRetry: () => void;
    onExportCert: () => void;
}

export function QuizResultCard({
    result, attemptCount, maxAttempts, isStarting, onRetry, onExportCert,
}: QuizResultCardProps) {
    return (
        <div className={`result-card space-y-4 ${result.isPassed ? 'result-card--pass' : 'result-card--fail'}`}>
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

            {maxAttempts && (
                <p className="text-xs text-gray-400 font-medium">Đã làm: {attemptCount}/{maxAttempts} lượt</p>
            )}

            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                {result.isPassed && (
                    <Button
                        onClick={onExportCert}
                        className="bg-gradient-to-r from-[#0F4C75] to-[#3282B8] hover:opacity-90 text-white rounded-xl px-6 py-5 font-bold text-sm gap-2 shadow-lg transition-all active:scale-95"
                    >
                        📜 Xuất chứng chỉ
                    </Button>
                )}
                {!result.isPassed && (!maxAttempts || attemptCount < maxAttempts) && (
                    <Button
                        onClick={onRetry}
                        disabled={isStarting}
                        className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6 py-5 font-bold text-sm gap-2"
                    >
                        {isStarting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        🔄 Làm lại ({maxAttempts ? `còn ${maxAttempts - attemptCount} lượt` : 'thử lại'})
                    </Button>
                )}
            </div>
        </div>
    );
}
