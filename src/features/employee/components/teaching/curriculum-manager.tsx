'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
    PlusCircle, GripVertical, FileText,
    Trash2, Loader2, MoreVertical, Clock, Layers, Upload, Paperclip, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CourseSection } from '@/features/hr/types/course-content-types';
import { courseContentService } from '@/features/hr/api/course-content-service';
import { useToast } from '@/hooks/use-toast';
import { CLOUDINARY_CONFIG } from '@/lib/cloudinary/cloudinary-config';

interface CurriculumManagerProps {
    courseId: string;
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

export function CurriculumManager({ courseId }: CurriculumManagerProps) {
    const { toast } = useToast();
    const [sections, setSections] = useState<CourseSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');

    // Lesson addition state
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [lessonTitle, setLessonTitle] = useState('');

    const [lessonDuration, setLessonDuration] = useState(15);
    const [isAddingLesson, setIsAddingLesson] = useState(false);
    const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
    const [syncingLessonId, setSyncingLessonId] = useState<string | null>(null);
    const [isCurriculumUnavailable, setIsCurriculumUnavailable] = useState(false);
    const hasLoadedCurriculumRef = useRef(false);

    const isLocalId = (id: string) => id.startsWith('local-');
    const isUnsyncedLessonId = (id: string) => !id.trim() || isLocalId(id);
    const draftStorageKey = `teaching-curriculum-draft:${courseId}`;
    const materialMirrorStorageKey = `teaching-materials-draft:${courseId}`;

    const loadDraftSections = useCallback((): CourseSection[] => {
        if (typeof window === 'undefined') {
            return [];
        }

        try {
            const raw = window.localStorage.getItem(draftStorageKey);
            if (!raw) {
                return [];
            }

            const parsed = JSON.parse(raw) as CourseSection[];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }, [draftStorageKey]);

    const persistDraftSections = useCallback((nextSections: CourseSection[]) => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            window.localStorage.setItem(draftStorageKey, JSON.stringify(nextSections));
        } catch {
            // Ignore storage write errors to avoid breaking UI actions.
        }
    }, [draftStorageKey]);

