'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { handleApiError } from '@/features/employee/utils/api-error-handler';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';
import { hrTrainingService } from '@/features/hr/api/hr-training-service';
import { courseService } from '@/features/hr/api/course-service';
import type { CreateCourseCommand } from '@/features/hr/types/course-types';
import { useAuth } from '@/features/core/auth/hooks/use-auth';
import type { TrainingPlan } from '@/features/hr/types/training-plan-types';

interface CreateCourseDialogProps {
    open: boolean;
    plan: TrainingPlan | null;
    onOpenChange: (open: boolean) => void;
    onCreated: (courseId: string, planId: string) => void;
    hideTrainerSelection?: boolean;
    availablePlans?: TrainingPlan[];
}

function buildDefaultCourseCode(plan: TrainingPlan): string {
    const suffix = Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    return `${plan.planCode}-C${suffix}`;
}

function buildQuickCourseCode(): string {
    const suffix = Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
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
    const userEmail = user?.email || '';
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [description, setDescription] = useState('');
    const [trainerEmail, setTrainerEmail] = useState('');
    const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);
    const [durationMinutes, setDurationMinutes] = useState('');
    const [maxEnrollments, setMaxEnrollments] = useState('');
    const [completionCriteria, setCompletionCriteria] = useState('Quiz');
    const [isMandatory, setIsMandatory] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wizardStep, setWizardStep] = useState<1 | 2>(1);

    useEffect(() => {
        if (!open) {
            return;
        }

        setCourseName(plan?.planName || '');
        setCourseCode(plan ? buildDefaultCourseCode(plan) : buildQuickCourseCode());
        setDescription(plan?.description || '');
        setTrainerEmail('');
        setSelectedPlan(plan);
        setDurationMinutes('');
        setMaxEnrollments('');
        setCompletionCriteria('Quiz');
        setIsMandatory(false);
        setWizardStep(1);
    }, [open, plan]);

    const resolvedPlanId = plan?.id || selectedPlan?.id || '';

    const handleNextStep = () => {
        if (!resolvedPlanId) {
            toast({
                title: 'Thiếu kế hoạch đào tạo',
                description: 'Vui lòng chọn training plan trước khi tiếp tục.',
                variant: 'destructive',
            });
            return;
        }

        if (!courseName.trim() || !courseCode.trim()) {
            toast({
                title: 'Thiếu thông tin',
                description: 'Vui lòng nhập tên khóa học và mã khóa học.',
                variant: 'destructive',
            });
            return;
        }

        setWizardStep(2);
    };

    const handleSubmit = async () => {
        if (!resolvedPlanId) {
            toast({
                title: 'Thiếu kế hoạch đào tạo',
                description: 'Vui lòng chọn training plan trước khi tạo khóa học.',
                variant: 'destructive',
            });
            return;
        }

        if (!courseName.trim() || !courseCode.trim() || !trainerEmail.trim()) {
            toast({
                title: 'Thiếu thông tin',
                description: 'Vui lòng nhập tên khóa học, mã khóa học và email người đào tạo.',
                variant: 'destructive',
            });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trainerEmail.trim())) {
            toast({
                title: 'Email không hợp lệ',
                description: 'Vui lòng nhập đúng định dạng email người đào tạo.',
                variant: 'destructive',
            });
            return;
        }

        const durationValue = durationMinutes ? Number(durationMinutes) : null;
        const maxEnrollmentsValue = maxEnrollments ? Number(maxEnrollments) : null;

        if (durationMinutes && (Number.isNaN(durationValue) || durationValue === null || durationValue <= 0)) {
            toast({
                title: 'Dữ liệu không hợp lệ',
                description: 'Thời lượng phải là số lớn hơn 0.',
                variant: 'destructive',
            });
            return;
        }

        if (maxEnrollments && (Number.isNaN(maxEnrollmentsValue) || maxEnrollmentsValue === null || maxEnrollmentsValue <= 0)) {
            toast({
                title: 'Dữ liệu không hợp lệ',
                description: 'Số lượng học viên tối đa phải là số lớn hơn 0.',
                variant: 'destructive',
            });
            return;
        }

        const provisionalStartTime = selectedPlan?.startDate
            ? new Date(selectedPlan.startDate)
            : null;
        if (!provisionalStartTime || Number.isNaN(provisionalStartTime.getTime())) {
            toast({
                title: 'Thiếu dữ liệu kế hoạch',
                description: 'Không xác định được thời gian bắt đầu từ training plan. Vui lòng kiểm tra lại kế hoạch.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: CreateCourseCommand = {
                trainingPlanId: resolvedPlanId,
                courseName: courseName.trim(),
                courseCode: courseCode.trim(),
                description: description.trim() || undefined,
                trainerEmail: trainerEmail.trim().toLowerCase(),
                startTime: provisionalStartTime.toISOString(),
                isOnline: true,
                location: undefined,
                durationMinutes: durationValue ?? undefined,
                isMandatory,
                maxEnrollments: maxEnrollmentsValue ?? undefined,
                completionCriteria: completionCriteria.trim() || 'Quiz',
            };

            const result = await courseService.createCourse(payload);

            toast({
                title: 'Thành công',
                description: selectedPlan
                    ? 'Đã tạo khóa học theo training plan.'
                    : 'Đã tạo khóa học theo training plan đã chọn.',
            });

            // Check if trainer is external → show additional info toast (no extra fetch)
            if (userEmail && trainerEmail.trim().toLowerCase() !== userEmail.toLowerCase()) {
                toast({
                    title: '📋 Bạn là người quản lý nội dung',
                    description: `Trainer "${trainerEmail.trim()}" ngoài hệ thống. Bạn có thể upload tài liệu tại mục "Giảng dạy (Content)" trong sidebar.`,
                });
            }

            onOpenChange(false);
            onCreated(result.courseId, resolvedPlanId);
        } catch (error) {
            handleApiError(error, toast, 'Không thể tạo khóa học');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[720px]" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                        <DialogTitle>{plan ? 'Tạo khóa học từ kế hoạch' : 'Lập lịch kế hoạch mới'}</DialogTitle>
                    <DialogDescription>
                        {plan
                            ? `Tạo khóa học cho kế hoạch ${plan?.planName ?? ''}.`
                            : 'Điền thông tin để tạo khóa học mới.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setWizardStep(1)}
                        className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${wizardStep === 1 ? 'border-[#0F4C75] bg-blue-50 text-[#0F4C75]' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200'}`}
                    >
                        <p className="font-semibold">Wizard 1</p>
                        <p className="text-xs">Thông tin khóa học</p>
                    </button>
                    <button
                        type="button"
                        onClick={() => resolvedPlanId && courseName.trim() && courseCode.trim() && setWizardStep(2)}
                        className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${wizardStep === 2 ? 'border-[#0F4C75] bg-blue-50 text-[#0F4C75]' : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200'}`}
                    >
                        <p className="font-semibold">Wizard 2</p>
                        <p className="text-xs">Thiết lập đào tạo</p>
                    </button>
                </div>

                <div className="grid gap-5 py-2">
                    {wizardStep === 1 && (
                        <>
                            {!plan && (
                                <div className="grid gap-2">
                                    <Label>Training plan</Label>
                                    <SearchableCombobox<TrainingPlan>
                                        value={selectedPlan?.id}
                                        onValueChange={(_, item) => setSelectedPlan(item || null)}
                                        fetcher={async (search, page) => {
                                            const res = await hrTrainingService.getPlans({ search, page, pageSize: 20, status: 'Approved' });
                                            const totalPages = res.totalPages || 1;
                                            return { items: res.items, hasNextPage: page < totalPages };
                                        }}
                                        renderItem={(p) => `${p.planName} (${p.planCode})`}
                                        extractValue={(p) => p.id}
                                        placeholder="Chọn kế hoạch đào tạo đã duyệt"
                                        searchPlaceholder="Tìm tên hoặc mã kế hoạch..."
                                        defaultItems={availablePlans.length > 0 ? availablePlans : (selectedPlan ? [selectedPlan] : [])}
                                    />
                                    <p className="text-xs text-gray-500">
                                        Mỗi khóa học phải gắn với một training plan đã được duyệt.
                                    </p>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="course-name">Tên khóa học</Label>
                                <Input
                                    id="course-name"
                                    value={courseName}
                                    onChange={(event) => setCourseName(event.target.value)}
                                    placeholder="Nhập tên khóa học"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="course-code">Mã khóa học</Label>
                                    <Input
                                        id="course-code"
                                        value={courseCode}
                                        onChange={(event) => setCourseCode(event.target.value)}
                                        placeholder="Nhập mã khóa học"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="course-description">Mô tả</Label>
                                <Textarea
                                    id="course-description"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Nhập mô tả khóa học"
                                    rows={4}
                                />
                            </div>
                        </>
                    )}

                    {wizardStep === 2 && (
                        <>
                            {!hideTrainerSelection && (
                                <div className="grid gap-2">
                                    <Label htmlFor="trainer-email">Email người đào tạo</Label>
                                    <Input
                                        id="trainer-email"
                                        type="email"
                                        value={trainerEmail}
                                        onChange={(event) => setTrainerEmail(event.target.value)}
                                        placeholder="trainer@company.com"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Nhập email giảng viên để hệ thống ghi nhận và gửi email mời giảng dạy.
                                    </p>
                                </div>
                            )}

                            {hideTrainerSelection && (
                                <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-[#0F4C75]">
                                    Trainer sẽ được gán ở bước sau.
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="duration-minutes">Thời lượng (phút)</Label>
                                    <Input
                                        id="duration-minutes"
                                        type="number"
                                        min="1"
                                        value={durationMinutes}
                                        onChange={(event) => setDurationMinutes(event.target.value)}
                                        placeholder="Ví dụ: 120"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="max-enrollments">Số học viên tối đa</Label>
                                    <Input
                                        id="max-enrollments"
                                        type="number"
                                        min="1"
                                        value={maxEnrollments}
                                        onChange={(event) => setMaxEnrollments(event.target.value)}
                                        placeholder="Ví dụ: 30"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center">
                                <div className="grid gap-2">
                                    <Label htmlFor="completion-criteria">Tiêu chí hoàn thành</Label>
                                    <Input
                                        id="completion-criteria"
                                        value={completionCriteria}
                                        onChange={(event) => setCompletionCriteria(event.target.value)}
                                        placeholder="Ví dụ: Quiz"
                                    />
                                </div>
                                <div className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3 md:min-w-[180px]">
                                    <Label htmlFor="is-mandatory">Bắt buộc</Label>
                                    <Switch id="is-mandatory" checked={isMandatory} onCheckedChange={setIsMandatory} />
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    {wizardStep === 1 ? (
                        <Button onClick={handleNextStep} className="bg-[#0F4C75] hover:bg-[#1A5F8C]">
                            Tiếp tục
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setWizardStep(1)} disabled={isSubmitting}>
                                Quay lại bước 1
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#0F4C75] hover:bg-[#1A5F8C]">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tạo khóa học
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}