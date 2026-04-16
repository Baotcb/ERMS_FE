"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ChevronLeft, Loader2 } from "lucide-react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { USER_ROLES } from "@/utils/constants";
import { courseService } from "@/features/hr/api/course-service";
import { Course, CourseResult } from "@/features/hr/types/course-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  useRouter,
  usePathname,
  useSearchParams as useBaseSearchParams,
} from "next/navigation";
import { useAsyncAction } from "@/hooks/use-async-action";

import {
  getEmployees,
  Employee,
  PaginatedResult,
} from "@/features/hr/api/employee-service";
import { normalizeEmail } from "@/features/hr/utils/course-workflow";

/** Roles that should be excluded from the trainee list */
const EXCLUDED_ROLES: Set<string> = new Set([
  USER_ROLES.DEPARTMENT_HEAD,
  USER_ROLES.DIRECTOR,
  USER_ROLES.HR_MANAGER,
  USER_ROLES.HR,
  USER_ROLES.ADMIN,
]);

function hasExcludedRole(employee: Employee): boolean {
  if (!employee.roles || employee.roles.length === 0) return false;
  return employee.roles.some((role) => EXCLUDED_ROLES.has(role));
}

import { AssignTrainerInfo } from "./assign-trainer-info";
import { AssignTraineeTable } from "./assign-trainee-table";

function parseNotifyConfig(description: string | undefined): boolean {
  const match = (description || "").match(
    /Thông báo:\s*giangvien_khi_phancong=(on|off)/i,
  );
  return match ? match[1].toLowerCase() === "on" : true;
}

