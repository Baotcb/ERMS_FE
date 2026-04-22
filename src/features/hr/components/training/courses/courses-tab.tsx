import { Search, BookOpen, Eye } from "lucide-react";
import { format } from "date-fns";
import type { Course } from "@/features/hr/types/course-types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDeploymentLabel } from "./course-detail-content";
import { STATUS_COLORS } from "@/features/hr/utils/training-status-utils";
import Link from "next/link";

export function CoursesTab({
  courses,
  localSearch,
  onSearchChange,
}: {
  courses: Course[];
  localSearch: string;
  onSearchChange: (val: string) => void;
}) {
  // No useSWR here. The list of courses is handled fully by Server.
  return (
    <>
      <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm khóa học..."
            className="pl-10 border-gray-200 focus:border-brand-medium"
            value={localSearch}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold text-brand-primary w-1/3">
                Khóa học
              </TableHead>
              <TableHead className="font-bold text-brand-primary">
                Giảng viên
              </TableHead>
              <TableHead className="font-bold text-brand-primary">
                Bài học
              </TableHead>
              <TableHead className="font-bold text-brand-primary">
                Học viên
              </TableHead>
              <TableHead className="font-bold text-brand-primary">
                Ngày tạo
              </TableHead>
              <TableHead className="font-bold text-brand-primary">
                Trạng thái
              </TableHead>
              <TableHead className="text-right font-bold text-brand-primary">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-gray-400 italic"
                >
                  Chưa có khóa học nào
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow
                  key={course.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="line-clamp-1">{course.courseName}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {course.courseCode}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {course.trainerName || course.trainerEmail || "Chưa gán"}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {course.lessonCount || 0}
                  </TableCell>
                  <TableCell className="text-gray-700">
                    {course.enrollmentCount || 0}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {format(new Date(course.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border-0 font-semibold px-2.5 py-0.5 ${STATUS_COLORS[course.status] || "bg-gray-100 text-gray-700"}`}
                    >
                      {getDeploymentLabel(course)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      className="h-8 px-2 text-brand-primary hover:bg-blue-50"
                      asChild
                    >
                      <Link
                        href={`/enterprise/hr/training/courses/${course.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Xem
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
