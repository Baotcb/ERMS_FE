"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { handleApiError } from "@/features/employee/utils/api-error-handler";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { hrTrainingService } from "@/features/hr/api/hr-training-service";
import { courseService } from "@/features/hr/api/course-service";
import { useAuth } from "@/features/core/auth/hooks/use-auth";
import type { TrainingPlan } from "@/features/hr/types/training-plan-types";
import { createCourseSchema } from "@/features/hr/schema/course-schema";
import type { CreateCourseCommand } from "@/features/hr/types/course-types";
import * as z from "zod";

interface CreateCourseDialogProps {
  open: boolean;
  plan: TrainingPlan | null;
  onOpenChange: (open: boolean) => void;
  onCreated: (courseId: string, planId: string) => void;
  hideTrainerSelection?: boolean;
  availablePlans?: TrainingPlan[];
}

function buildDefaultCourseCode(plan: TrainingPlan): string {
  const suffix =
    Date.now().toString(36).slice(-4).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${plan.planCode}-C${suffix}`;
}

function buildQuickCourseCode(): string {
  const suffix =
    Date.now().toString(36).slice(-4).toUpperCase() +
    Math.random().toString(36).slice(2, 5).toUpperCase();
  return `COURSE-${suffix}`;
}

export function CreateCourseDialog({
  open,
  plan,
  onOpenChange,
  onCreated,
  hideTrainerSelection = false,
  availablePlans = [],
}: CreateCourseDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const userEmail = user?.email || "";

  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);

  const form = useForm<z.infer<typeof createCourseSchema>>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      trainingPlanId: "",
      courseName: "",
      courseCode: "",
      description: "",
      trainerEmail: "",
      durationMinutes: "",
      maxEnrollments: "",
      completionCriteria: "Quiz",
      isMandatory: false,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      setSelectedPlan((prev) => (prev?.id !== plan?.id ? plan : prev));
      form.reset({
        trainingPlanId: plan?.id || "",
        courseName: plan?.planName || "",
        courseCode: plan
          ? buildDefaultCourseCode(plan)
          : buildQuickCourseCode(),
        description: plan?.description || "",
        trainerEmail: "",
        durationMinutes: "",
        maxEnrollments: "",
        completionCriteria: "Quiz",
        isMandatory: false,
      });
      setWizardStep(1);
    }, 0);

    return () => clearTimeout(timer);
  }, [open, plan, form]);

  const handleNextStep = async () => {
    const isValid = await form.trigger([
      "trainingPlanId",
      "courseName",
      "courseCode",
    ]);
    if (isValid) {
      setWizardStep(2);
    }
  };

  const onSubmit = async (data: z.infer<typeof createCourseSchema>) => {
    const provisionalStartTime = selectedPlan?.startDate
      ? new Date(selectedPlan.startDate)
      : null;

    if (!provisionalStartTime || Number.isNaN(provisionalStartTime.getTime())) {
      toast({
        title: "Thiếu dữ liệu kế hoạch",
        description:
          "Không xác định được thời gian bắt đầu từ training plan. Vui lòng kiểm tra lại.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: CreateCourseCommand = {
        trainingPlanId: data.trainingPlanId,
        courseName: data.courseName.trim(),
        courseCode: data.courseCode.trim(),
        description: data.description?.trim() || undefined,
        trainerEmail: data.trainerEmail.trim().toLowerCase(),
        startTime: provisionalStartTime.toISOString(),
        isOnline: true,
        location: undefined,
        durationMinutes: data.durationMinutes
          ? Number(data.durationMinutes)
          : undefined,
        isMandatory: data.isMandatory,
        maxEnrollments: data.maxEnrollments
          ? Number(data.maxEnrollments)
          : undefined,
        completionCriteria: data.completionCriteria.trim() || "Quiz",
      };

      const result = await courseService.createCourse(payload);

      toast({
        title: "Thành công",
        description: selectedPlan
          ? `Đã tạo khóa học cho kế hoạch ${selectedPlan.planName}.`
          : "Đã tạo khóa học thành công.",
      });

      if (
        userEmail &&
        data.trainerEmail.trim().toLowerCase() !== userEmail.toLowerCase()
      ) {
        toast({
          title: "📋 Bạn là người quản lý nội dung",
          description: `Trainer "${data.trainerEmail.trim()}" ngoài hệ thống. Bạn có thể tự upload tài liệu tại mục "Giảng dạy".`,
        });
      }

      onOpenChange(false);
      onCreated(result.courseId, data.trainingPlanId);
    } catch (error) {
      handleApiError(error, toast, "Không thể tạo khóa học");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[720px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {plan ? "Tạo khóa học từ kế hoạch" : "Lập lịch kế hoạch mới"}
          </DialogTitle>
          <DialogDescription>
            {plan
              ? `Tạo khóa học cho kế hoạch ${plan.planName}.`
              : "Điền thông tin để tạo khóa học mới."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setWizardStep(1)}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${wizardStep === 1 ? "border-[#0F4C75] bg-blue-50 text-[#0F4C75]" : "border-gray-200 bg-white text-gray-500 hover:border-blue-200"}`}
          >
            <p className="font-semibold">Bước 1</p>
            <p className="text-xs">Thông tin khóa học</p>
          </button>
          <button
            type="button"
            onClick={handleNextStep}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${wizardStep === 2 ? "border-[#0F4C75] bg-blue-50 text-[#0F4C75]" : "border-gray-200 bg-white text-gray-500 hover:border-blue-200"}`}
          >
            <p className="font-semibold">Bước 2</p>
            <p className="text-xs">Thiết lập đào tạo</p>
          </button>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-5 py-2"
          >
            {wizardStep === 1 && (
              <>
                {!plan && (
                  <FormField
                    control={form.control}
                    name="trainingPlanId"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Training plan</FormLabel>
                        <FormControl>
                          <SearchableCombobox<TrainingPlan>
                            value={field.value}
                            onValueChange={(val, item) => {
                              field.onChange(val);
                              setSelectedPlan(item || null);
                            }}
                            fetcher={async (search, page) => {
                              const res = await hrTrainingService.getPlans({
                                search,
                                page,
                                pageSize: 20,
                                status: "Approved",
                              });
                              const totalPages = res.totalPages || 1;
                              return {
                                items: res.items,
                                hasNextPage: page < totalPages,
                              };
                            }}
                            renderItem={(p) => `${p.planName} (${p.planCode})`}
                            extractValue={(p) => p.id}
                            placeholder="Chọn kế hoạch đào tạo đã duyệt"
                            searchPlaceholder="Tìm tên hoặc mã kế hoạch..."
                            defaultItems={
                              availablePlans.length > 0
                                ? availablePlans
                                : selectedPlan
                                  ? [selectedPlan]
                                  : []
                            }
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500">
                          Mỗi khóa học phải gắn với một training plan đã được
                          duyệt.
                        </p>
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Tên khóa học</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nhập tên khóa học" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="courseCode"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Mã khóa học</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nhập mã khóa học" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Nhập mô tả khóa học"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {wizardStep === 2 && (
              <>
                {!hideTrainerSelection && (
                  <FormField
                    control={form.control}
                    name="trainerEmail"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Email người đào tạo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="trainer@company.com" />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500">
                          Nhập email giảng viên để hệ thống ghi nhận.
                        </p>
                      </FormItem>
                    )}
                  />
                )}

                {hideTrainerSelection && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-[#0F4C75]">
                    Trainer sẽ được gán ở bước sau.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Thời lượng (phút)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            placeholder="Ví dụ: 120"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxEnrollments"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Số học viên tối đa</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            placeholder="Ví dụ: 30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="completionCriteria"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Tiêu chí hoàn thành</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value="Quiz"
                            readOnly
                            disabled
                            className="bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isMandatory"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel>Tính chất khóa học</FormLabel>
                        <FormControl>
                          <div className="flex h-10 items-center justify-between rounded-md border border-input px-3 py-2 text-sm transition-colors hover:bg-gray-50">
                            <span className="font-medium text-gray-700">
                              Khóa học bắt buộc
                            </span>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Hủy
              </Button>
              {wizardStep === 1 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-[#0F4C75] hover:bg-[#1A5F8C]"
                >
                  Tiếp tục
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setWizardStep(1)}
                    disabled={form.formState.isSubmitting}
                  >
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="bg-[#0F4C75] hover:bg-[#1A5F8C]"
                  >
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Tạo khóa học
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