export function AssignTrainingPage({
  initialCourses,
  initialTrainees,
  initialCurrentCourse,
  initialInvitedTrainer,
  initialEnrolledEmployeeIds,
  searchParams,
  isPlanClosed = false,
}: {
  initialCourses?: CourseResult;
  initialTrainees?: PaginatedResult<Employee>;
  initialCurrentCourse?: Course | null;
  initialInvitedTrainer?: Employee | null;
  initialEnrolledEmployeeIds?: string[];
  deptHeadDepartmentId?: number;
  isPlanClosed?: boolean;
  searchParams: {
    page: number;
    search: string;
    departmentId: string;
    courseId: string;
  };
}) {
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const baseSearchParams = useBaseSearchParams();
  const selectedPlanId = baseSearchParams.get("planId") || "";

  // Component States
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>([]);
  const [notifyTrainer, setNotifyTrainer] = useState(true);
  const { execute, isSubmitting } = useAsyncAction();
  const { execute: executeSelectAll, isSubmitting: isSelectingAll } =
    useAsyncAction();

  // Sync search input locally before debouncing to URL
  const [localTraineeSearch, setLocalTraineeSearch] = useState(
    searchParams.search,
  );
  const debouncedTraineeSearch = useDebouncedValue(localTraineeSearch, 300);

  const enrolledEmployeeIds = useMemo(
    () => initialEnrolledEmployeeIds || [],
    [initialEnrolledEmployeeIds],
  );
  const currentCourse = initialCurrentCourse || null;
  const invitedTrainer = initialInvitedTrainer || null;
  const traineesData = initialTrainees || {
    items: [],
    totalCount: 0,
    totalPages: 1,
  };
  const courses = initialCourses?.items || [];
  const totalPages = traineesData.totalPages || 1;
  const totalCount = traineesData.totalCount || 0;

  const normalizedTrainerEmail = useMemo(
    () => normalizeEmail(currentCourse?.trainerEmail),
    [currentCourse?.trainerEmail],
  );

  // Filter valid potential trainees (excluding trainer and special roles)
  const potentialTrainees = useMemo(() => {
    return traineesData.items.filter((employee) => {
      // Exclude the trainer
      if (invitedTrainer?.id && employee.id === invitedTrainer.id) return false;
      // Exclude special roles (DeptHead, Director, HR, Admin)
      if (hasExcludedRole(employee)) return false;
      return true;
    });
  }, [invitedTrainer, traineesData.items]);

  // Handle "Select All" checking only valid potential trainees
  const assignableTrainees = useMemo(() => {
    return potentialTrainees.filter(
      (t: Employee) => !enrolledEmployeeIds.includes(t.id),
    );
  }, [potentialTrainees, enrolledEmployeeIds]);

  // Update URL Helper
  const updateUrl = useCallback(
    (updates: Record<string, string | number>) => {
      const urlParams = new URLSearchParams(baseSearchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val === "" || val === "all" || val === 1) {
          if (key === "page" && val === 1) urlParams.delete(key);
          else if (key === "department") urlParams.delete(key);
          else if (key === "search") urlParams.delete(key);
          else urlParams.set(key, String(val));
        } else {
          urlParams.set(key, String(val));
        }
      }
      router.push(`${pathname}?${urlParams.toString()}`);
    },
    [pathname, baseSearchParams, router],
  );

  useEffect(() => {
    if (!invitedTrainer?.id) return;
    // eslint-disable-next-line
    setSelectedTraineeIds((prev) =>
      prev.filter((id) => id !== invitedTrainer.id),
    );
  }, [invitedTrainer?.id]);

  useEffect(() => {
    // eslint-disable-next-line
    setNotifyTrainer(parseNotifyConfig(currentCourse?.description));
  }, [currentCourse?.description]);

  useEffect(() => {
    if (debouncedTraineeSearch !== searchParams.search) {
      updateUrl({ search: debouncedTraineeSearch, page: 1 });
    }
  }, [debouncedTraineeSearch, searchParams.search, updateUrl]);

  const handlePageChange = useCallback(
    (page: number) => {
      const newPage = Math.max(1, Math.min(page, totalPages));
      updateUrl({ page: newPage });
    },
    [totalPages, updateUrl],
  );

  const handleCourseChange = (courseId: string) => {
    setSelectedTraineeIds([]);
    updateUrl({ courseId, page: 1 });
  };

  const handleSelectAllAcrossPages = async () => {
    await executeSelectAll(
      async () => {
        const result = await getEmployees({
          search: searchParams.search,
          page: 1,
          pageSize: 10000,
          departmentId:
            searchParams.departmentId !== "all"
              ? Number(searchParams.departmentId)
              : undefined,
        });

        // Filter out trainer, already enrolled, and special roles
        const validIds = result.items
          .filter(
            (emp: Employee) =>
              emp.id !== invitedTrainer?.id &&
              !enrolledEmployeeIds.includes(emp.id) &&
              !hasExcludedRole(emp),
          )
          .map((emp: Employee) => emp.id);

        setSelectedTraineeIds(validIds);
        toast({
          title: "Thành công",
          description: `Đã chọn ${validIds.length} học viên thỏa mãn điều kiện tìm kiếm và chưa tham gia khóa học.`,
        });
      },
      {
        errorFallback: "Không thể tải toàn bộ danh sách. Vui lòng thử lại.",
      },
    );
  };

  const handleSaveAssignment = async () => {
    if (!searchParams.courseId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn khóa học",
        variant: "destructive",
      });
      return;
    }

    if (!currentCourse) {
      toast({
        title: "Lỗi",
        description: "Chưa tải được thông tin khóa học. Vui lòng thử lại.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedTrainerEmail || "")) {
      toast({
        title: "Lỗi",
        description:
          "Khóa học hiện chưa được gắn Giảng viên. Vui lòng liên hệ bộ phận HR để thực hiện bổ nhiệm.",
        variant: "destructive",
      });
      return;
    }

    if (!currentCourse.startTime) {
      toast({
        title: "Lỗi",
        description:
          "Khóa học chưa được định thời gian. Vui lòng liên hệ bộ phận HR để thiết lập lịch đào tạo chuẩn.",
        variant: "destructive",
      });
      return;
    }

    if (typeof currentCourse.isOnline !== "boolean") {
      toast({
        title: "Lỗi",
        description: "Khóa học chưa xác định hình thức online/offline.",
        variant: "destructive",
      });
      return;
    }

    if (currentCourse.isOnline && !currentCourse.location) {
      toast({
        title: "Lỗi",
        description: "Khóa học online chưa có link họp.",
        variant: "destructive",
      });
      return;
    }

    const validSelectedIds = selectedTraineeIds.filter(
      (id) => !enrolledEmployeeIds.includes(id),
    );

    if (validSelectedIds.length === 0) {
      toast({
        title: "Lỗi",
        description:
          "Vui lòng chọn ít nhất một học viên hợp lệ (chưa tham gia).",
        variant: "destructive",
      });
      return;
    }

    await execute(
      async () => {
        await courseService.assignEmployees(
          searchParams.courseId,
          validSelectedIds,
          {
            meetUrl: currentCourse.isOnline ? currentCourse.location || "" : "",
            notifyTrainer,
          },
        );
      },
      {
        successMessage: {
          title: "Thành công",
          description: "Đã lưu phân công đào tạo",
        },
        errorFallback: "Không thể lưu phân công đào tạo. Vui lòng thử lại.",
        onSuccess: () => {
          router.push("/enterprise/dept-head/training");
        },
      },
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-blue-50"
          >
            <ChevronLeft className="w-5 h-5 text-[#0F4C75]" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#0F4C75] mb-1">
              Phân công Đào tạo
            </h1>
            <p className="text-gray-500">
              Xác nhận trainer đã được HR mời và chọn học viên cho khóa học.
            </p>
          </div>
        </div>
        <Button
          onClick={handleSaveAssignment}
          disabled={
            isSubmitting ||
            !searchParams.courseId ||
            selectedTraineeIds.length === 0 ||
            isPlanClosed
          }
          title={
            isPlanClosed
              ? "Không thể thao tác do Kế hoạch đào tạo đã đóng"
              : undefined
          }
          className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white px-8 rounded-full"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Lưu phân công
        </Button>
      </div>

      {isPlanClosed && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-semibold">
          <svg
            className="w-4 h-4 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
          Kế hoạch đào tạo đã đóng — Chỉ xem. Mọi thao tác phân công đã bị vô
          hiệu hóa.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
        {selectedPlanId && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-[#0F4C75]">
            {courses.length > 0
              ? "Danh sách khóa học đang được giới hạn theo kế hoạch đào tạo bạn vừa chọn."
              : "Chưa tìm thấy khóa học nào gắn với kế hoạch này."}
            {courses.length === 0 && (
              <div className="mt-3">
                <Button
                  size="sm"
                  className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white"
                  onClick={() =>
                    router.push("/enterprise/dept-head/training/plans")
                  }
                >
                  Quay lại xem kế hoạch
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Step 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-semibold">
              1
            </div>
            <h2 className="text-[13px] font-bold text-gray-700 tracking-wider">
              BƯỚC 1: CHỌN KHÓA HỌC
            </h2>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Chọn khóa học đào tạo cần phân công
            </p>
            <div className="mt-3">
              <SearchableCombobox<Course>
                value={searchParams.courseId}
                onValueChange={handleCourseChange}
                fetcher={async (search, page) => {
                  const res = await courseService.getAllCourses({
                    search,
                    page,
                    pageSize: 20,
                    status: "Published",
                  });
                  const total = res.totalPages || 1;
                  return { items: res.items, hasNextPage: page < total };
                }}
                renderItem={(c) => `${c.courseName} (Mã: ${c.courseCode})`}
                extractValue={(c) => c.id}
                placeholder="Chọn khóa học đào tạo..."
                searchPlaceholder="Tìm tên hoặc mã khóa học..."
                defaultItems={courses}
                className="w-full md:w-[600px]"
              />
            </div>
          </div>
        </div>

        {/* Step 2 wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-gray-100">
          <AssignTrainerInfo
            courseId={searchParams.courseId}
            currentCourse={currentCourse}
            invitedTrainer={invitedTrainer}
            normalizedTrainerEmail={normalizedTrainerEmail}
          />

          {/* Step 2.2 */}
          <div className="lg:col-span-8 bg-gray-50/30 rounded-xl border border-gray-100 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-semibold">
                  2.2
                </div>
                <h2 className="text-[13px] font-bold text-gray-700 tracking-wider uppercase">
                  Phân công học viên
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm theo tên..."
                    value={localTraineeSearch}
                    onChange={(e) => setLocalTraineeSearch(e.target.value)}
                    className="pl-9 w-[280px] bg-white border-gray-200"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50/40 px-4 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#0F4C75]">
                  Gửi thông báo đồng thời cho Giảng viên
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Tính năng này cho phép hệ thống tự động phát hành email thông
                  báo bổ nhiệm đến Giảng viên.
                </p>
              </div>
              <Switch
                checked={notifyTrainer}
                onCheckedChange={setNotifyTrainer}
                className="data-[state=checked]:bg-[#0F4C75]"
              />
            </div>

            <AssignTraineeTable
              assignableTrainees={assignableTrainees}
              potentialTrainees={potentialTrainees}
              enrolledEmployeeIds={enrolledEmployeeIds}
              selectedTraineeIds={selectedTraineeIds}
              setSelectedTraineeIds={setSelectedTraineeIds}
              totalCount={totalCount}
              totalPages={totalPages}
              currentPage={searchParams.page}
              handlePageChange={handlePageChange}
              handleSelectAllAcrossPages={handleSelectAllAcrossPages}
              isSelectingAll={isSelectingAll}
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="px-6 rounded-full border-gray-300"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveAssignment}
            disabled={isSubmitting || !searchParams.courseId}
            className="px-6 rounded-full bg-[#0F4C75] hover:bg-[#1A5F8C] text-white"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              "Hoàn tất phân công"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
