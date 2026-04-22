"use client";

import { useState } from "react";
import {
  CheckCircle2,
  PlayCircle,
  Lock,
  Loader2,
  ChevronDown,
} from "lucide-react";
import type {
  CourseSection,
  Lesson,
} from "@/features/hr/types/course-content-types";
import type { CourseProgressDto } from "@/features/employee/types/learning-quiz-types";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface LessonSidebarProps {
  courseName: string;
  sections: CourseSection[];
  allLessons: Lesson[];
  completedLessonSet: Set<string>;
  lessonIndexMap: Map<string, number>;
  activeLessonId: string;
  isLoading: boolean;
  progress: CourseProgressDto | null;
  completedCount: number;
  totalLessons: number;
  onSelectLesson: (lessonId: string) => void;
}

export function LessonSidebar(props: LessonSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );
  const [prevSectionsLength, setPrevSectionsLength] = useState(
    props.sections.length,
  );

  // Mở tất cả module accordion lần đầu tiên khi API vừa tải xong
  if (
    props.sections.length > 0 &&
    props.sections.length !== prevSectionsLength
  ) {
    setPrevSectionsLength(props.sections.length);
    setExpandedModules(new Set(props.sections.map((s) => s.id)));
  }

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const listContent = (
    <div className="flex flex-col h-full bg-white">
      {/* ── Course Title ── */}
      <div className="px-5 py-5 border-b border-gray-100 shrink-0">
        <h2 className="text-lg font-bold text-brand-primary leading-snug">
          {props.courseName}
        </h2>
      </div>

      {/* ── Module Accordion List ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {props.isLoading ? (
          <div className="p-6 flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tải...
          </div>
        ) : props.allLessons.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">
            <p>Chưa có bài học nào.</p>
          </div>
        ) : (
          <div>
            {props.sections.map((section, sIdx) => {
              const sectionLessons = section.lessons || [];
              const isFakeSection =
                props.sections.length === 1 &&
                section.title === "Course Lessons";
              const isExpanded =
                isFakeSection || expandedModules.has(section.id);

              return (
                <div
                  key={section.id}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  {/* Module Header */}
                  {!isFakeSection && (
                    <button
                      type="button"
                      onClick={() => toggleModule(section.id)}
                      className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-gray-50/50 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-semibold text-brand-medium mb-0.5">
                          Chương {sIdx + 1}
                        </p>
                        <p className="text-sm font-bold text-brand-primary leading-snug">
                          {section.title}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                  )}

                  {/* Lesson Items */}
                  {isExpanded && (
                    <div className={isFakeSection ? "py-2" : "pb-2"}>
                      {sectionLessons.map((lesson: Lesson) => {
                        const gIdx = props.lessonIndexMap.get(lesson.id) ?? -1;
                        const isCompleted = props.completedLessonSet.has(
                          lesson.id,
                        );
                        const isActive = props.activeLessonId === lesson.id;
                        const isLocked =
                          gIdx > 0 &&
                          !props.completedLessonSet.has(
                            props.allLessons[gIdx - 1].id,
                          );

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => {
                              if (!isLocked) props.onSelectLesson(lesson.id);
                            }}
                            disabled={isLocked}
                            className={`
                                                            w-full text-left pl-5 pr-4 py-3 flex items-center gap-3 transition-colors relative
                                                            ${
                                                              isLocked
                                                                ? "text-gray-400 cursor-not-allowed"
                                                                : isActive
                                                                  ? "bg-[#F0F9FF]"
                                                                  : "hover:bg-gray-50"
                                                            }
                                                        `}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-brand-secondary" />
                            )}

                            {isLocked ? (
                              <Lock className="w-5 h-5 text-gray-300 shrink-0" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            ) : isActive ? (
                              <PlayCircle className="w-5 h-5 text-brand-medium shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
                            )}

                            <div className="min-w-0">
                              <p
                                className={`text-sm leading-snug truncate ${
                                  isActive
                                    ? "font-semibold text-brand-primary"
                                    : "text-gray-700"
                                }`}
                              >
                                {lesson.title}
                              </p>
                              {lesson.durationMinutes ? (
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {lesson.durationMinutes} phút
                                </p>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block rounded-2xl border border-gray-200 bg-white overflow-hidden h-fit max-h-[calc(100vh-100px)] sticky top-[72px] shadow-sm">
        {listContent}
      </aside>

      {/* Mobile Drawer */}
      <div className="lg:hidden bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-brand-primary text-sm">
            {props.courseName}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {props.completedCount}/{props.totalLessons} bài hoàn thành
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl">
              <Menu className="w-4 h-4" />
              Mục lục
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[85vw] max-w-[360px] p-0 flex flex-col"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Mục lục khóa học</SheetTitle>
            </SheetHeader>
            {listContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
