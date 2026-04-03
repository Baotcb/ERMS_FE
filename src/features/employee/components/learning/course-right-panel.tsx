"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseRightPanelProps {
  courseId: string;
  isAllLessonsComplete: boolean;
  completionPercent: number;
  basePath?: string;
  hasFinalQuiz?: boolean;
}

export function CourseRightPanel({
  courseId,
  isAllLessonsComplete,
  completionPercent,
  basePath = "/enterprise/employee/learning/course",
  hasFinalQuiz = true,
}: CourseRightPanelProps) {
  return (
    <aside className="hidden xl:block">
      {/* ── Quiz CTA ── */}
      <div
        className={`rounded-2xl overflow-hidden shadow-md sticky top-[72px] ${isAllLessonsComplete ? "bg-gradient-to-br from-[#0F3B64] via-[#145DA0] to-[#3282B8]" : "bg-white border border-gray-200"}`}
      >
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Award
              className={`w-5 h-5 ${isAllLessonsComplete ? "text-[#E8731A]" : "text-gray-400"}`}
            />
            <h3
              className={`font-bold text-sm ${isAllLessonsComplete ? "text-white" : "text-[#0F4C75]"}`}
            >
              {isAllLessonsComplete
                ? hasFinalQuiz
                  ? "Sẵn sàng làm bài kiểm tra?"
                  : "Sẵn sàng đánh giá khóa học"
                : hasFinalQuiz
                  ? "Bài kiểm tra cuối khóa"
                  : "Chuyển qua bước đánh giá"}
            </h3>
          </div>
          <p
            className={`text-xs leading-relaxed ${isAllLessonsComplete ? "text-blue-200" : "text-gray-500"}`}
          >
            {isAllLessonsComplete
              ? hasFinalQuiz
                ? "Bạn đã hoàn thành tất cả bài học. Hãy thực hiện bài kiểm tra để nhận chứng chỉ hoàn thành."
                : "Bạn đã lưu lại kết quả bài học. Hãy thực hiện đánh giá khóa học để hoàn tất quá trình học."
              : `Hoàn thành ${completionPercent}% bài học để mở khóa bước tiếp theo.`}
          </p>
          {isAllLessonsComplete ? (
            <Link
              href={
                hasFinalQuiz
                  ? `${basePath}/${courseId}/quiz`
                  : `${basePath}/${courseId}/review`
              }
            >
              <Button className="w-full bg-[#E8731A] hover:bg-[#D06515] text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 mt-1">
                {hasFinalQuiz ? "Bắt đầu kiểm tra" : "Đánh giá khóa học"}
              </Button>
            </Link>
          ) : (
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-1">
              <div
                className="bg-gradient-to-r from-[#3282B8] to-[#E8731A] h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
