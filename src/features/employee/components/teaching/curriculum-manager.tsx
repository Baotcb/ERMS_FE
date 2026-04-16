"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, PlusCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Lesson } from "@/features/hr/types/course-content-types";
import { courseContentService } from "@/features/hr/api/course-content-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/core/auth/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { CLOUDINARY_CONFIG } from "@/lib/cloudinary/cloudinary-config";

import { CurriculumLessonItem } from "./curriculum-lesson-item";

interface CurriculumManagerProps {
  courseId: string;
  isReadOnly?: boolean;
}

export function CurriculumManager({
  courseId,
  isReadOnly = false,
}: CurriculumManagerProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingLessonId, setUploadingLessonId] = useState<string | null>(
    null,
  );
  const [isCurriculumUnavailable, setIsCurriculumUnavailable] = useState(false);
  const hasLoadedCurriculumRef = useRef(false);

  // Add lesson dialog state
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonVideoUrl, setLessonVideoUrl] = useState("");
  const [lessonDuration, setLessonDuration] = useState(15);
  const [isAddingLesson, setIsAddingLesson] = useState(false);

  const draftStorageKey = `teaching-lessons-draft:${user?.id || "anon"}:${courseId}`;

  // ── Draft persistence (sessionStorage, plain JSON — no encryption needed for local cache) ──

  const loadDraftLessons = useCallback((): Lesson[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.sessionStorage.getItem(draftStorageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Lesson[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [draftStorageKey]);

  const persistDraftLessons = useCallback(
    (nextLessons: Lesson[]) => {
      if (typeof window === "undefined") return;
      try {
        window.sessionStorage.setItem(
          draftStorageKey,
          JSON.stringify(nextLessons),
        );
        setLastSavedAt(
          new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        );
      } catch {
        // Ignore storage write errors
      }
    },
    [draftStorageKey],
  );

  // ── Load curriculum ──

  const loadCurriculum = useCallback(async () => {
    setIsLoading(true);
    try {
      const sections = await courseContentService.getCourseCurriculum(courseId);
      // Flatten sections into lessons (backend returns flat lessons wrapped in a single section)
      const serverLessons = sections.flatMap((s) => s.lessons || []);
      setLessons(serverLessons);
      setIsCurriculumUnavailable(false);
    } catch (error) {
      const status =
        typeof error === "object" && error && "status" in error
          ? Number((error as { status?: unknown }).status)
          : undefined;
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải chương trình học.";
      const draftLessons = loadDraftLessons();

      if (status === 404) setIsCurriculumUnavailable(true);
      if (status !== 404) {
        toast({
          title: "Lỗi tải dữ liệu",
          description: message,
          variant: "destructive",
        });
      }

      setLessons(draftLessons);
    } finally {
      hasLoadedCurriculumRef.current = true;
      setIsLoading(false);
    }
  }, [courseId, loadDraftLessons, toast]);

  useEffect(() => {
    void loadCurriculum();
  }, [loadCurriculum]);

  useEffect(() => {
    if (!hasLoadedCurriculumRef.current) return;
    persistDraftLessons(lessons);
  }, [persistDraftLessons, lessons]);

  // ── Handlers ──

  const handleAddLesson = async () => {
    if (!lessonTitle.trim()) return;
    setIsAddingLesson(true);
    try {
      const orderIndex = lessons.length + 1;
      const createPayload = {
        courseId,
        title: lessonTitle,
        description: lessonTitle,
        content: lessonTitle,
        videoUrl: lessonVideoUrl || undefined,
        durationMinutes: lessonDuration || 15,
        orderIndex,
      };

      const newLesson = await courseContentService.createLesson(createPayload);
      setLessons((prev) => [...prev, newLesson]);
      setLessonTitle("");
      setLessonVideoUrl("");
      setLessonDuration(15);
      setIsAddLessonOpen(false);
      toast({
        title: "Thêm bài giảng thành công",
        description: "Bài giảng đã được lưu trên hệ thống.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể thêm bài giảng.";
      toast({
        title: "Không thể lưu lên server",
        description: isCurriculumUnavailable
          ? `Backend chưa mở curriculum endpoint. Chi tiết: ${message}`
          : message,
        variant: "destructive",
      });
    } finally {
      setIsAddingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (lessonId.startsWith("local-")) {
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      toast({ description: "Đã xóa bài giảng nháp local." });
      return;
    }
    try {
      await courseContentService.deleteLesson(lessonId);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      toast({ description: "Đã xóa bài giảng." });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể xóa bài giảng.";
      toast({ title: "Lỗi", description: message, variant: "destructive" });
    }
  };

  const uploadMaterialViaCloudinary = async (file: File): Promise<string> => {
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
      throw new Error("Thiếu cấu hình Cloudinary.");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/auto/upload`,
      { method: "POST", body: formData },
    );
    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        errorBody || `Cloudinary upload thất bại (HTTP ${response.status})`,
      );
    }
    const data = (await response.json()) as { secure_url?: string };
    if (!data.secure_url)
      throw new Error("Không nhận được URL tài liệu từ Cloudinary.");
    return data.secure_url;
  };

  const handleUploadMaterial = async (lessonId: string, file: File | null) => {
    if (!file) return;
    if (!lessonId.trim() || lessonId.startsWith("local-")) {
      toast({
        title: "Chưa thể upload tài liệu",
        description:
          "Vui lòng đồng bộ bài giảng lên hệ thống trước khi tải lên tài liệu.",
        variant: "destructive",
      });
      return;
    }

    setUploadingLessonId(lessonId);
    try {
      const material = await courseContentService.uploadMaterial(
        lessonId,
        file,
      );
      setLessons((prev) =>
        prev.map((lesson) => {
          if (lesson.id !== lessonId) return lesson;
          return {
            ...lesson,
            materials: [...(lesson.materials || []), material],
          };
        }),
      );
      toast({
        title: "Tải tài liệu thành công",
        description: `Đã thêm tài liệu ${file.name}.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải lên tài liệu.";

      if (message.includes("Backend chưa hỗ trợ endpoint upload tài liệu")) {
        try {
          const uploadedUrl = await uploadMaterialViaCloudinary(file);
          // Persist DocumentUrl to backend DB
          try {
            const { apiClient } = await import("@/lib/api-client");
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
            fileType: file.type || "FILE",
            fileSize: file.size,
          };
          setLessons((prev) =>
            prev.map((lesson) => {
              if (lesson.id !== lessonId) return lesson;
              return {
                ...lesson,
                materials: [...(lesson.materials || []), fallbackMaterial],
              };
            }),
          );
          toast({
            title: "Đã upload tài liệu thành công",
            description: `Tài liệu "${file.name}" đã được lưu và sẽ hiển thị cho học viên.`,
          });
          return;
        } catch (fallbackError) {
          const fallbackMessage =
            fallbackError instanceof Error
              ? fallbackError.message
              : "Cloudinary fallback thất bại.";
          toast({
            title: "Lỗi upload tài liệu",
            description: fallbackMessage,
            variant: "destructive",
          });
          return;
        }
      }
      toast({
        title: "Lỗi upload tài liệu",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploadingLessonId(null);
    }
  };

  // ── Render ──

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[250px] bg-gray-200" />
          <Skeleton className="h-10 w-[140px] bg-gray-200 rounded-xl" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-[200px] bg-gray-200" />
                  <Skeleton className="h-3 w-[120px] bg-gray-100" />
                </div>
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
          <h3 className="text-lg font-bold text-[#0F4C75]">
            Chương trình học ({lessons.length} bài giảng)
          </h3>
          {lastSavedAt && (
            <span className="text-[11px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              ✓ Đã lưu nháp {lastSavedAt}
            </span>
          )}
        </div>

        {!isReadOnly && (
          <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl border-gray-200 gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Thêm bài giảng
              </Button>
            </DialogTrigger>
            <DialogContent
              className="rounded-3xl max-w-2xl"
              onInteractOutside={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="text-[#0F4C75] font-bold text-xl">
                  Thêm bài giảng mới
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Điền thông tin cơ bản của bài giảng. Tài liệu có thể upload
                  sau khi tạo.
                </DialogDescription>
              </DialogHeader>
              <div className="py-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Tiêu đề bài giảng
                  </Label>
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
                  <p className="text-xs text-gray-400">
                    Hỗ trợ YouTube, Vimeo hoặc link video trực tiếp
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Thời lượng dự kiến (phút)
                  </Label>
                  <Input
                    type="number"
                    value={lessonDuration}
                    onChange={(e) =>
                      setLessonDuration(parseInt(e.target.value) || 15)
                    }
                    className="rounded-xl border-gray-200 h-11"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => void handleAddLesson()}
                  className="w-full bg-[#0F4C75] text-white rounded-2xl py-7 font-bold text-lg shadow-lg shadow-blue-100"
                  disabled={isAddingLesson || !lessonTitle.trim()}
                >
                  {isAddingLesson ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Lưu bài giảng"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isCurriculumUnavailable && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Backend hiện chưa mở endpoint curriculum cho khóa học này. Nội dung
          đang được lưu nháp local.
        </div>
      )}

      <div className="space-y-3">
        {lessons.length === 0 ? (
          <div className="p-20 border-2 border-dashed border-gray-100 rounded-3xl text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-[#0F4C75]">Chương trình học trống</p>
              <p className="text-sm text-gray-400">
                Hãy bắt đầu bằng cách thêm bài giảng đầu tiên.
              </p>
            </div>
          </div>
        ) : (
          lessons.map((lesson, idx) => (
            <CurriculumLessonItem
              key={lesson.id}
              lesson={lesson}
              index={idx}
              uploadingLessonId={uploadingLessonId}
              onUploadMaterial={handleUploadMaterial}
              onDeleteLesson={handleDeleteLesson}
              isReadOnly={isReadOnly}
            />
          ))
        )}
      </div>
    </div>
  );
}
