'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, Video, Building2, ChevronLeft, Send, Check as CheckIcon, Users, Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/features/hr/api/course-service';
import { Course, CourseResult, UpdateCourseCommand } from '@/features/hr/types/course-types';
import type { TrainingPlan } from '@/features/hr/types/training-plan-types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreateCourseDialog } from './create-course-dialog';

function isValidHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function sanitizePlainText(value: string): string {
    return value
        .replace(/[<>]/g, '')
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

export function SetupTrainingSchedulePage({ 
    initialCourses, 
    initialCourseDetails,
    initialPlans = [],
    headingTitle = 'Tạo khóa học & Lập lịch đào tạo',
    headingDescription = 'Thiết lập thời gian, địa điểm và thông báo cho khóa học.',
    stepTwoLabel = 'Bước 2: HR lập lịch & thông báo',
    publishRedirectPath = '/enterprise/hr/training/courses'
}: { 
    initialCourses?: CourseResult; 
    initialCourseDetails?: Course;
    initialPlans?: TrainingPlan[];
    headingTitle?: string;
    headingDescription?: string;
    stepTwoLabel?: string;
    publishRedirectPath?: string;
}) {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCourseId = searchParams.get('courseId') || initialCourseDetails?.id || '';

    const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
    const [locationType, setLocationType] = useState<'online' | 'offline'>('online');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [offlineLocation, setOfflineLocation] = useState('');
    const [notifyTrainerOnAssignment, setNotifyTrainerOnAssignment] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);

    const buildDateTime = (date: string, time: string): Date | null => {
        if (!date || !time) {
            return null;
        }
        const value = new Date(`${date}T${time}:00`);
        return Number.isNaN(value.getTime()) ? null : value;
    };

    const resolveStartTimeIso = (): string | null => {
        const dateTime = buildDateTime(startDate, startTime);
        if (dateTime) {
            return dateTime.toISOString();
        }
        if (currentCourse?.startTime) {
            return currentCourse.startTime;
        }
        return null;
    };

    // Fetch Courses
    const { data: coursesData, isLoading: isLoadingCourses, mutate: mutateCourses } = useSWR<CourseResult>(
        ['/api/Course', 'scheduling'],
        () => courseService.getAllCourses({ status: 'Draft', pageSize: 100 }),
        { fallbackData: initialCourses }
    );

    // Fetch Details for summary
    const { data: currentCourse, isLoading: isLoadingDetails } = useSWR<Course>(
        selectedCourseId ? `/api/Course/${selectedCourseId}` : null,
        () => courseService.getCourseDetails(selectedCourseId),
        { fallbackData: selectedCourseId === initialCourseDetails?.id ? initialCourseDetails : undefined }
    );

    const handleSaveDraft = async () => {
        if (!selectedCourseId) {
            toast({ title: 'Lỗi', description: 'Vui lòng chọn khóa học', variant: 'destructive' });
            return;
        }

        if (!currentCourse) {
            toast({ title: 'Lỗi', description: 'Chưa tải được thông tin khóa học. Vui lòng thử lại.', variant: 'destructive' });
            return;
        }

        const normalizedTrainerEmail = (currentCourse.trainerEmail || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedTrainerEmail)) {
            toast({ title: 'Lỗi', description: 'Khóa học chưa có email giảng viên hợp lệ.', variant: 'destructive' });
            return;
        }

        const normalizedMeetingLink = meetingLink.trim();
        const normalizedOfflineLocation = sanitizePlainText(offlineLocation);

        if (locationType === 'online' && normalizedMeetingLink && !isValidHttpUrl(normalizedMeetingLink)) {
            toast({ title: 'Lỗi', description: 'Link cuộc họp không hợp lệ. Để trống nếu muốn hệ thống tự tạo Zoom.', variant: 'destructive' });
            return;
        }

        const draftStart = buildDateTime(startDate, startTime);
        const draftEnd = buildDateTime(endDate, endTime);
        if (draftStart && draftEnd && draftEnd < draftStart) {
            toast({ title: 'Lỗi', description: 'Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu', variant: 'destructive' });
            return;
        }

        if (locationType === 'offline' && !normalizedOfflineLocation) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập phòng họp/địa điểm tổ chức', variant: 'destructive' });
            return;
        }

        const resolvedStartTime = resolveStartTimeIso();
        if (!resolvedStartTime) {
            toast({ title: 'Lỗi', description: 'Khóa học chưa có thời gian bắt đầu hợp lệ. Vui lòng chọn ngày giờ.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const { baseDescription } = parseScheduleConfig(currentCourse?.description);
            const locationValue = locationType === 'online' ? (normalizedMeetingLink || 'Zoom (tự động tạo khi phân công)') : normalizedOfflineLocation;
            await courseService.updateCourse(selectedCourseId, {
                ...currentCourse!,
                trainerEmail: normalizedTrainerEmail,
                startTime: resolvedStartTime,
                isOnline: locationType === 'online',
                location: locationValue,
                description: buildScheduleDescription(baseDescription, { startDate, startTime, endDate, endTime }, locationValue, notifyTrainerOnAssignment, true),
            } as UpdateCourseCommand);
            toast({ title: 'Thành công', description: 'Đã lưu bản nháp lịch trình.' });
        } catch (err) {
            const errorMessage = err instanceof Error
                ? err.message
                : 'Không thể lưu bản nháp lịch trình. Vui lòng thử lại.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePublish = async () => {
        if (!selectedCourseId) {
            toast({ title: 'Lỗi', description: 'Vui lòng chọn khóa học', variant: 'destructive' });
            return;
        }

        if (!currentCourse) {
            toast({ title: 'Lỗi', description: 'Chưa tải được thông tin khóa học. Vui lòng thử lại.', variant: 'destructive' });
            return;
        }

        const normalizedTrainerEmail = (currentCourse.trainerEmail || '').trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedTrainerEmail)) {
            toast({ title: 'Lỗi', description: 'Khóa học chưa có email giảng viên hợp lệ.', variant: 'destructive' });
            return;
        }

        const normalizedMeetingLink = meetingLink.trim();
        const normalizedOfflineLocation = sanitizePlainText(offlineLocation);

        if (!startDate || !endDate || !startTime || !endTime) {
            toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ ngày và giờ bắt đầu/kết thúc', variant: 'destructive' });
            return;
        }

        const publishStart = buildDateTime(startDate, startTime);
        const publishEnd = buildDateTime(endDate, endTime);
        if (!publishStart || !publishEnd || publishEnd < publishStart) {
            toast({ title: 'Lỗi', description: 'Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu', variant: 'destructive' });
            return;
        }

        if (locationType === 'offline' && !normalizedOfflineLocation) {
            toast({ title: 'Lỗi', description: 'Vui lòng nhập phòng họp/địa điểm tổ chức', variant: 'destructive' });
            return;
        }

        if (locationType === 'online' && normalizedMeetingLink && !isValidHttpUrl(normalizedMeetingLink)) {
            toast({ title: 'Lỗi', description: 'Link cuộc họp không hợp lệ. Để trống nếu muốn hệ thống tự tạo Zoom.', variant: 'destructive' });
            return;
        }

        const resolvedStartTime = resolveStartTimeIso();
        if (!resolvedStartTime) {
            toast({ title: 'Lỗi', description: 'Không xác định được thời gian bắt đầu hợp lệ.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const { baseDescription } = parseScheduleConfig(currentCourse?.description);
            const locationValue = locationType === 'online' ? (normalizedMeetingLink || 'Zoom (tự động tạo khi phân công)') : normalizedOfflineLocation;
            await courseService.updateCourse(selectedCourseId, {
                ...currentCourse!,
                trainerEmail: normalizedTrainerEmail,
                startTime: resolvedStartTime,
                isOnline: locationType === 'online',
                location: locationValue,
                description: buildScheduleDescription(baseDescription, { startDate, startTime, endDate, endTime }, locationValue, notifyTrainerOnAssignment, false),
            } as UpdateCourseCommand);

            // 2. Complete scheduling step only (no curriculum/lesson/publish calls here).
            toast({ title: 'Thành công', description: 'Đã thiết lập lịch trình khóa học. Email trainer sẽ được gửi cùng lúc khi phân công học viên.' });
            router.push(publishRedirectPath);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Không thể hoàn tất thiết lập lịch trình. Vui lòng thử lại.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCourseCreated = async (courseId: string) => {
        setSelectedCourseId(courseId);
        setIsCreateCourseOpen(false);
        await mutateCourses();
        toast({ title: 'Đã tạo khóa học', description: 'Khóa học đã được tạo.' });
    };

    const courses = coursesData?.items || [];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F4C75] mb-1">{headingTitle}</h1>
                    <p className="text-gray-500">{headingDescription}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 space-y-10 border border-gray-100">

                {/* Stepper */}
                <div className="flex items-center w-full px-4 pt-2">
                    <div className="flex flex-col flex-1 relative">
                        <div className="flex items-center justify-between w-full mb-2 z-10">
                            <div className="flex items-center gap-3 bg-white pr-4">
                                <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center border border-green-200 shadow-sm">
                                    <CheckIcon className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-sm text-gray-500">Bước 1: Tạo khóa học</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white pl-4">
                                <div className="w-7 h-7 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-bold border-2 border-[#BBE1FA] shadow-md">
                                    2
                                </div>
                                <span className="font-bold text-sm text-[#0F4C75] tracking-tight">{stepTwoLabel}</span>
                            </div>
                        </div>
                        <div className="absolute top-3.5 left-0 w-full h-[2px] bg-gray-100 rounded-full -z-0">
                            <div className="h-full bg-gradient-to-r from-green-400 to-[#0F4C75] rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Course Selection */}
                <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-100">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">CHỌN KHÓA HỌC THEO KẾ HOẠCH</label>
                        <Button
                            type="button"
                            onClick={() => setIsCreateCourseOpen(true)}
                            className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Lập lịch kế hoạch mới
                        </Button>
                    </div>

                    {courses.length === 0 && !isLoadingCourses ? (
                        <div className="mt-3 rounded-lg border border-dashed border-blue-200 bg-white px-4 py-4 text-sm text-[#0F4C75]">
                            Chưa có khóa học nháp để lập lịch. Hãy tạo khóa học theo kế hoạch ngay tại trang này.
                        </div>
                    ) : (
                        <div className="mt-3">
                            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                <SelectTrigger className="w-full md:w-[600px] bg-white border-gray-200">
                                    <SelectValue placeholder={isLoadingCourses ? "Đang tải danh sách..." : "Chọn khóa học..."} />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(course => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.courseName} (Mã: {course.courseCode})
                                            {course.startTime ? ' ✓ Đã thiết lập' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                {!selectedCourseId && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        Vui lòng tạo hoặc chọn khóa học trước khi cấu hình lịch đào tạo.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-t border-gray-50 pt-8">
                    {/* Left side form */}
                    <div className="md:col-span-8 space-y-10">
                        {/* Section 1 */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#0F4C75]" />
                                <h2 className="text-[15px] font-bold text-[#0F4C75] tracking-wide">1. Thông tin thời gian</h2>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Ngày bắt đầu</label>
                                    <div className="relative">
                                        <Input 
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="bg-white border-gray-200" 
                                        />
                                        <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Ngày kết thúc</label>
                                    <div className="relative">
                                        <Input 
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-white border-gray-200" 
                                        />
                                        <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Giờ bắt đầu</label>
                                    <Input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Giờ kết thúc</label>
                                    <Input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="bg-white border-gray-200"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#0F4C75]" />
                                <h2 className="text-[15px] font-bold text-[#0F4C75] tracking-wide">2. Địa điểm & Hình thức</h2>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setLocationType('online')}
                                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${locationType === 'online' ? 'border-[#0F4C75] bg-blue-50/20' : 'border-gray-100 hover:border-blue-100 bg-white'}`}
                                >
                                    <div className={`p-3 rounded-full ${locationType === 'online' ? 'bg-[#0F4C75] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <span className={`font-semibold ${locationType === 'online' ? 'text-[#0F4C75]' : 'text-gray-600'}`}>Trực tuyến</span>
                                </button>
                                
                                <button 
                                    onClick={() => setLocationType('offline')}
                                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${locationType === 'offline' ? 'border-[#0F4C75] bg-blue-50/20' : 'border-gray-100 hover:border-blue-100 bg-white'}`}
                                >
                                    <div className={`p-3 rounded-full ${locationType === 'offline' ? 'bg-[#0F4C75] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <span className={`font-semibold ${locationType === 'offline' ? 'text-[#0F4C75]' : 'text-gray-600'}`}>Tại văn phòng</span>
                                </button>
                            </div>

                            {locationType === 'online' ? (
                                <div className="space-y-3 mt-4 animate-in fade-in duration-300">
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                                        <Video className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-blue-800">Zoom Meeting tự động</p>
                                            <p className="text-xs text-blue-600 mt-0.5">Hệ thống sẽ tự động tạo phòng họp Zoom và gửi link cho giảng viên + học viên khi phân công. Bạn có thể bỏ trống hoặc nhập link thủ công.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-600">Link cuộc họp (tùy chọn)</label>
                                        <Input
                                            value={meetingLink}
                                            onChange={(e) => setMeetingLink(e.target.value)}
                                            placeholder="Để trống để tự động tạo Zoom, hoặc nhập https://..."
                                            className="bg-gray-50/50 border-gray-200 font-medium"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 mt-4 animate-in fade-in duration-300">
                                    <label className="text-sm font-semibold text-gray-600">Phòng họp / Địa điểm</label>
                                    <Input
                                        value={offlineLocation}
                                        onChange={(e) => setOfflineLocation(e.target.value)}
                                        placeholder="Nhập tên phòng hoặc địa chỉ..."
                                        className="bg-gray-50/50 border-gray-200 font-medium"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2">
                                <Send className="w-5 h-5 text-[#0F4C75]" />
                                <h2 className="text-[15px] font-bold text-[#0F4C75] tracking-wide">3. Cấu hình thông báo khi phân công</h2>
                            </div>
                            
                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-700">Gửi email trainer khi phân công học viên</span>
                                            <p className="text-xs text-gray-500 mt-1">Email trainer không gửi ở bước này; sẽ gửi cùng lúc với email học viên ở bước phân công.</p>
                                        </div>
                                    </div>
                                    <Switch checked={notifyTrainerOnAssignment} onCheckedChange={setNotifyTrainerOnAssignment} className="data-[state=checked]:bg-[#0F4C75]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side summary */}
                    <div className="md:col-span-4">
                        <div className="sticky top-6 space-y-6">
                            <div className="bg-[#0F4C75] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden min-h-[300px]">
                                {isLoadingDetails ? (
                                    <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>
                                ) : (
                                    <>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                                        <h3 className="font-bold text-sm tracking-wider uppercase mb-6 text-blue-100">TÓM TẮT KHÓA HỌC</h3>
                                        
                                        <div className="space-y-6 relative z-10">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                    <Users className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-blue-200 mb-1">Số lượng học viên dự kiến</p>
                                                    <p className="font-bold text-lg mb-1">{currentCourse?.maxEnrollments || 0} Học viên</p>
                                                    <Badge variant="secondary" className="bg-blue-400/30 text-blue-100 border-none font-medium">Theo cấu hình khóa học</Badge>
                                                </div>
                                            </div>

                                            <Separator className="bg-white/20" />

                                            <div className="pt-2">
                                                <p className="text-xs text-blue-200 mb-1">Khóa học</p>
                                                <p className="font-medium text-blue-50 truncate">{currentCourse?.courseName}</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="bg-orange-50/50 border border-orange-100/50 p-5 rounded-xl border-dashed">
                                <div className="flex items-start gap-3 text-orange-800">
                                    <CalendarIcon className="w-5 h-5 mt-0.5 shrink-0 opacity-70" />
                                    <div>
                                        <h4 className="font-semibold text-sm mb-1">Ghi chú thiết lập</h4>
                                        <p className="text-sm italic opacity-80 leading-relaxed">
                                            &quot;Vui lòng kiểm tra kỹ thời gian biểu để tránh trùng lặp với các khóa học khác trong cùng bộ phận.&quot;
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-6 mt-8 border-t border-gray-100 flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.back()} className="text-gray-600 font-medium">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                    </Button>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={handleSaveDraft}
                            disabled={isSubmitting || !selectedCourseId}
                            className="px-6 rounded-full border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700"
                        >
                            Lưu nháp
                        </Button>
                        <Button 
                            onClick={handlePublish}
                            disabled={isSubmitting || !selectedCourseId}
                            className="px-6 rounded-full bg-gradient-to-r from-[#0F4C75] to-[#1A5F8C] hover:opacity-90 text-white min-w-[220px] shadow-md transition-all active:scale-95"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>Hoàn tất thiết lập <Send className="w-4 h-4 ml-2" /></>
                            )}
                        </Button>
                    </div>
                </div>

            </div>

            <CreateCourseDialog
                open={isCreateCourseOpen}
                plan={null}
                availablePlans={initialPlans}
                onOpenChange={setIsCreateCourseOpen}
                onCreated={(courseId) => {
                    void handleCourseCreated(courseId);
                }}
            />
        </div>
    );
}
