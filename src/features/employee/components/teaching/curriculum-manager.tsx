'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, PlusCircle, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CourseSection, Material } from '@/features/hr/types/course-content-types';
import { courseContentService } from '@/features/hr/api/course-content-service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/core/auth/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { CLOUDINARY_CONFIG } from '@/lib/cloudinary/cloudinary-config';
import { encryptData, decryptData } from '@/features/core/utils/encryption';
import { saveLessonMaterial } from '@/features/hr/utils/lesson-materials-bridge';
import { CurriculumSectionItem } from './curriculum-section-item';

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
    const { user } = useAuth();
    const [sections, setSections] = useState<CourseSection[]>([]);
    const [lastSavedAt, setLastSavedAt] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');

    // Lesson addition state is now encapsulated in CurriculumSectionItem
    const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(null);
    const [syncingLessonId, setSyncingLessonId] = useState<string | null>(null);
    const [isCurriculumUnavailable, setIsCurriculumUnavailable] = useState(false);
    const hasLoadedCurriculumRef = useRef(false);

    const isLocalId = (id: string) => id.startsWith('local-');
    const isUnsyncedLessonId = (id: string) => !id.trim() || isLocalId(id);
    const draftStorageKey = `teaching-curriculum-draft:${user?.id || 'anon'}:${courseId}`;
    const materialMirrorStorageKey = `teaching-materials-draft:${user?.id || 'anon'}:${courseId}`;

    const loadDraftSections = useCallback((): CourseSection[] => {
        if (typeof window === 'undefined') {
            return [];
        }

        try {
            const raw = window.localStorage.getItem(draftStorageKey);
            if (!raw) {
                return [];
            }

            // Attempt decryption. If it fails (e.g., legacy plain text draft), fallback to raw.
            let decrypted = decryptData(raw);
            if (!decrypted) {
                decrypted = raw;
            }

            const parsed = JSON.parse(decrypted) as CourseSection[];
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
            const encryptedData = encryptData(JSON.stringify(nextSections));
            window.localStorage.setItem(draftStorageKey, encryptedData);
            setLastSavedAt(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
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

            const encryptedData = encryptData(JSON.stringify(mirror));
            window.localStorage.setItem(materialMirrorStorageKey, encryptedData);
        } catch {
            // Ignore storage write errors to avoid blocking uploads.
        }
    }, [materialMirrorStorageKey]);

    const loadMaterialMirror = useCallback((): Record<string, Material[]> => {
        if (typeof window === 'undefined') return {};
        try {
            const raw = window.localStorage.getItem(materialMirrorStorageKey);
            if (!raw) return {};

            let decrypted = decryptData(raw);
            if (!decrypted) {
                decrypted = raw;
            }

            const parsed = JSON.parse(decrypted) as MaterialMirrorItem[];
            const result: Record<string, Material[]> = {};
            for (const item of parsed) {
                if (item.materials && item.materials.length > 0) {
                    result[item.lessonId] = item.materials;
                }
            }
            return result;
        } catch {
            return {};
        }
    }, [materialMirrorStorageKey]);

    const mergeServerWithDraft = useCallback((serverSections: CourseSection[], draftSections: CourseSection[]) => {
        const materialMirror = loadMaterialMirror();
        const serverLessonsFlat = serverSections.flatMap(s => s.lessons || []);
        const serverLessonMap = new Map(serverLessonsFlat.map(l => [l.id, l]));

        if (!draftSections.length && serverSections.length > 0) {
            // No draft, just return server sections with locally mirrored materials appended
            return serverSections.map(s => ({
                ...s,
                lessons: (s.lessons || []).map(lesson => {
                    const localMaterials = materialMirror[lesson.id] || [];
                    const serverMaterialIds = new Set(lesson.materials?.map(m => m.id) || []);
                    const uniqueLocalMaterials = localMaterials.filter(m => !serverMaterialIds.has(m.id));
                    return {
                        ...lesson,
                        materials: [...(lesson.materials || []), ...uniqueLocalMaterials]
                    };
                })
            }));
        }

        const usedServerLessonIds = new Set<string>();

        // 1. We process local draft sections and inject any synced server lessons back into them.
        const processedDraftSections = draftSections.map(section => {
            const processedLessons = (section.lessons || []).map(draftLesson => {
                const serverLesson = serverLessonMap.get(draftLesson.id);
                // If the lesson exists on the server, we use the server data 
                // but keep it in this local section structure!
                const baseLesson = serverLesson || draftLesson;
                
                if (serverLesson) {
                    usedServerLessonIds.add(serverLesson.id);
                }

                const localMaterials = materialMirror[baseLesson.id] || [];
                const serverMaterialIds = new Set(baseLesson.materials?.map(m => m.id) || []);
                const uniqueLocalMaterials = localMaterials.filter(m => !serverMaterialIds.has(m.id));

                return {
                    ...baseLesson,
                    materials: [...(baseLesson.materials || []), ...uniqueLocalMaterials]
                };
            });

            return {
                ...section,
                lessons: processedLessons
            };
        });

        // 2. Are there any server lessons that are NOT in the draft structure?
        // Maybe they were added from another device.
        const leftoverServerLessons = serverLessonsFlat.filter(l => !usedServerLessonIds.has(l.id));

        if (leftoverServerLessons.length === 0) {
            return processedDraftSections;
        }

        // 3. We have leftover server lessons. We try to put them in their original server sections.
        const missingServerSections = serverSections
            .map(s => ({
                ...s,
                // Only keep leftover lessons
                lessons: (s.lessons || []).filter(l => !usedServerLessonIds.has(l.id)).map(lesson => {
                    const localMaterials = materialMirror[lesson.id] || [];
                    const serverMaterialIds = new Set(lesson.materials?.map(m => m.id) || []);
                    const uniqueLocalMaterials = localMaterials.filter(m => !serverMaterialIds.has(m.id));
                    return {
                        ...lesson,
                        materials: [...(lesson.materials || []), ...uniqueLocalMaterials]
                    };
                })
            }))
            .filter(s => s.lessons.length > 0);

        // Deduplicate section names if the backend provided a 'Course Lessons' but we also have one
        const draftTitles = new Set(processedDraftSections.map(s => s.title.trim().toLowerCase()));
        
        const finalLeftoverSections = missingServerSections.filter(s => {
            return !draftTitles.has(s.title.trim().toLowerCase());
        });

        // If 'Course Lessons' is filtered out but it had lessons, append them to the existing one!
        missingServerSections.forEach(s => {
            if (draftTitles.has(s.title.trim().toLowerCase())) {
                const matchingDraft = processedDraftSections.find(ds => ds.title.trim().toLowerCase() === s.title.trim().toLowerCase());
                if (matchingDraft) {
                    matchingDraft.lessons.push(...s.lessons);
                }
            }
        });

        return [...finalLeftoverSections, ...processedDraftSections];
    }, [loadMaterialMirror]);

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
                    description: 'Nội dung đã lưu tạm được khôi phục thành công.',
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
                description: 'Học phần đã lưu tạm. Bài giảng cần được đồng bộ lên hệ thống trước khi đính kèm tài liệu.',
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

    const handleAddLesson = async (
        sectionId: string,
        payload: { title: string; videoUrl?: string; durationMinutes: number }
    ) => {
        const targetSection = sections.find((s) => s.id === sectionId);
        if (!targetSection) {
            toast({ title: 'Lỗi', description: 'Không tìm thấy học phần để thêm bài giảng.', variant: 'destructive' });
            return;
        }

        const orderIndex = (targetSection.lessons?.length || 0) + 1;
        
        try {
            const createPayload = {
                courseId,
                sectionId: getSectionIdForCreate(targetSection.id),
                title: payload.title,
                description: payload.title,
                content: payload.title,
                videoUrl: payload.videoUrl || undefined,
                durationMinutes: payload.durationMinutes || 15,
                orderIndex,
            };

            const newLesson = await courseContentService.createLesson(createPayload);

            setSections((prev) =>
                prev.map((s) =>
                    s.id === sectionId
                        ? { ...s, lessons: [...(s.lessons || []), newLesson] }
                        : s
                )
            );

            toast({ title: 'Thêm bài giảng thành công', description: 'Bài giảng đã được lưu trên hệ thống.' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể thêm bài giảng.';
            const missingServerSectionHint = isLocalId(sectionId)
                ? ' Học phần hiện chưa có ID backend nên lesson có thể bị backend từ chối (400).'
                : '';
            toast({
                title: 'Không thể lưu lên server',
                description: isCurriculumUnavailable
                    ? `Backend chưa mở curriculum endpoint hoặc chưa đúng contract. Chi tiết: ${message}${missingServerSectionHint}`
                    : `${message}${missingServerSectionHint}`,
                variant: 'destructive',
            });
            throw error;
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
                description: 'Vui lòng đồng bộ bài giảng lên hệ thống trước khi tải lên tài liệu.',
                variant: 'destructive',
            });
            return;
        }

        setUploadingLessonId(lessonId);
        try {
            const material = await courseContentService.uploadMaterial(lessonId, file);
            saveLessonMaterial(courseId, lessonId, material);
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

                    // Persist DocumentUrl to backend DB
                    try {
                        const { apiClient } = await import('@/lib/api-client');
                        await apiClient.put(`/api/Lessons/${lessonId}/document-url`, {
                            documentUrl: uploadedUrl,
                        });
                    } catch {
                        // Fallback: save to localStorage if PUT fails
                    }

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

                    saveLessonMaterial(courseId, lessonId, fallbackMaterial);
                    toast({
                        title: 'Đã upload tài liệu thành công',
                        description: `Tài liệu "${file.name}" đã được lưu và sẽ hiển thị cho học viên.`,
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
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-8 w-[250px] bg-gray-200" />
                    <Skeleton className="h-10 w-[140px] bg-gray-200 rounded-xl" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-gray-100 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full bg-gray-200" />
                                <Skeleton className="h-5 w-[200px] bg-gray-200" />
                                <Skeleton className="h-5 w-[100px] bg-gray-200 ml-auto" />
                            </div>
                            <div className="pl-11 space-y-2">
                                <Skeleton className="h-12 w-full bg-gray-100 rounded-xl" />
                                <Skeleton className="h-12 w-full bg-gray-100 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-[#0F4C75]">Chương trình học ({sections.length} học phần)</h3>
                    {lastSavedAt && (
                        <span className="text-[11px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                            ✓ Đã lưu nháp {lastSavedAt}
                        </span>
                    )}
                </div>
                <div className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-gray-200 gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Thêm học phần
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl max-w-md" onInteractOutside={(e) => e.preventDefault()}>
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
                        <CurriculumSectionItem
                            key={section.id}
                            section={section}
                            index={sIdx}
                            syncingLessonId={syncingLessonId}
                            uploadingLessonId={uploadingLessonId}
                            isLocalId={isLocalId}
                            isUnsyncedLessonId={isUnsyncedLessonId}
                            onDeleteSection={handleDeleteSection}
                            onAddLesson={handleAddLesson}
                            onSyncLocalLesson={handleSyncLocalLesson}
                            onUploadMaterial={handleUploadMaterial}
                            onDeleteLesson={handleDeleteLesson}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

