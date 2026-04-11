'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Settings, Save } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui/select';
import { useAsyncAction } from '@/hooks/use-async-action';

import { courseService } from '../../api/course-service';
import type { Course } from '../../types/course-types';
import { updateCourseSchema, type UpdateCourseValues } from '../../schema/course-schema';

interface UpdateCourseDialogProps {
    course: Course;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function UpdateCourseDialog({ course, open, onOpenChange, onSuccess }: UpdateCourseDialogProps) {
    const { execute, isSubmitting: isLoading } = useAsyncAction();

    const form = useForm<UpdateCourseValues>({
        resolver: zodResolver(updateCourseSchema),
        defaultValues: {
            courseName: '',
            courseCode: '',
            trainerEmail: '',
            description: '',
            location: '',
            startTime: '',
            isOnline: false,
            durationMinutes: 60,
            level: 'Beginner',
            isMandatory: false,
            maxEnrollments: 50,
            enrollmentDeadline: '',
            completionCriteria: '',
        },
    });

    useEffect(() => {
        if (open && course) {
            form.reset({
                courseName: course.courseName,
                courseCode: course.courseCode,
                trainerEmail: course.trainerEmail || '',
                description: course.description || '',
                location: course.location || '',
                startTime: course.startTime ? format(new Date(course.startTime), "yyyy-MM-dd'T'HH:mm") : '',
                isOnline: course.isOnline || false,
                durationMinutes: course.durationMinutes || 60,
                level: course.level || 'Beginner',
                isMandatory: course.isMandatory || false,
                maxEnrollments: course.maxEnrollments || 50,
                enrollmentDeadline: course.enrollmentDeadline ? format(new Date(course.enrollmentDeadline), "yyyy-MM-dd'T'HH:mm") : '',
                completionCriteria: course.completionCriteria || 'Hoàn thành 100% bài học',
            });
        }
    }, [open, course, form]);

    const onSubmit = async (values: UpdateCourseValues) => {
        const payload = {
            id: course.id,
            trainingPlanId: course.trainingPlanId,
            courseName: values.courseName,
            courseCode: values.courseCode,
            trainerEmail: values.trainerEmail,
            description: values.description,
            location: values.location,
            startTime: new Date(values.startTime).toISOString(),
            isOnline: values.isOnline,
            durationMinutes: values.durationMinutes,
            level: values.level,
            isMandatory: values.isMandatory,
            maxEnrollments: values.maxEnrollments,
            enrollmentDeadline: values.enrollmentDeadline ? new Date(values.enrollmentDeadline).toISOString() : undefined,
            completionCriteria: values.completionCriteria,
            thumbnailUrl: course.thumbnailUrl,
        };

        await execute(
            async () => {
                const res = await courseService.updateCourse(course.id, payload);
                if (!res.ok) throw new Error('Cập nhật thất bại.');
                return res;
            },
            {
                successMessage: { title: 'Thành công', description: 'Thông tin khóa học đã được cập nhật.' },
                errorFallback: 'Không thể cập nhật khóa học.',
                onSuccess: () => {
                    onOpenChange(false);
                    onSuccess();
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-[#0F4C75] to-[#3282B8] px-6 py-6 text-white shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Settings className="w-5 h-5" /> Cập Nhật Thông Tin Khóa Học
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 mt-1.5">
                            Thay đổi các thiết lập cốt lõi của không gian học tập này.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="courseName" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-[#0F4C75] font-semibold">Tên Khóa Học *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Vd: Leadership Training" className="border-gray-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="courseCode" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Mã Khóa Học *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Vd: LDR-2026" className="border-gray-200 uppercase" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="trainerEmail" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Email Giảng Viên *</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="trainer@fpt.com" className="border-gray-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="startTime" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Thời Gian Bắt Đầu *</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" className="border-gray-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Thời Lượng (Phút)</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="border-gray-200" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="level" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Cấp Độ</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="border-gray-200">
                                                    <SelectValue placeholder="Chọn cấp độ" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Cơ bản (Beginner)</SelectItem>
                                                <SelectItem value="Intermediate">Trung cấp (Intermediate)</SelectItem>
                                                <SelectItem value="Advanced">Nâng cao (Advanced)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="maxEnrollments" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Số Học Viên Tối Đa</FormLabel>
                                        <FormControl>
                                            <Input type="number" className="border-gray-200" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="location" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-[#0F4C75] font-semibold">Địa Điểm / Nền tảng</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Phòng họp A hoặc link MS Teams..." className="border-gray-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="completionCriteria" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-[#0F4C75] font-semibold">Tiêu Chí Hoàn Thành *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Vd: Tham gia đầy đủ và đạt 80% bài kiểm tra cuối khóa" className="border-gray-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-[#0F4C75] font-semibold">Mô Tả Khóa Học</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Tổng quan nội dung..." className="min-h-[100px] border-gray-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="isOnline" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-200 p-4 shadow-sm bg-gray-50/50">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-[#0F4C75] font-semibold">Học Trực Tuyến</FormLabel>
                                            <p className="text-xs text-gray-500 font-medium">Khóa học E-learning?</p>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                                
                                <FormField control={form.control} name="isMandatory" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-gray-200 p-4 shadow-sm bg-gray-50/50">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-[#0F4C75] font-semibold">Bắt Buộc Tham Gia</FormLabel>
                                            <p className="text-xs text-gray-500 font-medium">Nhân viên được gán phải học?</p>
                                        </div>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            
                            <DialogFooter className="pt-5 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 mt-4">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white min-w-[120px]" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Lưu thay đổi
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
