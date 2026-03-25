'use client';

import { useState } from 'react';
import { FileText, Loader2, Paperclip } from 'lucide-react';
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
        return <div className="text-sm text-gray-500">Chưa có lesson để hiển thị.</div>;
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
                description: 'Bạn đã xem xong video bài giảng. Đã tự động đánh dấu hoàn thành bài học.',
            });
        }
    };

    return (
        <section className="space-y-5">
            <div className="learning-card p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Bài học đang xem</p>
                        <h3 className="text-2xl font-black tracking-tight text-[#0F3B64]">{activeLesson.title || 'Chưa có lesson'}</h3>
                    </div>
                    {!(isNativeVideo && !isCompleted) && (
                        <Button
                            type="button"
                            variant={isCompleted ? 'outline' : 'default'}
                            onClick={onComplete}
                            disabled={isUpdating || isCompleted}
                            className={isCompleted ? 'border-green-200 text-green-700' : 'bg-[#145DA0] hover:bg-[#0F4C75] text-white'}
                        >
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isCompleted ? 'Đã hoàn thành lesson' : 'Đánh dấu hoàn thành lesson'}
                        </Button>
                    )}
                </div>

                {/* Video Player */}
                {activeLesson.videoUrl && (
                    <VideoPlayer 
                        url={activeLesson.videoUrl} 
                        title={activeLesson.title}
                        isYouTube={!!isYouTube}
                        isDrive={!!isDrive}
                        isCompleted={isCompleted || lastCompletedId === activeLesson.id}
                        onVideoEnd={handleVideoEnd}
                    />
                )}

                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <p className="text-sm font-semibold text-[#0F4C75] mb-2">Nội dung bài học</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {activeLesson.content || activeLesson.description || 'Bài học này chưa có nội dung chi tiết, vui lòng học qua video và tài liệu đính kèm.'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button type="button" variant="outline" className="w-full sm:w-auto flex-1 sm:flex-none justify-start px-5 py-6 rounded-2xl border-gray-200" onClick={() => onNavigate('prev')} disabled={activeLessonIndex <= 0}>
                        <div className="text-left ml-2">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Bài trước</p>
                            <p className="text-sm font-semibold text-[#0F4C75] truncate max-w-[200px]">{prevLesson?.title || '—'}</p>
                        </div>
                    </Button>
                    <div className="hidden sm:block flex-1" />
                    <Button type="button" variant="outline" className="w-full sm:w-auto flex-1 sm:flex-none justify-end px-5 py-6 rounded-2xl border-blue-100 bg-blue-50/50 hover:bg-blue-100" onClick={() => onNavigate('next')} disabled={activeLessonIndex < 0 || activeLessonIndex >= totalLessons - 1}>
                        <div className="text-right mr-2">
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-0.5">Bài tiếp theo</p>
                            <p className="text-sm font-semibold text-[#0F4C75] truncate max-w-[200px]">{nextLesson?.title || '—'}</p>
                        </div>
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

    return (
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
            {isYouTube && youtubeVideoId ? (
                <div className="relative">
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        title={title}
                    />
                    <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Video bài giảng</span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#3282B8] hover:underline">Xem trên YouTube ↗</a>
                    </div>
                </div>
            ) : isDrive && driveFileId ? (
                <div className="relative">
                    <iframe
                        src={`https://drive.google.com/file/d/${driveFileId}/preview`}
                        className="w-full aspect-video"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title={title}
                    />
                    <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Video từ Google Drive</span>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[#3282B8] hover:underline">Mở trên Drive ↗</a>
                    </div>
                </div>
            ) : isYouTube || isDrive ? (
                <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 transition-colors">
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
            )}
        </div>
    );
}
