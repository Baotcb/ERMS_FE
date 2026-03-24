// Pure presentational component — no 'use client' needed

import { Badge } from '@/components/ui/badge';

interface CourseHeroHeaderProps {
    courseName: string;
    courseCode: string;
    totalLessons: number;
    totalDurationMinutes: number;
    completedCount: number;
    completionPercent: number;
    isAllComplete: boolean;
}

export function CourseHeroHeader({
    courseName, courseCode, totalLessons, totalDurationMinutes,
    completedCount, completionPercent, isAllComplete,
}: CourseHeroHeaderProps) {
    return (
        <div className="learning-hero">
            <div className="learning-hero__orb-1" />
            <div className="learning-hero__orb-2" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                    <div className="learning-breadcrumb">
                        <span>Học tập</span>
                        <span>›</span>
                        <span style={{ color: 'rgba(187,225,250,0.9)' }}>{courseName}</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">{courseName}</h1>
                    <div className="flex items-center gap-3">
                        <Badge className="bg-white/15 text-white border-0 font-bold text-xs backdrop-blur-sm">{courseCode}</Badge>
                        <span className="text-sm" style={{ color: 'rgba(187,225,250,0.8)' }}>• {totalLessons} bài học • {totalDurationMinutes} phút</span>
                    </div>
                </div>

                <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 backdrop-blur p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-white/80">Tiến độ học</span>
                        <span className="font-black text-white">{completedCount}/{totalLessons} ({completionPercent}%)</span>
                    </div>
                    <div className="learning-progress-track">
                        <div className="learning-progress-fill" style={{ width: `${completionPercent}%` }} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge className={isAllComplete ? 'bg-green-500/20 text-green-200 border-0' : 'bg-amber-500/20 text-amber-200 border-0'}>
                            {isAllComplete ? '✓ Hoàn thành lessons' : '◉ Đang học'}
                        </Badge>
                    </div>
                </div>
            </div>
        </div>
    );
}
