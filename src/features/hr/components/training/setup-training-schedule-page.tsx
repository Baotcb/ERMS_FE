'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Clock, Video, Building2, ChevronLeft, Send, Check as CheckIcon, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/features/hr/api/course-service';
import { Course, CourseResult, UpdateCourseCommand } from '@/features/hr/types/course-types';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

function isValidHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

export function SetupTrainingSchedulePage({ 
    initialCourses, 
    initialCourseDetails 
}: { 
    initialCourses?: CourseResult; 
    initialCourseDetails?: Course;
}) {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCourseId = searchParams.get('courseId') || initialCourseDetails?.id || '';

    const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
    const [locationType, setLocationType] = useState<'online' | 'offline'>('online');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [meetingLink, setMeetingLink] = useState('https://meet.google.com/');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Courses
    const { data: coursesData, isLoading: isLoadingCourses } = useSWR<CourseResult>(
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

        if (locationType === 'online' && meetingLink && !isValidHttpUrl(meetingLink)) {
            toast({ title: 'Lỗi', description: 'Link cuộc họp không hợp lệ', variant: 'destructive' });
            return;
        }

        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            toast({ title: 'Lỗi', description: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu', variant: 'destructive' });
            return;
        }

        if (startDate && endDate && startDate === endDate && startTime && endTime && endTime <= startTime) {
            toast({ title: 'Lỗi', description: 'Giờ kết thúc phải sau giờ bắt đầu', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            const baseDescription = currentCourse?.description?.split('\nLịch trình:')[0]?.split('\n[DRAFT] Lịch trình:')[0] || '';
            await courseService.updateCourse(selectedCourseId, {
                ...currentCourse!,
                description: `${baseDescription}\n[DRAFT] Lịch trình: ${startDate} to ${endDate}, ${startTime}-${endTime}. Địa điểm: ${locationType === 'online' ? meetingLink : 'Tại văn phòng'}`
            } as UpdateCourseCommand);
            toast({ title: 'Thành công', description: 'Đã lưu bản nháp lịch trình.' });
        } catch (error: unknown) {
            void error;
            toast({ title: 'Lỗi', description: 'Không thể lưu bản nháp lịch trình. Vui lòng thử lại.', variant: 'destructive' });
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

        if (!startDate || !endDate || !startTime || !endTime) {
            toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin thời gian', variant: 'destructive' });
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            toast({ title: 'Lỗi', description: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu', variant: 'destructive' });
            return;
        }

        if (startDate === endDate && endTime <= startTime) {
            toast({ title: 'Lỗi', description: 'Giờ kết thúc phải sau giờ bắt đầu', variant: 'destructive' });
            return;
        }

        if (locationType === 'online' && !isValidHttpUrl(meetingLink)) {
            toast({ title: 'Lỗi', description: 'Link cuộc họp không hợp lệ', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Update Course Schedule info
            const baseDescription = currentCourse?.description?.split('\nLịch trình:')[0]?.split('\n[DRAFT] Lịch trình:')[0] || '';
            await courseService.updateCourse(selectedCourseId, {
                ...currentCourse!,
                description: `${baseDescription}\nLịch trình: ${startDate} to ${endDate}, ${startTime}-${endTime}. Địa điểm: ${locationType === 'online' ? meetingLink : 'Tại văn phòng'}`
            } as UpdateCourseCommand);

            // 2. Publish (Finalize and notify)
            await courseService.publishCourse(selectedCourseId);

            toast({ title: 'Thành công', description: 'Đã thiết lập lịch trình và gửi thông báo cho tất cả học viên.' });
            router.push('/enterprise/hr/training/requests'); 
        } catch (error: unknown) {
            void error;
            toast({ title: 'Lỗi', description: 'Không thể hoàn tất thiết lập lịch trình. Vui lòng thử lại.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const courses = coursesData?.items || [];

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F4C75] mb-1">Thiết lập Lịch trình Đào tạo</h1>
                    <p className="text-gray-500">Cấu hình thời gian, địa điểm và gửi thông báo cho khóa học.</p>
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
                                <span className="font-semibold text-sm text-gray-500">Bước 1: Phân công</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white pl-4">
                                <div className="w-7 h-7 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-bold border-2 border-[#BBE1FA] shadow-md">
                                    2
                                </div>
                                <span className="font-bold text-sm text-[#0F4C75] tracking-tight">Bước 2: Thiết lập</span>
                            </div>
                        </div>
                        <div className="absolute top-3.5 left-0 w-full h-[2px] bg-gray-100 rounded-full -z-0">
                            <div className="h-full bg-gradient-to-r from-green-400 to-[#0F4C75] rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Course Selection */}
                <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-100">
                    <label className="text-sm font-semibold text-gray-700 block mb-2 uppercase tracking-wider">CHỌN KHÓA HỌC CẦN THIẾT LẬP</label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                        <SelectTrigger className="w-full md:w-[600px] bg-white border-gray-200">
                            <SelectValue placeholder={isLoadingCourses ? "Đang tải danh sách..." : "Chọn khóa học..."} />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map(course => (
                                <SelectItem key={course.id} value={course.id}>
                                    {course.courseName} (Mã: {course.courseCode})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

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
                                    <label className="text-sm font-semibold text-gray-600">Giờ bắt đầu buổi học</label>
                                    <div className="relative">
                                        <Input 
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="bg-white border-gray-200" 
                                        />
                                        <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Giờ kết thúc buổi học</label>
                                    <div className="relative">
                                        <Input 
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="bg-white border-gray-200" 
                                        />
                                        <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                                    </div>
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
                                <div className="space-y-2 mt-4 animate-in fade-in duration-300">
                                    <label className="text-sm font-semibold text-gray-600">Link cuộc họp (Zoom/Meet/Teams)</label>
                                    <Input 
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        className="bg-gray-50/50 border-gray-200 text-[#0F4C75] font-medium" 
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2 mt-4 animate-in fade-in duration-300">
                                    <label className="text-sm font-semibold text-gray-600">Phòng họp / Địa điểm</label>
                                    <Input placeholder="Nhập tên phòng hoặc địa chỉ..." className="bg-gray-50/50 border-gray-200 font-medium" />
                                </div>
                            )}
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2">
                                <Send className="w-5 h-5 text-[#0F4C75]" />
                                <h2 className="text-[15px] font-bold text-[#0F4C75] tracking-wide">3. Cấu hình thông báo</h2>
                            </div>
                            
                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Send className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-gray-700">Gửi email cho giảng viên</span>
                                    </div>
                                    <Switch defaultChecked className="data-[state=checked]:bg-[#0F4C75]" />
                                </div>
                                <Separator className="bg-gray-200" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-gray-700">Gửi email cho học viên</span>
                                    </div>
                                    <Switch defaultChecked className="data-[state=checked]:bg-[#0F4C75]" />
                                </div>
                                <Separator className="bg-gray-200" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-100 text-gray-500 flex items-center justify-center">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-gray-700">Nhắc nhở trước 15 phút</span>
                                    </div>
                                    <Switch className="data-[state=checked]:bg-[#0F4C75]" />
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
                                        <h3 className="font-bold text-sm tracking-wider uppercase mb-6 text-blue-100">TÓM TẮT PHÂN CÔNG</h3>
                                        
                                        <div className="space-y-6 relative z-10">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                    <Users className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-blue-200 mb-1">Giảng viên phụ trách</p>
                                                    <p className="font-bold text-lg mb-1">{currentCourse?.trainerName || 'Chưa phân công'}</p>
                                                    {currentCourse?.trainerId && (
                                                        <Badge variant="secondary" className="bg-white/20 text-blue-50 border-none font-normal">Đã xác nhận</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <Separator className="bg-white/20" />

                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                    <Users className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-blue-200 mb-1">Số lượng học viên</p>
                                                    <p className="font-bold text-lg mb-1">{currentCourse?.enrollmentCount || 0} Học viên</p>
                                                    <Badge variant="secondary" className="bg-blue-400/30 text-blue-100 border-none font-medium">Danh sách đã duyệt</Badge>
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
                                <>Hoàn tất & Gửi thông báo <Send className="w-4 h-4 ml-2" /></>
                            )}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
