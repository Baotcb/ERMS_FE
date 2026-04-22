"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { BookOpen, MessageSquare } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { CourseFeedbackDto } from "@/features/employee/api/feedback-service";
import type { Course } from "@/features/hr/types/course-types";

import { CoursesTab } from "./courses-tab";
import { FeedbackTab } from "./feedback-tab";

export function HRCoursesView({
  tab,
  search,
  courseFilter,
  initialCourses,
  initialFeedbacks,
}: {
  tab: string;
  search: string;
  courseFilter: string;
  initialCourses: Course[];
  initialFeedbacks: CourseFeedbackDto[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebouncedValue(localSearch, 300);

  const updateUrl = useCallback(
    (newTab: string, newSearch: string, newCourseFilter: string) => {
      const params = new URLSearchParams();
      if (newTab !== "courses") params.set("tab", newTab);
      if (newSearch) params.set("search", newSearch);
      if (newCourseFilter !== "all")
        params.set("courseFilter", newCourseFilter);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname],
  );

  useEffect(() => {
    if (debouncedSearch !== search) {
      updateUrl(tab, debouncedSearch, courseFilter);
    }
  }, [debouncedSearch, search, tab, courseFilter, updateUrl]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header + Tabs */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-primary">
            Quản lý khóa học
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách khóa học và phản hồi từ học viên.
          </p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1 flex-shrink-0">
          <button
            onClick={() => {
              setLocalSearch(""); // Clear search when switching tabs
              updateUrl("courses", "", courseFilter);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === "courses" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <BookOpen className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Khóa học
          </button>
          <button
            onClick={() => {
              setLocalSearch(""); // Clear search when switching tabs
              updateUrl("feedback", "", courseFilter);
            }}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${tab === "feedback" ? "bg-white text-brand-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <MessageSquare className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            Phản hồi
          </button>
        </div>
      </div>

      {tab === "courses" ? (
        <CoursesTab
          courses={initialCourses}
          localSearch={localSearch}
          onSearchChange={setLocalSearch}
        />
      ) : (
        <FeedbackTab
          feedbacks={initialFeedbacks}
          localSearch={localSearch}
          onSearchChange={setLocalSearch}
          courseFilter={courseFilter}
          onCourseFilterChange={(cf) => updateUrl("feedback", localSearch, cf)}
        />
      )}
    </div>
  );
}