    const persistMaterialMirror = useCallback((nextSections: CourseSection[]) => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const mirror: MaterialMirrorItem[] = nextSections
                .flatMap((section) => section.lessons || [])
                .map((lesson) => ({
                    lessonId: lesson.id,
                    orderIndex: lesson.orderIndex,
                    lessonTitle: lesson.title,
                    materials: (lesson.materials || []).map((material) => ({
                        id: material.id,
                        lessonId: material.lessonId,
                        title: material.title,
                        fileUrl: material.fileUrl,
                        fileType: material.fileType,
                        fileSize: material.fileSize,
                    })),
                }))
                .filter((item) => item.materials.length > 0);

            window.localStorage.setItem(materialMirrorStorageKey, JSON.stringify(mirror));
        } catch {
            // Ignore storage write errors to avoid blocking uploads.
        }
    }, [materialMirrorStorageKey]);

    const mergeServerWithDraft = useCallback((serverSections: CourseSection[], draftSections: CourseSection[]) => {
        if (!draftSections.length) {
            return serverSections;
        }

        const draftBySectionId = new Map(draftSections.map(section => [section.id, section]));

        const mergedServerSections = serverSections.map((serverSection) => {
            const draftSection = draftBySectionId.get(serverSection.id);
            if (!draftSection) {
                return serverSection;
            }

            const localDraftLessons = (draftSection.lessons || []).filter((lesson) => isLocalId(lesson.id));
            if (!localDraftLessons.length) {
                return serverSection;
            }

            return {
                ...serverSection,
                lessons: [...serverSection.lessons, ...localDraftLessons],
            };
        });

        const localDraftSections = draftSections.filter((section) => isLocalId(section.id));
        return [...mergedServerSections, ...localDraftSections];
    }, []);

    const loadCurriculum = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await courseContentService.getCourseCurriculum(courseId);
            const draftSections = loadDraftSections();
            const mergedSections = mergeServerWithDraft(data || [], draftSections);
            setSections(mergedSections);
            setIsCurriculumUnavailable(false);

            if (draftSections.length > 0) {
                toast({
                    title: 'Đã khôi phục bản nháp nội dung học',
                    description: 'Các phần nháp local đã được nạp lại cho khóa học này.',
                });
            }
        } catch (error) {
            const status = typeof error === 'object' && error && 'status' in error
                ? Number((error as { status?: unknown }).status)
                : undefined;
            const message = error instanceof Error ? error.message : 'Không thể tải chương trình học.';

            const draftSections = loadDraftSections();

            if (status === 404) {
                setIsCurriculumUnavailable(true);
            }

            if (status !== 404) {
                toast({ title: 'Lỗi tải dữ liệu', description: message, variant: 'destructive' });
            }

            setSections(draftSections);

            if (draftSections.length > 0) {
                toast({
                    title: 'Đã nạp dữ liệu nháp local',
                    description: 'Backend chưa trả curriculum, đang hiển thị bản nháp local đã lưu.',
                });
            }
        } finally {
            hasLoadedCurriculumRef.current = true;
            setIsLoading(false);
        }
    }, [courseId, loadDraftSections, mergeServerWithDraft, toast]);

    useEffect(() => {
        void loadCurriculum();
    }, [loadCurriculum]);

    useEffect(() => {
        if (!hasLoadedCurriculumRef.current) {
            return;
        }

        persistDraftSections(sections);
        persistMaterialMirror(sections);
    }, [persistDraftSections, persistMaterialMirror, sections]);

    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        setIsAddingSection(true);
        try {
            const newSection: CourseSection = {
                id: `local-${Math.random().toString(36).substr(2, 9)}`,
                courseId,
                title: newSectionTitle,
                orderIndex: sections.length + 1,
                lessons: []
            };
            setSections([...sections, newSection]);
            setNewSectionTitle('');
            toast({
                title: 'Đã thêm học phần nháp',
                description: 'Học phần này đang ở local draft. Chỉ bài giảng đồng bộ server mới dùng để upload tài liệu cho trainee.',
            });
        } catch {
            toast({ title: 'Lỗi', description: 'Không thể thêm học phần.', variant: 'destructive' });
        } finally {
            setIsAddingSection(false);
        }
    };

    const handleDeleteSection = (sectionId: string) => {
        setSections(prev => prev.filter(s => s.id !== sectionId));
        toast({ description: 'Đã xóa học phần.' });
    };

    const getSectionIdForCreate = (sectionId: string): string | undefined => {
        return isLocalId(sectionId) ? undefined : sectionId;
    };

    const uploadMaterialViaCloudinary = async (file: File): Promise<string> => {
        if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
            throw new Error('Thiếu cấu hình Cloudinary. Vui lòng khai báo NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME và NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorBody = await response.text().catch(() => '');
            throw new Error(errorBody || `Cloudinary upload thất bại (HTTP ${response.status})`);
        }

        const data = await response.json() as { secure_url?: string };
        if (!data.secure_url) {
            throw new Error('Không nhận được URL tài liệu từ Cloudinary.');
        }

        return data.secure_url;
    };

    const handleAddLesson = async () => {
        if (!lessonTitle.trim() || !activeSectionId) return;
        setIsAddingLesson(true);
        try {
            const targetSection = sections.find((s) => s.id === activeSectionId);
            const orderIndex = (targetSection?.lessons.length || 0) + 1;

            if (!targetSection) {
                throw new Error('Không tìm thấy học phần để thêm bài giảng.');
            }

            const createPayload = {
                courseId,
                sectionId: getSectionIdForCreate(targetSection.id),
                title: lessonTitle,
                description: lessonTitle,
                content: lessonTitle,

                durationMinutes: lessonDuration || 15,
                orderIndex,
            };

            const newLesson = await courseContentService.createLesson(createPayload);

            setSections(prev => prev.map(s =>
                s.id === activeSectionId
                    ? { ...s, lessons: [...s.lessons, newLesson] }
                    : s
            ));

            setLessonTitle('');

            setActiveSectionId(null);
            toast({ title: 'Đã đồng bộ server', description: 'Bài giảng đã được lưu trên hệ thống.' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể thêm bài giảng.';
            const missingServerSectionHint = isLocalId(activeSectionId || '')
                ? ' Học phần hiện chưa có ID backend nên lesson có thể bị backend từ chối (400).'
                : '';
            toast({
                title: 'Không thể lưu lên server',
                description: isCurriculumUnavailable
                    ? `Backend chưa mở curriculum endpoint hoặc chưa đúng contract. Chi tiết: ${message}${missingServerSectionHint}`
                    : `${message}${missingServerSectionHint}`,
                variant: 'destructive',
            });
        } finally {
            setIsAddingLesson(false);
        }
    };

    const handleSyncLocalLesson = async (sectionId: string, lessonId: string) => {
        const section = sections.find((s) => s.id === sectionId);
        const lesson = section?.lessons.find((l) => l.id === lessonId);

        if (!section || !lesson || !isLocalId(lesson.id)) {
            return;
        }

        setSyncingLessonId(lessonId);
        try {
            const syncedLesson = await courseContentService.createLesson({
                courseId,
                sectionId: getSectionIdForCreate(sectionId),
                title: lesson.title,
                description: lesson.description,
                content: lesson.content,

                durationMinutes: lesson.durationMinutes,
                orderIndex: lesson.orderIndex,
            });

            setSections((prev) => prev.map((s) => {
                if (s.id !== sectionId) {
                    return s;
                }

                return {
                    ...s,
                    lessons: s.lessons.map((l) => l.id === lessonId ? syncedLesson : l),
                };
            }));

            toast({ title: 'Đồng bộ thành công', description: 'Lesson đã được đẩy lên server, có thể upload tài liệu.' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể đồng bộ lesson lên server.';
            toast({ title: 'Đồng bộ thất bại', description: message, variant: 'destructive' });
        } finally {
            setSyncingLessonId(null);
        }
    };

    const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
        if (isLocalId(lessonId)) {
            setSections(prev => prev.map(s =>
                s.id === sectionId
                    ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
                    : s
            ));
            toast({ description: 'Đã xóa bài giảng nháp local.' });
            return;
        }

        try {
            await courseContentService.deleteLesson(lessonId);
            setSections(prev => prev.map(s =>
                s.id === sectionId
                    ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) }
                    : s
            ));
            toast({ description: 'Đã xóa bài giảng.' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể xóa bài giảng.';
            toast({ title: 'Lỗi', description: message, variant: 'destructive' });
        }
    };

    const handleUploadMaterial = async (lessonId: string, file: File | null) => {
        if (!file) {
            return;
        }

        if (isUnsyncedLessonId(lessonId)) {
            toast({
                title: 'Chưa thể upload tài liệu',
                description: 'Bài giảng này chưa có ID backend hợp lệ. Hãy bấm Đồng bộ server cho lesson trước khi upload tài liệu.',
                variant: 'destructive',
            });
            return;
        }

        setUploadingLessonId(lessonId);
        try {
            const material = await courseContentService.uploadMaterial(lessonId, file);
            setSections((prev) => prev.map((section) => ({
                ...section,
                lessons: section.lessons.map((lesson) => {
                    if (lesson.id !== lessonId) {
                        return lesson;
                    }

                    return {
                        ...lesson,
                        materials: [...(lesson.materials || []), material],
                    };
                }),
            })));

            toast({ title: 'Tải tài liệu thành công', description: `Đã thêm tài liệu ${file.name}.` });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể tải lên tài liệu.';

            if (message.includes('Backend chưa hỗ trợ endpoint upload tài liệu')) {
                try {
                    const uploadedUrl = await uploadMaterialViaCloudinary(file);
                    const fallbackMaterial = {
                        id: `local-material-${Date.now()}`,
                        lessonId,
                        title: file.name,
                        fileUrl: uploadedUrl,
                        fileType: file.type || 'FILE',
                        fileSize: file.size,
                    };

                    setSections((prev) => prev.map((section) => ({
                        ...section,
                        lessons: section.lessons.map((lesson) => {
                            if (lesson.id !== lessonId) {
                                return lesson;
                            }

                            return {
                                ...lesson,
                                materials: [...(lesson.materials || []), fallbackMaterial],
                            };
                        }),
                    })));

                    toast({
                        title: 'Đã upload tài liệu (Cloudinary)',
                        description: 'Backend chưa có endpoint material, hệ thống đã dùng Cloudinary fallback để trainee vẫn xem được tài liệu.',
                    });
                    return;
                } catch (fallbackError) {
                    const fallbackMessage = fallbackError instanceof Error ? fallbackError.message : 'Cloudinary fallback thất bại.';
                    toast({ title: 'Lỗi upload tài liệu', description: fallbackMessage, variant: 'destructive' });
                    return;
                }
            }

            toast({ title: 'Lỗi upload tài liệu', description: message, variant: 'destructive' });
        } finally {
            setUploadingLessonId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
                <p className="text-gray-400 font-medium">Đang tải chương trình học...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0F4C75]">Chương trình học ({sections.length} học phần)</h3>
                <div className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-gray-200 gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Thêm học phần
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-[#0F4C75] font-bold">Thêm học phần mới</DialogTitle>
                                <DialogDescription className="text-sm text-gray-500">Nhập tiêu đề để tổ chức các bài giảng trong khóa học.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="section-title" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề học phần</Label>
                                    <Input 
                                        id="section-title" 
                                        placeholder="VD: Chương 1: Giới thiệu..." 
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                        className="rounded-xl border-gray-200 h-11"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddSection} disabled={isAddingSection} className="w-full bg-[#0F4C75] text-white rounded-xl py-6 font-bold">
                                    {isAddingSection ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Thêm học phần'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {isCurriculumUnavailable ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Backend hiện chưa mở endpoint curriculum cho khóa học này. Nội dung đang được lưu nháp local và tự khôi phục khi tải lại trang.
                </div>
            ) : null}

            <div className="space-y-6">
                {sections.length === 0 ? (
                    <div className="p-20 border-2 border-dashed border-gray-100 rounded-3xl text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-[#0F4C75]">Chương trình học trống</p>
                            <p className="text-sm text-gray-400">Hãy bắt đầu bằng cách thêm học phần đầu tiên.</p>
                        </div>
                    </div>
                ) : (
                    sections.map((section, sIdx) => (
                        <div key={section.id} className="bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="p-5 flex items-center justify-between bg-white border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Học phần {sIdx + 1}</span>
                                        <h4 className="font-bold text-[#0F4C75] text-lg">{section.title}</h4>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDeleteSection(section.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-5 space-y-3">
                                {section.lessons.map((lesson, lIdx) => (
                                    <div key={lesson.id} className="space-y-3">
                                        <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-[#3282B8]/30 hover:shadow-md transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-50 text-[#3282B8] rounded-xl flex items-center justify-center text-sm font-bold">
                                                    {lIdx + 1}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-gray-800 group-hover:text-[#3282B8] transition-colors">{lesson.title}</h5>
                                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                        {isLocalId(lesson.id) ? (
                                                            <span className="flex items-center gap-1 text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                                                Nháp local
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                                Đã đồng bộ
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                                                                <FileText className="w-3 h-3" /> Văn bản
                                                            </span>
                                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                                                            <Clock className="w-3 h-3" /> {lesson.durationMinutes} phút
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isLocalId(lesson.id) ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl border-amber-300 text-amber-700 hover:bg-amber-50"
                                                        onClick={() => void handleSyncLocalLesson(section.id, lesson.id)}
                                                        disabled={syncingLessonId === lesson.id || uploadingLessonId === lesson.id}
                                                    >
                                                        {syncingLessonId === lesson.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                                        ) : (
                                                            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                                        )}
                                                        Đồng bộ server
                                                    </Button>
                                                ) : null}
                                                <Button asChild variant="outline" size="sm" className="rounded-xl border-gray-200">
                                                    <label htmlFor={`upload-material-${lesson.id}`} className="cursor-pointer inline-flex items-center gap-1.5">
                                                        {uploadingLessonId === lesson.id ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Upload className="w-3.5 h-3.5" />
                                                        )}
                                                        {isUnsyncedLessonId(lesson.id) ? 'Lesson chưa sync' : 'Upload tài liệu'}
                                                    </label>
                                                </Button>
                                                <input
                                                    id={`upload-material-${lesson.id}`}
                                                    type="file"
                                                    className="hidden"
                                                    onChange={(event) => {
                                                        void handleUploadMaterial(lesson.id, event.target.files?.[0] || null);
                                                        event.target.value = '';
                                                    }}
                                                    disabled={uploadingLessonId === lesson.id || isUnsyncedLessonId(lesson.id)}
                                                />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl min-w-[160px]">
                                                        <DropdownMenuItem
                                                            className="gap-2 font-medium text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            onClick={() => handleDeleteLesson(section.id, lesson.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Xóa bài giảng
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        {lesson.materials && lesson.materials.length > 0 ? (
                                            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
                                                <p className="text-[11px] font-bold text-[#0F4C75] uppercase tracking-wider mb-2">Tài liệu học tập ({lesson.materials.length})</p>
                                                <div className="space-y-1.5">
                                                    {lesson.materials.map((material) => (
                                                        <a
                                                            key={material.id}
                                                            href={material.fileUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center justify-between rounded-lg bg-white border border-blue-100 px-3 py-2 text-sm text-[#0F4C75] hover:border-blue-300"
                                                        >
                                                            <span className="inline-flex items-center gap-2 truncate">
                                                                <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                                                <span className="truncate">{material.title || 'Tài liệu đính kèm'}</span>
                                                            </span>
                                                            <span className="text-[11px] text-gray-500 ml-3 shrink-0">{material.fileType || 'FILE'}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                ))}

                                <Dialog open={activeSectionId === section.id} onOpenChange={(open) => !open && setActiveSectionId(null)}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setActiveSectionId(section.id)}
                                            className="w-full border border-dashed border-gray-200 rounded-2xl py-8 hover:bg-blue-50 hover:border-blue-200 hover:text-[#0F4C75] text-gray-400 gap-2 transition-all font-bold group"
                                        >
                                            <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            Thêm bài giảng mới
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-3xl max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-[#0F4C75] font-bold text-xl">Thêm bài giảng mới</DialogTitle>
                                            <DialogDescription className="text-sm text-gray-500">Điền thông tin cơ bản của bài giảng trước khi upload tài liệu học tập.</DialogDescription>
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
                                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thời lượng dự kiến (phút)</Label>
                                                    <Input 
                                                        type="number"
                                                        value={lessonDuration}
                                                        onChange={(e) => setLessonDuration(parseInt(e.target.value))}
                                                        className="rounded-xl border-gray-200 h-11"
                                                    />
                                                </div>
                                        </div>
                                        <DialogFooter>
                                            <Button 
                                                onClick={handleAddLesson} 
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
                    ))
                )}
            </div>
        </div>
    );
}

