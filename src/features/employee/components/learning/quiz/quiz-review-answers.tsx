'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface QuizReviewItem {
    orderIndex: number;
    questionText: string;
    options: string;
    selectedAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string | null;
}

interface QuizReviewAnswersProps {
    items: QuizReviewItem[];
}

export function QuizReviewAnswers({ items }: QuizReviewAnswersProps) {
    const [expanded, setExpanded] = useState(false);

    if (items.length === 0) return null;

    return (
        <div className="space-y-4">
            <Button
                variant="outline"
                onClick={() => setExpanded(!expanded)}
                className="w-full rounded-xl border-gray-200 py-5 font-bold text-sm gap-2 hover:bg-[#BBE1FA]/10 hover:border-[#3282B8] transition-all"
            >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {expanded ? 'Ẩn đáp án chi tiết' : `Xem đáp án chi tiết (${items.length} câu)`}
            </Button>

            {expanded && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    {items.map((item, idx) => {
                        let options: string[] = [];
                        try { options = JSON.parse(item.options); } catch { options = []; }

                        return (
                            <div
                                key={idx}
                                className={`rounded-2xl border p-5 transition-all ${
                                    item.isCorrect
                                        ? 'border-green-100 bg-green-50/30'
                                        : 'border-red-100 bg-red-50/30'
                                }`}
                            >
                                {/* Header */}
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-sm ${
                                        item.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                        {item.isCorrect
                                            ? <CheckCircle2 className="w-4 h-4" />
                                            : <XCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-400 mb-1">
                                            Câu {item.orderIndex + 1}
                                        </p>
                                        <p className="font-semibold text-gray-800 text-sm leading-relaxed">
                                            {item.questionText}
                                        </p>
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="space-y-2 ml-11">
                                    {options.map((opt, optIdx) => {
                                        const optLetter = String.fromCharCode(65 + optIdx);
                                        const isSelected = optLetter === item.selectedAnswer;
                                        const isCorrectOption = optLetter === item.correctAnswer;

                                        let className = 'rounded-xl border px-4 py-2.5 text-sm transition-all flex items-center gap-2 ';
                                        if (isCorrectOption) {
                                            className += 'border-green-300 bg-green-50 text-green-800 font-semibold';
                                        } else if (isSelected && !item.isCorrect) {
                                            className += 'border-red-300 bg-red-50 text-red-700 line-through';
                                        } else {
                                            className += 'border-gray-100 bg-white text-gray-600';
                                        }

                                        return (
                                            <div key={optIdx} className={className}>
                                                <span className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 text-[10px] font-bold">
                                                    {isCorrectOption ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                                    ) : isSelected ? (
                                                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                                                    ) : (
                                                        String.fromCharCode(65 + optIdx)
                                                    )}
                                                </span>
                                                {opt}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Explanation */}
                                {item.explanation && (
                                    <div className="ml-11 mt-3 rounded-xl bg-blue-50/50 border border-blue-100 px-4 py-3 flex items-start gap-2">
                                        <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-blue-700 leading-relaxed">{item.explanation}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
