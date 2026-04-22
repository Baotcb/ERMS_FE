"use client";

import { MetricCard } from "@/components/ui/metric-card";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { MessageSquare, Search, Star, TrendingUp } from "lucide-react";

import {
  feedbackService,
  type CourseFeedbackDto,
} from "@/features/employee/api/feedback-service";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeedbackReplySection } from "@/features/employee/components/learning/quiz/feedback-reply-section";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
        />
      ))}
      <span className="ml-1.5 text-sm font-bold text-gray-700">{rating}</span>
    </div>
  );
}

export default function HRTrainingFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<CourseFeedbackDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    feedbackService
      .getAllFeedbacks()
      .then(setFeedbacks)
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false));
  }, []);

  const courseOptions = useMemo(() => {
    const map = new Map<string, string>();
    feedbacks.forEach((f) => {
      if (!map.has(f.courseCode)) map.set(f.courseCode, f.courseName);
    });
    return Array.from(map.entries()).map(([code, name]) => ({ code, name }));
  }, [feedbacks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return feedbacks.filter((feedback) => {
      const matchSearch =
        !q ||
        [
          feedback.employeeName,
          feedback.employeeEmail,
          feedback.courseName,
          feedback.trainerEmail,
          feedback.comment,
        ].some((value) => value?.toLowerCase().includes(q));
      const matchCourse =
        courseFilter === "all" || feedback.courseCode === courseFilter;
      return matchSearch && matchCourse;
    });
  }, [feedbacks, search, courseFilter]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return { total: 0, avgCourse: 0, avgTrainer: 0 };

    const avgCourse =
      filtered.reduce((sum, feedback) => sum + feedback.courseRating, 0) /
      filtered.length;
    const avgTrainer =
      filtered.reduce((sum, feedback) => sum + feedback.trainerRating, 0) /
      filtered.length;
    return {
      total: filtered.length,
      avgCourse: +avgCourse.toFixed(1),
      avgTrainer: +avgTrainer.toFixed(1),
    };
  }, [filtered]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-primary">
          Phản hồi đào tạo
        </h1>
        <p className="text-sm text-gray-500">
          Tổng hợp đánh giá từ học viên về chất lượng khóa học và giảng viên.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          theme="default"
          title="Tổng đánh giá"
          value={stats.total}
          icon={MessageSquare}
        />
        <MetricCard
          theme="amber"
          title="Điểm TB khóa học"
          value={stats.avgCourse}
          icon={Star}
          valueSuffix="/5"
        />
        <MetricCard
          theme="blue"
          title="Điểm TB giảng viên"
          value={stats.avgTrainer}
          icon={TrendingUp}
          valueSuffix="/5"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.5fr_1fr]">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, khóa học, nhận xét..."
              className="pl-9"
            />
          </div>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo khóa học" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khóa học</SelectItem>
              {courseOptions.map((opt) => (
                <SelectItem key={opt.code} value={opt.code}>
                  {opt.name} ({opt.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">
          Đang tải dữ liệu...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          Chưa có đánh giá nào.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((feedback) => (
            <div
              key={feedback.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-colors hover:border-blue-200"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {feedback.employeeName}
                    </span>
                    {feedback.isAnonymous && (
                      <Badge variant="outline" className="bg-gray-100 text-xs">
                        Ẩn danh
                      </Badge>
                    )}
                  </div>
                  {feedback.employeeEmail && (
                    <p className="text-xs text-gray-500">
                      {feedback.employeeEmail} • {feedback.departmentName}
                    </p>
                  )}
                  <p className="text-sm font-medium text-brand-primary">
                    {feedback.courseName}{" "}
                    <span className="text-gray-400">
                      ({feedback.courseCode})
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Giảng viên: {feedback.trainerEmail}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Khóa học:</span>{" "}
                    <StarDisplay rating={feedback.courseRating} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Giảng viên:</span>{" "}
                    <StarDisplay rating={feedback.trainerRating} />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {format(new Date(feedback.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              </div>
              {feedback.comment && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-sm italic text-gray-700">
                    &ldquo;{feedback.comment}&rdquo;
                  </p>
                </div>
              )}
              <div className="mt-4 border-t border-gray-100 pt-3">
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === feedback.id ? null : feedback.id,
                    )
                  }
                  className="text-xs font-semibold text-brand-medium hover:text-brand-primary flex items-center"
                >
                  <MessageSquare className="w-3.5 h-3.5 mr-1" />
                  {expandedId === feedback.id
                    ? "Thu gọn thảo luận"
                    : "Thảo luận"}
                </button>

                {expandedId === feedback.id && (
                  <div className="mt-4">
                    <FeedbackReplySection feedbackId={feedback.id} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
