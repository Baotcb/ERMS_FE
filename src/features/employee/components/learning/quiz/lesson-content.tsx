'use client';

import { useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Lesson } from '@/features/hr/types/course-content-types';

interface LessonContentProps {
    activeLesson: Lesson | null;
    activeLessonIndex: number;
    totalLessons: number;
    isCompleted: boolean;
    isUpdating: boolean;
    onComplete: () => void;
    onNavigate: (direction: 'prev' | 'next') => void;
    prevLesson?: Lesson;
    nextLesson?: Lesson;
}

export function LessonContent({
    activeLesson, activeLessonIndex, totalLessons,
    isCompleted, isUpdating, onComplete, onNavigate,
    prevLesson, nextLesson,
}: LessonContentProps) {
    const { toast } = useToast();
    const [lastCompletedId, setLastCompletedId] = useState<string | null>(null);

    if (!activeLesson) {
        return <div className="text-sm text-gray-500 p-8 text-center">Chọn một bài học từ mục lục bên trái.</div>;
    }

    const isYouTube = activeLesson.videoUrl?.includes('youtube.com') || activeLesson.videoUrl?.includes('youtu.be');
    const isDrive = activeLesson.videoUrl?.includes('drive.google.com');
    const isNativeVideo = activeLesson.videoUrl && !isYouTube && !isDrive;

    const handleVideoEnd = () => {
        if (!isCompleted && !isUpdating && lastCompletedId !== activeLesson.id) {
            setLastCompletedId(activeLesson.id);
            onComplete();
            toast({
                title: '🎉 Tuyệt vời!',
                description: 'Bạn đã xem xong video bài giảng. Đã tự động đánh dấu hoàn thành.',
            });
        }
    };

    return (
        <section className="space-y-5 min-w-0">
            {/* ── Video Player ── */}
            {activeLesson.videoUrl && (
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                    <VideoPlayer
                        url={activeLesson.videoUrl}
                        title={activeLesson.title}
                        isYouTube={!!isYouTube}
                        isDrive={!!isDrive}
                        isCompleted={isCompleted || lastCompletedId === activeLesson.id}
                        onVideoEnd={handleVideoEnd}
                    />
                </div>
            )}

            {/* ── Lesson Title + Complete button ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#F0F9FF] to-white p-4 border border-blue-100">
                <h2 className="text-lg lg:text-xl font-black tracking-tight text-[#0F3B64]">
                    {activeLesson.title}
                </h2>
                {!(isNativeVideo && !isCompleted) && (
                    <Button
                        type="button"
                        variant={isCompleted ? 'outline' : 'default'}
                        onClick={onComplete}
                        disabled={isUpdating || isCompleted}
                        className={`shrink-0 rounded-xl font-bold shadow-md ${isCompleted
                            ? 'border-green-300 text-green-700 bg-green-50 shadow-green-100'
                            : 'bg-gradient-to-r from-[#0F4C75] to-[#3282B8] hover:from-[#0F3B64] hover:to-[#145DA0] text-white shadow-blue-200'
                        }`}
                    >
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isCompleted ? '✓ Đã hoàn thành' : 'Hoàn thành bài học'}
                    </Button>
                )}
            </div>

    

            {/* ── Tài liệu đính kèm ── */}
            {activeLesson.materials && activeLesson.materials.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-5 rounded-full bg-[#E8731A]" />
                        <h3 className="text-sm font-bold text-[#0F4C75]">Tài liệu đính kèm</h3>
                    </div>
                    <div className="space-y-2 pl-3">
                        {activeLesson.materials.map((material) => (
                            <a
                                key={material.id}
                                href={material.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5 hover:border-blue-200 hover:bg-blue-50/40 transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-lg bg-[#EAF4FF] flex items-center justify-center shrink-0">
                                    <Paperclip className="w-4 h-4 text-[#3282B8]" />
                                </div>
                                <span className="text-sm font-medium text-[#0F4C75] truncate flex-1">{material.title || 'Tài liệu đính kèm'}</span>
                                <span className="text-[10px] text-gray-400 uppercase font-medium shrink-0">{material.fileType || 'FILE'}</span>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Prev / Next Navigation ── */}
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onNavigate('prev')}
                    disabled={activeLessonIndex <= 0}
                    className="flex-1 justify-start px-4 py-5 rounded-xl border-gray-200 hover:border-blue-200 hover:bg-blue-50/40"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                    <div className="text-left min-w-0">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bài trước</p>
                        <p className="text-sm font-semibold text-[#0F4C75] truncate">{prevLesson?.title || '—'}</p>
                    </div>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onNavigate('next')}
                    disabled={activeLessonIndex < 0 || activeLessonIndex >= totalLessons - 1 || !isCompleted}
                    className="flex-1 justify-end px-4 py-5 rounded-xl border-blue-100 bg-blue-50/30 hover:bg-blue-100/50"
                >
                    <div className="text-right min-w-0">
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${(!isCompleted) ? 'text-gray-400' : 'text-[#3282B8]'}`}>Bài tiếp</p>
                        <p className={`text-sm font-semibold truncate ${(!isCompleted) ? 'text-gray-400' : 'text-[#0F4C75]'}`}>{nextLesson?.title || '—'}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ml-2 shrink-0 ${(!isCompleted) ? 'text-gray-400' : 'text-[#3282B8]'}`} />
                </Button>
            </div>
        </section>
    );
}

/* ─── Video Sub-Component ─── */

function VideoPlayer({
    url, title, isYouTube, isDrive, isCompleted, onVideoEnd
}: {
    url: string; title: string; isYouTube: boolean; isDrive: boolean; isCompleted: boolean; onVideoEnd: () => void;
}) {
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

    if (isYouTube && youtubeVideoId) {
        return (
            <div>
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    title={title}
                />
                <div className="bg-gray-900/80 backdrop-blur px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-300">Video bài giảng</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-400 hover:text-blue-300">Xem trên YouTube ↗</a>
                </div>
            </div>
        );
    }

    if (isDrive && driveFileId) {
        return (
            <div>
                <iframe
                    src={`https://drive.google.com/file/d/${driveFileId}/preview`}
                    className="w-full aspect-video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={title}
                />
                <div className="bg-gray-900/80 backdrop-blur px-4 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-300">Video từ Google Drive</span>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-400 hover:text-blue-300">Mở trên Drive ↗</a>
                </div>
            </div>
        );
    }

    if (isYouTube || isDrive) {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 transition-colors">
                <div className={`w-14 h-14 rounded-xl ${isYouTube ? 'bg-red-600' : 'bg-blue-600'} flex items-center justify-center shrink-0 shadow-lg`}>
                    <svg className="w-7 h-7 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <div>
                    <p className="font-bold">Xem Video bài giảng</p>
                    <p className="text-sm text-gray-400 truncate max-w-md">{url}</p>
                </div>
            </a>
        );
    }

    return (
        <video
            key={url}
            src={url}
            controls
            className="w-full aspect-video bg-black"
            controlsList="nodownload"
            preload="metadata"
            onTimeUpdate={(e) => {
                if (isCompleted) return;
                const video = e.currentTarget;
                if (video.duration > 0 && (video.currentTime / video.duration) >= 0.9) {
                    onVideoEnd();
                }
            }}
        >
            Trình duyệt không hỗ trợ phát video.
        </video>
    );
}
