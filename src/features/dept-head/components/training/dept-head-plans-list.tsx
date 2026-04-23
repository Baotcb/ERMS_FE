"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  Search,
  MoreHorizontal,
  Eye,
  BookOpen,
  ArrowRight,
  Loader2,
  Lock,
} from "lucide-react";
import { format } from "date-fns";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { hrTrainingService } from "@/features/hr/api/hr-training-service";
import type { TrainingPlan } from "@/features/hr/types/training-plan-types";
import { TrainingPlanDetail } from "@/features/hr/components/training/training-plan-detail";
import {
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/features/hr/utils/training-status-utils";
import { formatVND } from "@/lib/utils";

export function DeptHeadPlansList({
  initialData,
}: {
  initialData?: { items: TrainingPlan[] };
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [navigatingPlanId, setNavigatingPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading, error } = useSWR<{ items: TrainingPlan[] }>(
    ["/api/TrainingPlan", "dept-head", debouncedSearch],
    () =>
      hrTrainingService.getPlans({
        search: debouncedSearch,
        status: "Approved",
      }),
    { fallbackData: initialData },
  );

  const plans = data?.items || [];

  const handleGoAssignTrainer = (planId: string) => {
    setNavigatingPlanId(planId);
    router.push(`/enterprise/dept-head/training/assign?planId=${planId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F4C75]">
            Kế hoạch đào tạo
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Xem kế hoạch đào tạo đã được duyệt và phân công trainer cho khóa học
            do HR khởi tạo
          </p>
        </div>
      </div>

      <div className="flex items-center bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm kế hoạch..."
            className="pl-10 border-gray-200 focus:border-[#3282B8]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 space-y-3">
          <div>
            Không thể tải danh sách kế hoạch đào tạo đã duyệt. Vui lòng kiểm tra
            quyền DepartmentHead trên API hoặc đăng nhập lại.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                router.push("/enterprise/dept-head/training/assign")
              }
            >
              Đi tới phân công học viên
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-bold text-[#0F4C75]">
                Tên kế hoạch
              </TableHead>
              <TableHead className="font-bold text-[#0F4C75]">Năm</TableHead>
              <TableHead className="font-bold text-[#0F4C75]">
                Số khóa học
              </TableHead>
              <TableHead className="font-bold text-[#0F4C75]">
                Tổng ngân sách
              </TableHead>
              <TableHead className="font-bold text-[#0F4C75]">
                Ngày tạo
              </TableHead>
              <TableHead className="font-bold text-[#0F4C75]">
                Trạng thái
              </TableHead>
              <TableHead className="text-right font-bold text-[#0F4C75]">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-gray-400"
                >
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : plans.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-12 text-gray-400 italic"
                >
                  Chưa có kế hoạch đào tạo nào ở trạng thái đã duyệt
                </TableCell>
              </TableRow>
            ) : (
              plans.map((plan: TrainingPlan) => (
                <TableRow
                  key={plan.id}
                  className={`hover:bg-gray-50/50 transition-colors ${plan.status === "Closed" ? "opacity-60" : ""}`}
                >
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <BookOpen
                        className={`w-4 h-4 ${plan.status === "Closed" ? "text-slate-400" : "text-blue-500"}`}
                      />
                      <span>{plan.planName}</span>
                      {plan.status === "Closed" && (
                        <Badge className="ml-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-1.5 py-0">
                          <Lock className="w-3 h-3 mr-0.5" /> Đã đóng
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0"
                    >
                      {plan.year}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {plan.totalCourses} khóa học
                  </TableCell>
                  <TableCell className="text-gray-900 font-semibold">
                    {formatVND(plan.totalBudget)}
                  </TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {format(new Date(plan.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`border-0 font-semibold px-2.5 py-0.5 ${STATUS_COLORS[plan.status] || "bg-gray-100"}`}
                    >
                      {STATUS_LABELS[plan.status] || plan.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            setSelectedPlan(plan);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                        </DropdownMenuItem>
                        {plan.status !== "Closed" && (
                          <DropdownMenuItem
                            className="cursor-pointer text-blue-600 focus:text-blue-700 focus:bg-blue-50"
                            onClick={() => handleGoAssignTrainer(plan.id)}
                          >
                            {navigatingPlanId === plan.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ArrowRight className="mr-2 h-4 w-4" />
                            )}
                            Phân công học viên
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TrainingPlanDetail
        plan={selectedPlan}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
    </div>
  );
}
