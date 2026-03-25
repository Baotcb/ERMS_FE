import React, { useState } from 'react';
import { GripVertical, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { CourseSection } from '@/features/hr/types/course-content-types';
import { CurriculumLessonItem } from './curriculum-lesson-item';

export interface CurriculumSectionItemProps {
    section: CourseSection;
    index: number;
    syncingLessonId: string | null;
    uploadingLessonId: string | null;
    isLocalId: (id: string) => boolean;
    isUnsyncedLessonId: (id: string) => boolean;
    onDeleteSection: (sectionId: string) => void;
    onAddLesson: (sectionId: string, payload: { title: string; videoUrl?: string; durationMinutes: number }) => Promise<void>;
    onSyncLocalLesson: (sectionId: string, lessonId: string) => void;
    onUploadMaterial: (lessonId: string, file: File | null) => void;
    onDeleteLesson: (sectionId: string, lessonId: string) => void;
}

export function CurriculumSectionItem({
    section,
    index,
    syncingLessonId,
    uploadingLessonId,
    isLocalId,
    isUnsyncedLessonId,
    onDeleteSection,
    onAddLesson,
    onSyncLocalLesson,
    onUploadMaterial,
    onDeleteLesson,
}: CurriculumSectionItemProps) {
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonVideoUrl, setLessonVideoUrl] = useState('');
    const [lessonDuration, setLessonDuration] = useState(15);
    const [isAddingLesson, setIsAddingLesson] = useState(false);

    const handleAddLessonSubmit = async () => {
        if (!lessonTitle.trim()) return;
        setIsAddingLesson(true);
        try {
            await onAddLesson(section.id, {
                title: lessonTitle,
                videoUrl: lessonVideoUrl || undefined,
                durationMinutes: lessonDuration,
            });
            setLessonTitle('');
            setLessonVideoUrl('');
            setLessonDuration(15);
            setIsAddLessonOpen(false);
        } finally {
            setIsAddingLesson(false);
        }
    };

    return (
        <div className="bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-5 flex items-center justify-between bg-white border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                    <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                            Học phần {index + 1}
                        </span>
                        <h4 className="font-bold text-[#0F4C75] text-lg">{section.title}</h4>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onDeleteSection(section.id)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="p-5 space-y-3">
                {section.lessons.map((lesson, lIdx) => (
                    <CurriculumLessonItem
                        key={lesson.id}
                        lesson={lesson}
                        sectionId={section.id}
                        index={lIdx}
                        syncingLessonId={syncingLessonId}
                        uploadingLessonId={uploadingLessonId}
                        isLocalId={isLocalId}
                        isUnsyncedLessonId={isUnsyncedLessonId}
                        onSyncLocalLesson={onSyncLocalLesson}
                        onUploadMaterial={onUploadMaterial}
                        onDeleteLesson={onDeleteLesson}
                    />
                ))}

                <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            className="w-full border border-dashed border-gray-200 rounded-2xl py-8 hover:bg-blue-50 hover:border-blue-200 hover:text-[#0F4C75] text-gray-400 gap-2 transition-all font-bold group"
                        >
                            <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            Thêm bài giảng mới
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl max-w-2xl" onInteractOutside={(e) => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle className="text-[#0F4C75] font-bold text-xl">Thêm bài giảng mới</DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                                Điền thông tin cơ bản của bài giảng trước khi upload tài liệu học tập.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề bài giảng</Label>
                                <Input
                                    placeholder="VD: Tổng quan về React..."
                                    value={lessonTitle}
                                    onChange={(e) => setLessonTitle(e.target.value)}
                                    className="rounded-xl border-gray-200 h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Link video bài giảng (tùy chọn)
                                </Label>
                                <Input
                                    placeholder="https://youtube.com/watch?v=... hoặc URL video khác"
                                    value={lessonVideoUrl}
                                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                                    className="rounded-xl border-gray-200 h-11"
                                />
                                <p className="text-xs text-gray-400">Hỗ trợ YouTube, Vimeo hoặc link video trực tiếp</p>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Thời lượng dự kiến (phút)
                                </Label>
                                <Input
                                    type="number"
                                    value={lessonDuration}
                                    onChange={(e) => setLessonDuration(parseInt(e.target.value) || 15)}
                                    className="rounded-xl border-gray-200 h-11"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={handleAddLessonSubmit}
                                className="w-full bg-[#0F4C75] text-white rounded-2xl py-7 font-bold text-lg shadow-lg shadow-blue-100"
                                disabled={isAddingLesson}
                            >
                                {isAddingLesson ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu bài giảng'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
