"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  BookOpen,
  Pencil,
  Lock,
} from "lucide-react";
import { format } from "date-fns";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hrTrainingService } from "../../api/hr-training-service";
import {
  TrainingPlan,
  TrainingPlansResult,
} from "../../types/training-plan-types";
import { useRouter } from "next/navigation";
import { TrainingPlanDetail } from "./training-plan-detail";
import { EditPlanDialog } from "./edit-plan-dialog";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  getStatusLabel,
  getDisplayReviewNote,
} from "../../utils/training-status-utils";
import { formatVND } from "@/lib/utils";
import { usePaginatedList } from "@/hooks/use-paginated-list";
import { useAsyncAction } from "@/hooks/use-async-action";
import { TablePagination } from "@/components/common/table-pagination";

export function TrainingPlansList({
  initialData,
}: {
  initialData?: TrainingPlansResult;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    items: plans,
    totalCount,
    totalPages,
    page,
    setPage,
    search,
    handleSearch,
    isLoading,
    mutate,
  } = usePaginatedList({
    key: ["/api/TrainingPlan"],
    fetcher: (params) =>
      hrTrainingService.getPlans({
        ...params,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    initialData,
    extraParams: { status: statusFilter === "all" ? undefined : statusFilter },
  });

  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [closingNote, setClosingNote] = useState("");

  const { execute: executeClose, isSubmitting: isClosing } = useAsyncAction();

  const handleClose = () =>
    executeClose(
      () =>
        hrTrainingService.closePlan({
          trainingPlanId: selectedPlan!.id,
          closingNote: closingNote.trim() || undefined,
        }),
      {
        successMessage: {
          title: "Đã đóng",
          description: "Kế hoạch đào tạo đã được đóng thành công.",
        },
        onSuccess: () => {
          setIsCloseOpen(false);
          setClosingNote("");
          mutate();
        },
      },
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-brand-primary">
            Kế hoạch đào tạo năm
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý các kế hoạch đào tạo tổng thể ({totalCount} kế hoạch)
          </p>
        </div>
        <Button
          onClick={() => router.push("/enterprise/hr/training/requests")}
          className="bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-blue-900/10 transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Tổng hợp & Lập kế hoạch
        </Button>
      </div>

      <div className="flex items-center gap-4 bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm kế hoạch..."
            className="pl-10 border-gray-200 focus:border-brand-medium"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] border-gray-200">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[420px]">
        <div className="flex-1 overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold text-brand-primary">
                  Tên kế hoạch
                </TableHead>
                <TableHead className="font-bold text-brand-primary">
                  Năm
                </TableHead>
                <TableHead className="font-bold text-brand-primary">
                  Tổng ngân sách
                </TableHead>
                <TableHead className="font-bold text-brand-primary">
                  Ngày tạo
                </TableHead>
                <TableHead className="font-bold text-brand-primary">
                  Trạng thái
                </TableHead>
                <TableHead className="font-bold text-brand-primary">
                  Ghi chú duyệt
                </TableHead>
                <TableHead className="text-right font-bold text-brand-primary">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-gray-400"
                  >
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : plans?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-gray-400 italic"
                  >
                    Chưa có kế hoạch đào tạo nào
                  </TableCell>
                </TableRow>
              ) : (
                plans?.map((plan: TrainingPlan) => {
                  const isClosed = plan.status === "Closed";
                  return (
                    <TableRow
                      key={plan.id}
                      className={`hover:bg-gray-50/50 transition-colors ${isClosed ? "opacity-60" : ""}`}
                    >
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <BookOpen
                            className={`w-4 h-4 ${isClosed ? "text-slate-400" : "text-blue-500"}`}
                          />
                          <span>{plan.planName}</span>
                          {isClosed && (
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
                          {getStatusLabel(plan)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] text-sm text-gray-600">
                        {plan.reviewNote ? (
                          <p
                            className="line-clamp-2"
                            title={getDisplayReviewNote(plan.reviewNote)}
                          >
                            {getDisplayReviewNote(plan.reviewNote)}
                          </p>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
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
                          <DropdownMenuContent align="end" className="w-48">
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
                            {!isClosed &&
                              ["Pending", "Rejected"].includes(plan.status) && (
                                <DropdownMenuItem
                                  className="cursor-pointer text-brand-primary"
                                  onClick={() => {
                                    setSelectedPlan(plan);
                                    setIsEditOpen(true);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                                  kế hoạch
                                </DropdownMenuItem>
                              )}
                            {!isClosed && plan.status === "Approved" && (
                              <DropdownMenuItem
                                className="cursor-pointer text-slate-600"
                                onClick={() => {
                                  setSelectedPlan(plan);
                                  setIsCloseOpen(true);
                                }}
                              >
                                <Lock className="mr-2 h-4 w-4" /> Đóng kế hoạch
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <TablePagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <TrainingPlanDetail
        plan={selectedPlan}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setTimeout(() => setSelectedPlan(null), 300);
        }}
      />

      <EditPlanDialog
        plan={selectedPlan}
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setTimeout(() => setSelectedPlan(null), 300);
        }}
        onSuccess={() => mutate()}
      />

      {/* Close Plan Dialog */}
      <Dialog
        open={isCloseOpen}
        onOpenChange={(open) => {
          setIsCloseOpen(open);
          if (!open) {
            setClosingNote("");
            setTimeout(() => setSelectedPlan(null), 300);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đóng kế hoạch đào tạo</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đóng kế hoạch{" "}
              <strong>{selectedPlan?.planName}</strong>? Tất cả các yêu cầu đào
              tạo liên quan sẽ được chuyển sang trạng thái &quot;Hoàn
              thành&quot;.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Ghi chú khi đóng (tùy chọn)..."
            value={closingNote}
            onChange={(e) => setClosingNote(e.target.value)}
            className="min-h-[80px]"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCloseOpen(false);
                setClosingNote("");
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleClose}
              disabled={isClosing}
              className="bg-slate-700 hover:bg-slate-800 text-white"
            >
              {isClosing ? "Đang xử lý..." : "Đóng kế hoạch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
