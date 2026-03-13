'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Loader2, Search } from 'lucide-react';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/features/hr/api/course-service';
import { getEmployees, type Employee } from '@/features/hr/api/employee-service';
import type { CreateCourseCommand } from '@/features/hr/types/course-types';
import type { TrainingPlan } from '@/features/hr/types/training-plan-types';

interface CreateCourseDialogProps {
    open: boolean;
    plan: TrainingPlan | null;
    onOpenChange: (open: boolean) => void;
    onCreated: (courseId: string, planId: string) => void;
    allowEmptyTrainer?: boolean;
    hideTrainerSelection?: boolean;
    availablePlans?: TrainingPlan[];
}

function buildDefaultCourseCode(plan: TrainingPlan): string {
    const suffix = Date.now().toString().slice(-6);
    return `${plan.planCode}-C${suffix}`;
}

function buildQuickCourseCode(): string {
    const suffix = Date.now().toString().slice(-6);
    return `COURSE-${suffix}`;
}

export function CreateCourseDialog({
    open,
    plan,
    onOpenChange,
    onCreated,
    allowEmptyTrainer = false,
    hideTrainerSelection = false,
    availablePlans = [],
}: CreateCourseDialogProps) {
    const { toast } = useToast();
    const [trainerSearch, setTrainerSearch] = useState('');
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [description, setDescription] = useState('');
    const [trainerId, setTrainerId] = useState('');
    const [selectedPlanId, setSelectedPlanId] = useState('');
    const [durationMinutes, setDurationMinutes] = useState('');
    const [maxEnrollments, setMaxEnrollments] = useState('');
    const [level, setLevel] = useState('Co ban');
    const [completionCriteria, setCompletionCriteria] = useState('Quiz');
    const [isMandatory, setIsMandatory] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        setCourseName(plan?.planName || '');
        setCourseCode(plan ? buildDefaultCourseCode(plan) : buildQuickCourseCode());
        setDescription(plan?.description || '');
        setTrainerId('');
        setSelectedPlanId(plan?.id || '');
        setDurationMinutes('');
        setMaxEnrollments('');
        setLevel('Co ban');
        setCompletionCriteria('Quiz');
        setIsMandatory(false);
        setTrainerSearch('');
    }, [open, plan]);

    const { data: employeesData, isLoading: isLoadingEmployees } = useSWR(
        open ? ['/api/Employees', 'create-course-trainers', trainerSearch] : null,
        () => getEmployees({ search: trainerSearch, pageSize: 20 })
    );

    const employees = employeesData?.items || [];
    const trainerCandidates = employees;
    const resolvedPlanId = plan?.id || selectedPlanId;
    const selectedPlan = plan ?? availablePlans.find((item) => item.id === selectedPlanId) ?? null;

    const selectedTrainer = trainerCandidates.find((employee) => employee.id === trainerId) ?? null;

    const handleSubmit = async () => {
        if (!resolvedPlanId) {
            toast({
                title: 'Thiếu kế hoạch đào tạo',
                description: 'Vui lòng chọn training plan trước khi tạo khóa học.',
                variant: 'destructive',
            });
            return;
        }

        if (!courseName.trim() || !courseCode.trim() || (!allowEmptyTrainer && !trainerId)) {
            toast({
                title: 'Thiếu thông tin',
                description: allowEmptyTrainer
                    ? 'Vui lòng nhập tên khóa học và mã khóa học.'
                    : 'Vui lòng nhập tên khóa học, mã khóa học và chọn người đào tạo.',
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

        setIsSubmitting(true);
        try {
            const payload: CreateCourseCommand = {
                trainingPlanId: resolvedPlanId,
                courseName: courseName.trim(),
                courseCode: courseCode.trim(),
                description: description.trim() || undefined,
                trainerId: trainerId || undefined,
                durationMinutes: durationValue ?? undefined,
                level: level.trim() || undefined,
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

            onOpenChange(false);
            onCreated(result.courseId, resolvedPlanId);
        } catch (error) {
            const rawMessage = error instanceof Error ? error.message : 'Không thể tạo khóa học.';
            const normalizedMessage = rawMessage.toLowerCase();
            const message = (!trainerId && hideTrainerSelection) && (
                normalizedMessage.includes('giảng viên') ||
                normalizedMessage.includes('trainer') ||
                normalizedMessage.includes('trainerid')
            )
                ? 'API hiện tại vẫn đang yêu cầu trainer khi tạo khóa học. Cần backend cho phép tạo course trước rồi gán trainer sau.'
                : rawMessage;
            toast({
                title: 'Không thể tạo khóa học',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[720px]">
                <DialogHeader>
                        <DialogTitle>{plan ? 'Tạo khóa học từ kế hoạch' : 'Tạo khóa học theo kế hoạch'}</DialogTitle>
                    <DialogDescription>
                        {plan
                            ? `Tạo khóa học cho kế hoạch ${plan?.planName ?? ''}.`
                            : 'Chọn một training plan đã duyệt để tạo khóa học.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-2">
                    {!plan && availablePlans.length > 0 && (
                        <div className="grid gap-2">
                            <Label>Training plan</Label>
                            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn kế hoạch đào tạo đã duyệt" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availablePlans.map((item) => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.planName} ({item.planCode})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        <div className="grid gap-2">
                            <Label htmlFor="course-level">Cấp độ</Label>
                            <Input
                                id="course-level"
                                value={level}
                                onChange={(event) => setLevel(event.target.value)}
                                placeholder="Ví dụ: Cơ bản, Nâng cao"
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

                    {!hideTrainerSelection && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="trainer-search">Tìm người đào tạo</Label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        id="trainer-search"
                                        value={trainerSearch}
                                        onChange={(event) => setTrainerSearch(event.target.value)}
                                        placeholder="Tìm theo tên hoặc email"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Người đào tạo</Label>
                                <Select value={trainerId} onValueChange={(value) => setTrainerId(value === '__none__' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={isLoadingEmployees ? 'Đang tải danh sách nhân sự...' : (allowEmptyTrainer ? 'Tùy chọn: chọn người đào tạo' : 'Chọn người đào tạo')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allowEmptyTrainer && (
                                            <SelectItem value="__none__">Chưa gán trainer</SelectItem>
                                        )}
                                        {trainerCandidates.map((employee: Employee) => (
                                            <SelectItem key={employee.id} value={employee.id}>
                                                {employee.fullName} {employee.departmentName ? `- ${employee.departmentName}` : ''}
                                                {employee.isTrainer ? ' (Giảng viên)' : ' (Nhân viên)'}
                                            </SelectItem>
                                        ))}
                                        {!isLoadingEmployees && trainerCandidates.length === 0 && (
                                            <SelectItem value="empty" disabled>
                                                Không tìm thấy nhân sự phù hợp
                                            </SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500">
                                    {selectedTrainer
                                        ? `Đã chọn: ${selectedTrainer.fullName}${selectedTrainer.position ? ` - ${selectedTrainer.position}` : ''}`
                                        : allowEmptyTrainer
                                            ? 'Bạn có thể để trống trainer ở bước này.'
                                            : 'Bạn có thể chọn bất kỳ nhân viên nào; khi gắn vào khóa học hệ thống sẽ tự nâng thành giảng viên.'}
                                </p>
                            </div>
                        </>
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
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#0F4C75] hover:bg-[#1A5F8C]">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Tạo khóa học
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}