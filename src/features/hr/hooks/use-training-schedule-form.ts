import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAsyncAction } from '@/hooks/use-async-action';
import { courseService } from '@/features/hr/api/course-service';
import type { Course, UpdateCourseCommand } from '@/features/hr/types/course-types';
import { trainingScheduleSchema } from '@/features/hr/schema/training-schedule-schema';

function sanitizePlainText(value: string): string {
    return value
        .replace(/[<>\/]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseScheduleConfig(description: string | undefined) {
    const raw = description || '';
    const baseDescription = raw.split('\nLịch trình:')[0]?.split('\n[DRAFT] Lịch trình:')[0] || '';
    const notifyMatch = raw.match(/Thông báo:\s*giangvien_khi_phancong=(on|off)/i);
    return {
        baseDescription,
        notifyTrainerOnAssignment: notifyMatch ? notifyMatch[1].toLowerCase() === 'on' : true,
    };
}

function buildScheduleDescription(
    baseDescription: string,
    schedule: { startDate: string; startTime: string; endDate: string; endTime: string },
    locationValue: string,
    notifyTrainer: boolean,
    isDraft: boolean,
): string {
    const prefix = isDraft ? '[DRAFT] ' : '';
    const scheduleInfo = `\n${prefix}Lịch trình: ${schedule.startDate} ${schedule.startTime} đến ${schedule.endDate} ${schedule.endTime}. Địa điểm: ${locationValue}`;
    const notificationConfig = `\nThông báo: giangvien_khi_phancong=${notifyTrainer ? 'on' : 'off'}`;
    return `${baseDescription}${scheduleInfo}${notificationConfig}`;
}

export function useTrainingScheduleForm({
    initialCourseId,
    currentCourse,
    publishRedirectPath
}: {
    initialCourseId: string;
    currentCourse?: Course;
    publishRedirectPath: string;
}) {
    const { toast } = useToast();
    const router = useRouter();
    const { execute, isSubmitting } = useAsyncAction();
    const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const form = useForm<z.infer<typeof trainingScheduleSchema>>({
        resolver: zodResolver(trainingScheduleSchema),
        defaultValues: {
            selectedCourseId: initialCourseId,
            locationType: 'online',
            startDate: '',
            startTime: '',
            endDate: '',
            endTime: '',
            meetingLink: '',
            offlineLocation: '',
            notifyTrainerOnAssignment: true,
        },
        mode: 'onChange',
    });

    const locationType = useWatch({ control: form.control, name: 'locationType' });
    const selectedCourseId = useWatch({ control: form.control, name: 'selectedCourseId' });

    const buildDateTime = (date: string, time: string): Date | null => {
        if (!date || !time) {
            return null;
        }
        const normalizedTime = time.split(':').slice(0, 2).join(':');
        const value = new Date(`${date}T${normalizedTime}:00`);
        return Number.isNaN(value.getTime()) ? null : value;
    };

    const resolveStartTimeIso = (data: z.infer<typeof trainingScheduleSchema>, currentCourseData?: Course): string | null => {
        const dateTime = buildDateTime(data.startDate, data.startTime);
        if (dateTime) {
            return dateTime.toISOString();
        }
        if (currentCourseData?.startTime) {
            return currentCourseData.startTime;
        }
        return null;
    };

    const onSubmit = async (data: z.infer<typeof trainingScheduleSchema>, isDraft: boolean) => {
        if (!currentCourse) {
            toast({ title: 'Lỗi', description: 'Chưa tải được thông tin khóa học. Vui lòng thử lại.', variant: 'destructive' });
            return;
        }

        const normalizedTrainerEmail = (currentCourse.trainerEmail || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedTrainerEmail)) {
            toast({ title: 'Lỗi', description: 'Khóa học chưa có email giảng viên hợp lệ.', variant: 'destructive' });
            return;
        }

        const resolvedStartTime = resolveStartTimeIso(data, currentCourse);
        if (!resolvedStartTime) {
            toast({ title: 'Lỗi', description: 'Không xác định được thời gian bắt đầu hợp lệ.', variant: 'destructive' });
            return;
        }

        await execute(
            async () => {
                const { baseDescription } = parseScheduleConfig(currentCourse?.description);
                const normalizedMeetingLink = (data.meetingLink || '').trim();
                const normalizedOfflineLocation = sanitizePlainText(data.offlineLocation || '');
                
                const locationValue = data.locationType === 'online' 
                    ? (normalizedMeetingLink || 'Zoom (tự động tạo khi phân công)') 
                    : normalizedOfflineLocation;
                    
                await courseService.updateCourse(selectedCourseId, {
                    ...currentCourse,
                    trainerEmail: normalizedTrainerEmail,
                    startTime: resolvedStartTime,
                    isOnline: data.locationType === 'online',
                    location: locationValue,
                    description: buildScheduleDescription(
                        baseDescription, 
                        { startDate: data.startDate, startTime: data.startTime, endDate: data.endDate, endTime: data.endTime }, 
                        locationValue, 
                        data.notifyTrainerOnAssignment, 
                        isDraft
                    ),
                } as UpdateCourseCommand);
            },
            {
                successMessage: isDraft 
                    ? { title: 'Thành công', description: 'Đã lưu bản nháp lịch trình.' }
                    : { title: 'Thành công', description: 'Đã thiết lập lịch trình khóa học. Email trainer sẽ được gửi cùng lúc khi phân công học viên.' },
                errorFallback: 'Không thể hoàn tất thiết lập lịch trình. Vui lòng thử lại.',
                onSuccess: () => {
                    if (!isDraft) {
                        router.push(publishRedirectPath);
                    }
                }
            }
        );
    };

    const handleCourseCreated = async (courseId: string) => {
        form.setValue('selectedCourseId', courseId, { shouldValidate: true });
        setIsCreateCourseOpen(false);
        setRefreshKey(prev => prev + 1);
        toast({ title: 'Đã tạo khóa học', description: 'Khóa học đã được tạo.' });
    };

    return {
        form,
        locationType,
        selectedCourseId,
        isSubmitting,
        isCreateCourseOpen,
        setIsCreateCourseOpen,
        refreshKey,
        setRefreshKey,
        onSubmit,
        handleCourseCreated
    };
}
