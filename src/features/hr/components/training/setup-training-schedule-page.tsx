'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, Video, Building2, ChevronLeft, Send, Users, Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/features/hr/api/course-service';
import { Course, CourseResult, UpdateCourseCommand } from '@/features/hr/types/course-types';
import type { TrainingPlan } from '@/features/hr/types/training-plan-types';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';
import { CreateCourseDialog } from './create-course-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trainingScheduleSchema } from '@/features/hr/schema/training-schedule-schema';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

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
    publishRedirectPath = '/enterprise/hr/training/courses'
}: { 
    initialCourses?: CourseResult; 
    initialCourseDetails?: Course;
    initialPlans?: TrainingPlan[];
    headingTitle?: string;
    headingDescription?: string;
    publishRedirectPath?: string;
}) {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCourseId = searchParams.get('courseId') || initialCourseDetails?.id || '';

    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const locationType = form.watch('locationType');
    const selectedCourseId = form.watch('selectedCourseId');

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

    // (Removed static pageSize: 100 courses fetch to use SearchableCombobox)

    // Fetch Details for summary
    const { data: currentCourse, isLoading: isLoadingDetails } = useSWR<Course>(
        selectedCourseId ? `/api/Course/${selectedCourseId}` : null,
        () => courseService.getCourseDetails(selectedCourseId),
        { fallbackData: selectedCourseId === initialCourseDetails?.id ? initialCourseDetails : undefined }
    );

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

        setIsSubmitting(true);
        try {
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

            if (isDraft) {
                toast({ title: 'Thành công', description: 'Đã lưu bản nháp lịch trình.' });
            } else {
                toast({ title: 'Thành công', description: 'Đã thiết lập lịch trình khóa học. Email trainer sẽ được gửi cùng lúc khi phân công học viên.' });
                router.push(publishRedirectPath);
            }
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
        form.setValue('selectedCourseId', courseId, { shouldValidate: true });
        setIsCreateCourseOpen(false);
        setRefreshKey(prev => prev + 1);
        toast({ title: 'Đã tạo khóa học', description: 'Khóa học đã được tạo.' });
    };


    return (
        <div className="w-full space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F4C75] mb-1">{headingTitle}</h1>
                    <p className="text-gray-500">{headingDescription}</p>
                </div>
                <Button
                    type="button"
                    onClick={() => setIsCreateCourseOpen(true)}
                    className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Lập lịch kế hoạch mới
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 space-y-10 border border-gray-100">
            <Form {...form}>
                <form className="space-y-10">

                {/* Course Selection */}
                <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-100">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">CHỌN KHÓA HỌC THEO KẾ HOẠCH</label>

                        <div className="mt-3">
                            <SearchableCombobox<Course>
                                key={refreshKey}
                                value={selectedCourseId}
                                onValueChange={(id) => form.setValue('selectedCourseId', id, { shouldValidate: true })}
                                fetcher={async (search, page) => {
                                    const res = await courseService.getAllCourses({ search, page, pageSize: 20, status: 'Draft' });
                                    const totalPages = res.totalPages || 1;
                                    return { items: res.items, hasNextPage: page < totalPages };
                                }}
                                renderItem={(c) => `${c.courseName} (Mã: ${c.courseCode})${c.startTime ? ' ✓ Đã thiết lập' : ''}`}
                                extractValue={(c) => c.id}
                                placeholder="Chọn khóa học..."
                                searchPlaceholder="Tìm theo tên hoặc mã khóa học..."
                                defaultItems={initialCourses?.items || []}
                                className="w-full md:w-[600px]"
                            />
                        </div>
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
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormControl>
                                                <div className="relative">
                                                    <label className="text-sm font-semibold text-gray-600 block mb-2">Ngày bắt đầu</label>
                                                    <Input type="date" {...field} className="bg-white border-gray-200" />
                                                    <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 top-9 pointer-events-none" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormControl>
                                                <div className="relative">
                                                    <label className="text-sm font-semibold text-gray-600 block mb-2">Ngày kết thúc</label>
                                                    <Input type="date" min={form.watch('startDate')} {...field} className="bg-white border-gray-200" />
                                                    <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 top-9 pointer-events-none" />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="startTime"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 block">Giờ bắt đầu</label>
                                            <FormControl>
                                                <Input type="time" {...field} className="bg-white border-gray-200" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endTime"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-600 block">Giờ kết thúc</label>
                                            <FormControl>
                                                <Input type="time" {...field} className="bg-white border-gray-200" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                    type="button"
                                    onClick={() => form.setValue('locationType', 'online', { shouldValidate: true })}
                                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${locationType === 'online' ? 'border-[#0F4C75] bg-blue-50/20' : 'border-gray-100 hover:border-blue-100 bg-white'}`}
                                >
                                    <div className={`p-3 rounded-full ${locationType === 'online' ? 'bg-[#0F4C75] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <span className={`font-semibold ${locationType === 'online' ? 'text-[#0F4C75]' : 'text-gray-600'}`}>Trực tuyến</span>
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={() => form.setValue('locationType', 'offline', { shouldValidate: true })}
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
                                    <FormField
                                        control={form.control}
                                        name="meetingLink"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-600">Link cuộc họp (tùy chọn)</label>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Để trống để tự động tạo Zoom, hoặc nhập https://..."
                                                        className="bg-gray-50/50 border-gray-200 font-medium"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2 mt-4 animate-in fade-in duration-300">
                                    <FormField
                                        control={form.control}
                                        name="offlineLocation"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-600">Phòng họp / Địa điểm</label>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder="Nhập tên phòng hoặc địa chỉ..."
                                                        className="bg-gray-50/50 border-gray-200 font-medium"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2">
                                <Send className="w-5 h-5 text-[#0F4C75]" />
                                <h2 className="text-[15px] font-bold text-[#0F4C75] tracking-wide">3. Thiết lập thông báo khi phân công</h2>
                            </div>
                            
                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
                                <FormField
                                    control={form.control}
                                    name="notifyTrainerOnAssignment"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-gray-700">Thông báo giảng viên khi phân công học viên</span>
                                                    <p className="text-xs text-gray-500 mt-1">Email giảng viên sẽ được gửi cùng lúc với email học viên ở bước phân công.</p>
                                                </div>
                                            </div>
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-[#0F4C75]" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
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
                            type="button"
                            variant="outline" 
                            onClick={form.handleSubmit((data) => onSubmit(data, true))}
                            disabled={isSubmitting || !selectedCourseId}
                            className="px-6 rounded-full border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700"
                        >
                            Lưu nháp
                        </Button>
                        <Button
                            type="button"
                            onClick={form.handleSubmit((data) => onSubmit(data, false))}
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

                </form>
            </Form>
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
