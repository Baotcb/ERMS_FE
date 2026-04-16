import React from "react";
import {
  Loader2,
  Trash2,
  Video,
  Clock,
  Upload,
  MoreVertical,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Lesson } from "@/features/hr/types/course-content-types";

interface CurriculumLessonItemProps {
  lesson: Lesson;
  index: number;
  uploadingLessonId: string | null;
  onUploadMaterial: (lessonId: string, file: File | null) => void;
  onDeleteLesson: (lessonId: string) => void;
  isReadOnly?: boolean;
}

export function CurriculumLessonItem({
  lesson,
  index,
  uploadingLessonId,
  onUploadMaterial,
  onDeleteLesson,
  isReadOnly = false,
}: CurriculumLessonItemProps) {
  return (
    <div className="space-y-3">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-[#3282B8]/30 hover:shadow-md transition-all">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 text-[#3282B8] rounded-xl flex items-center justify-center text-sm font-bold">
            {index + 1}
          </div>
          <div>
            <h5 className="font-bold text-gray-800 group-hover:text-[#3282B8] transition-colors">
              {lesson.title}
            </h5>
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {lesson.videoUrl && (
                <a
                  href={lesson.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full hover:bg-purple-100 transition-colors"
                >
                  <Video className="w-3 h-3" /> Video
                </a>
              )}
              <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" /> {lesson.durationMinutes} phút
              </span>
            </div>
          </div>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl border-gray-200"
            >
              <label
                htmlFor={`upload-material-${lesson.id}`}
                className="cursor-pointer inline-flex items-center gap-1.5"
              >
                {uploadingLessonId === lesson.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                Tải lên tài liệu
              </label>
            </Button>
            <input
              id={`upload-material-${lesson.id}`}
              type="file"
              className="hidden"
              onChange={(event) => {
                void onUploadMaterial(
                  lesson.id,
                  event.target.files?.[0] || null,
                );
                event.target.value = "";
              }}
              disabled={uploadingLessonId === lesson.id}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl min-w-[160px]"
              >
                <DropdownMenuItem
                  className="gap-2 font-medium text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={() => onDeleteLesson(lesson.id)}
                >
                  <Trash2 className="w-4 h-4" /> Xóa bài giảng
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      {lesson.materials && lesson.materials.length > 0 ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3">
          <p className="text-[11px] font-bold text-[#0F4C75] uppercase tracking-wider mb-2">
            Tài liệu học tập ({lesson.materials.length})
          </p>
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
                  <span className="truncate">
                    {material.title || "Tài liệu đính kèm"}
                  </span>
                </span>
                <span className="text-[11px] text-gray-500 ml-3 shrink-0">
                  {material.fileType || "FILE"}
                </span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
