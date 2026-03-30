'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    ChevronLeft, Save,
    FileText, Send, CheckCircle2, 
    Layout, ArrowRight, Loader2, Award, XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { Course } from '@/features/hr/types/course-types';
import { useToast } from '@/hooks/use-toast';
import { courseService } from '@/features/hr/api/course-service';
import { buildPublishCourseCommand } from '@/features/hr/utils/course-workflow';

import { ExamBuilder } from './exam-builder';
import { CurriculumManager } from './curriculum-manager';

const courseSchema = z.object({
    courseName: z.string().min(5, 'Tên khóa học ít nhất 5 ký tự'),
    description: z.string().min(20, 'Mô tả ít nhất 20 ký tự'),
    durationMinutes: z.number().min(1, 'Thời lượng phải lớn hơn 0'),
});

type CourseFormValues = z.infer<typeof courseSchema>;

const cleanDescription = (desc: string) => {
    if (!desc) return '';
    // Strip the schedule metadata line (e.g. "Lịch trình: 2026-03-30 10:07 đến ...")
    // Strip the notification config line (e.g. "Thông báo: giangvien_khi_phancong=on")
    // Strip isOnline/IsOnline flags and [DRAFT] prefix
    return desc
        .replace(/\n?\[?DRAFT\]?\s*/gi, '')
        .replace(/\n?Lịch trình:.*$/gim, '')
        .replace(/\n?Thông báo:\s*giangvien_khi_phancong=\w+/gi, '')
        .replace(/(?:isonline|IsOnline)=\w+/gi, '')
        .replace(/^,\s*/, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
};

/* ── Step configuration ── */
const WIZARD_STEPS = [
    { key: 'basics', label: 'Thông tin', icon: Layout },
    { key: 'curriculum', label: 'Nội dung', icon: FileText },
    { key: 'exam', label: 'Bài kiểm tra', icon: Award },
    { key: 'publish', label: 'Hoàn thành', icon: Send },
] as const;

/* ── Horizontal Stepper ── */
function HorizontalStepper({ 
    steps, 
    activeStep, 
    onStepClick 
}: { 
    steps: typeof WIZARD_STEPS; 
    activeStep: string; 
    onStepClick: (key: string) => void;
}) {
    const activeIndex = steps.findIndex(s => s.key === activeStep);

    return (
        <div className="flex items-center justify-between w-full max-w-2xl mx-auto">
            {steps.map((step, i) => {
                const isActive = step.key === activeStep;
                const isCompleted = i < activeIndex;
                const Icon = step.icon;

                return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-none">
                        <button
                            type="button"
                            onClick={() => onStepClick(step.key)}
                            className="flex flex-col items-center gap-2 group cursor-pointer"
                        >
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                isActive
                                    ? 'bg-[#0F4C75] border-[#0F4C75] text-white shadow-lg shadow-[#0F4C75]/20'
                                    : isCompleted
                                        ? 'bg-green-500 border-green-500 text-white'
                                        : 'bg-white border-gray-200 text-gray-400 group-hover:border-[#BBE1FA] group-hover:text-[#3282B8]'
                            }`}>
                                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap ${
                                isActive ? 'text-[#0F4C75]' : isCompleted ? 'text-green-600' : 'text-gray-400'
                            }`}>
                                {step.label}
                            </span>
                        </button>

                        {/* Connector line */}
                        {i < steps.length - 1 && (
                            <div className="flex-1 h-0.5 mx-3 mt-[-20px]">
                                <div className={`h-full rounded-full transition-all duration-500 ${
                                    i < activeIndex ? 'bg-green-400' : 'bg-gray-200'
                                }`} />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

interface TrainerCourseDashboardProps {
    initialCourse: Course;
    teachingBasePath?: string;
}

export function TrainerCourseDashboard({ initialCourse, teachingBasePath = '/enterprise/employee/teaching' }: TrainerCourseDashboardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [course, setCourse] = useState<Course>(initialCourse);
    const [activeTab, setActiveTab] = useState('basics');
    const [isSaving, setIsSaving] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            courseName: initialCourse.courseName,
            description: cleanDescription(initialCourse.description || ''),
            durationMinutes: initialCourse.durationMinutes || 60,
        },
    });

    const handleBack = () => router.back();

    const buildCourseUpdatePayload = (overrides: Partial<Course>) => {
        const normalizedTrainerEmail = (course.trainerEmail || '').trim().toLowerCase();
        if (!normalizedTrainerEmail) {
            throw new Error('Khóa học chưa có email giảng viên hợp lệ.');
        }
        if (!course.startTime) {
            throw new Error('Khóa học chưa có thời gian bắt đầu. Vui lòng nhờ HR thiết lập lịch trước.');
        }
        if (typeof course.isOnline !== 'boolean') {
            throw new Error('Khóa học chưa xác định hình thức online/offline.');
        }

        return {
            ...course,
            ...overrides,
            trainerEmail: normalizedTrainerEmail,
            startTime: course.startTime,
            isOnline: course.isOnline,
            location: course.location,
        };
    };

    const handleSaveBasics = async (values: CourseFormValues) => {
        setIsSaving(true);
        try {
            await courseService.updateCourse(course.id, buildCourseUpdatePayload(values));
            setCourse(prev => ({ ...prev, ...values }));
            toast({ title: 'Thành công', description: 'Đã lưu thông tin cơ bản.' });
            setActiveTab('curriculum');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lưu thông tin.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveDraft = async () => {
        const values = form.getValues();
        if (!values.courseName) {
            toast({ title: 'Thiếu tên khóa học', description: 'Vui lòng nhập tên khóa học trước khi lưu.', variant: 'destructive' });
            return;
        }
        setIsSaving(true);
        try {
            await courseService.updateCourse(course.id, buildCourseUpdatePayload(values));
            setCourse(prev => ({ ...prev, ...values }));
            toast({
                title: 'Đã lưu bản nháp',
                description: 'Thông tin cơ bản đã lưu lên hệ thống. Nội dung học trong tab Nội dung học được tự lưu nháp local.',
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể lưu bản nháp.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        setIsSaving(true);
        try {
            await courseService.publishCourse(buildPublishCourseCommand(course));
            setCourse(prev => ({ ...prev, status: 'Published' }));
            toast({ title: 'Chúc mừng!', description: 'Khóa học đã sẵn sàng cho học viên tham gia.' });
            router.push(teachingBasePath);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể mở khóa học.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    /* ── Pre-publish checklist items (dynamic) ── */
    const publishChecks = [
        {
            label: 'Thông tin cơ bản',
            desc: 'Tên, mô tả, thời lượng',
            ok: Boolean(course.courseName && course.description && course.durationMinutes),
        },
        {
            label: 'Lịch trình',
            desc: 'Ngày bắt đầu, hình thức, địa điểm',
            ok: Boolean(course.startTime && typeof course.isOnline === 'boolean'),
        },
        {
            label: 'Quiz cuối khóa',
            desc: 'Bộ câu hỏi đánh giá',
            ok: Boolean(course.hasFinalQuiz),
        },
    ];
    const allChecksOk = publishChecks.every(c => c.ok);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">

            {/* ── Header ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Top color strip */}
                <div className={`h-1.5 ${course.status === 'Published' ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-[#3282B8] to-[#0F4C75]'}`} />

                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={handleBack} className="w-10 h-10 rounded-full hover:bg-[#BBE1FA]/30 flex items-center justify-center transition-colors">
                            <ChevronLeft className="w-5 h-5 text-[#0F4C75]" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-[#BBE1FA]/30 text-[#0F4C75] border-0 font-bold text-xs px-2.5 py-0.5">
                                    {course.courseCode}
                                </Badge>
                                <span className="text-[11px] text-gray-400 font-medium">• Nhiệm vụ giảng dạy</span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black text-[#0F4C75] tracking-tight">{course.courseName}</h1>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Badge className={`border-0 font-semibold text-xs px-3 py-1 ${
                            course.status === 'Published'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-amber-50 text-amber-700'
                        }`}>
                            {course.status === 'Published' ? '✓ Hoàn thành' : '◉ Đang thiết lập'}
                        </Badge>
                        <Button variant="outline" className="rounded-xl border-gray-200 gap-2 font-semibold" onClick={handleSaveDraft} disabled={isSaving}>
                            <Save className="w-4 h-4" />
                            Lưu nháp
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Horizontal Stepper ── */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <HorizontalStepper steps={WIZARD_STEPS} activeStep={activeTab} onStepClick={setActiveTab} />
            </div>

            {/* ── Content Area ── */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[500px] p-8">
                    <TabsContent value="basics" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="max-w-3xl space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-xl font-black text-[#0F4C75]">Nhận nhiệm vụ & Khởi tạo khóa học</h2>
                                <p className="text-gray-500 text-sm">Hoàn thiện thông tin cơ bản trước khi tạo nội dung học.</p>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleSaveBasics)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="courseName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-gray-700">Tên khóa học</FormLabel>
                                                <FormControl>
                                                    <Input {...field} className="rounded-xl border-gray-200 h-12 text-base" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-gray-700">Mô tả chi tiết</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={6} className="rounded-xl border-gray-200 resize-none" placeholder="Nhập mục tiêu, nội dung chính của khóa học..." />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <FormField
                                            control={form.control}
                                            name="durationMinutes"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold text-gray-700">Thời lượng (phút)</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="number" 
                                                            {...field} 
                                                            onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                                                            className="rounded-xl border-gray-200 h-12" 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button 
                                        type="submit" 
                                        className="bg-[#0F4C75] hover:bg-[#1B262C] text-white px-8 py-6 rounded-xl font-bold gap-2"
                                        disabled={isSaving}
                                    >
                                        Lưu & Tiếp tục 
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </TabsContent>

                    <TabsContent value="curriculum" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-[#BBE1FA]/40 bg-[#BBE1FA]/10 p-5">
                                <h2 className="text-lg font-black text-[#0F4C75]">Thiết kế lộ trình học tập</h2>
                                <p className="text-sm text-gray-600 mt-1">Tạo lesson, đính kèm video và upload tài liệu để học viên có thể học theo từng học phần.</p>
                            </div>
                            <CurriculumManager courseId={course.id} />
                            <Separator className="bg-gray-100" />
                            <div className="flex items-center justify-between pt-2">
                                <Button variant="ghost" className="text-gray-600 font-medium gap-2" onClick={() => setActiveTab('basics')}>
                                    <ChevronLeft className="w-4 h-4" /> Quay lại
                                </Button>
                                <Button className="bg-[#0F4C75] hover:bg-[#1B262C] text-white px-6 rounded-xl font-bold gap-2" onClick={() => setActiveTab('exam')}>
                                    Tiếp tục <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="exam" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <ExamBuilder
                            courseId={course.id}
                            initialQuizId={course.finalQuizId}
                            onQuizLinked={(quizId) => setCourse((prev) => ({ ...prev, hasFinalQuiz: true, finalQuizId: quizId }))}
                        />
                        <Separator className="bg-gray-100 mt-6" />
                        <div className="flex items-center justify-between pt-4">
                            <Button variant="ghost" className="text-gray-600 font-medium gap-2" onClick={() => setActiveTab('curriculum')}>
                                <ChevronLeft className="w-4 h-4" /> Quay lại
                            </Button>
                            <Button className="bg-[#0F4C75] hover:bg-[#1B262C] text-white px-6 rounded-xl font-bold gap-2" onClick={() => setActiveTab('publish')}>
                                Tiếp tục <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="publish" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="max-w-2xl mx-auto space-y-8">
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black text-[#0F4C75]">Kiểm tra & Mở khóa học</h2>
                                <p className="text-gray-500 text-sm">Hệ thống tự động kiểm tra các mục bên dưới trước khi mở khóa.</p>
                            </div>

                            {/* Dynamic Pre-publish Checklist */}
                            <div className="space-y-3">
                                {publishChecks.map((check) => (
                                    <div key={check.label} className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                                        check.ok
                                            ? 'border-green-100 bg-green-50/50'
                                            : 'border-red-100 bg-red-50/50'
                                    }`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                            check.ok ? 'bg-green-500 text-white' : 'bg-red-100 text-red-500'
                                        }`}>
                                            {check.ok ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${check.ok ? 'text-green-800' : 'text-red-800'}`}>{check.label}</p>
                                            <p className={`text-xs ${check.ok ? 'text-green-600' : 'text-red-600'}`}>{check.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Separator className="bg-gray-100" />

                            {/* Publish CTA */}
                            <div className="relative rounded-3xl bg-gradient-to-br from-[#0F4C75] to-[#1B262C] p-8 text-white overflow-hidden">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-[#3282B8]/15 rounded-full -translate-y-1/2 translate-x-1/3" />
                                <div className="relative z-10 space-y-5">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black">{allChecksOk ? 'Sẵn sàng mở khóa học! 🎉' : 'Chưa đủ điều kiện'}</h3>
                                        <p className="text-[#BBE1FA]/70 text-sm">
                                            {allChecksOk
                                                ? 'Khóa học sẽ xuất hiện trong danh mục đào tạo và học viên có thể tham gia.'
                                                : 'Vui lòng hoàn tất các mục trên trước khi mở khóa.'}
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={() => setShowPublishConfirm(true)}
                                        className="w-full bg-white text-[#0F4C75] hover:bg-[#BBE1FA] px-12 py-7 rounded-2xl font-bold text-lg shadow-lg transition-all gap-3"
                                        disabled={isSaving || !allChecksOk}
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                MỞ KHÓA HỌC
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <AlertDialog open={showPublishConfirm} onOpenChange={setShowPublishConfirm}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Xác nhận mở khóa học?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Sau khi mở khóa, khóa học sẽ xuất hiện trong danh mục đào tạo và học viên có thể bắt đầu tham gia. Hành động này không thể hoàn tác.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handlePublish}
                                            className="bg-[#0F4C75] hover:bg-[#1B262C] text-white"
                                        >
                                            Xác nhận mở khóa
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <div className="flex items-center justify-start pt-2">
                                <Button variant="ghost" className="text-gray-600 font-medium gap-2" onClick={() => setActiveTab('exam')}>
                                    <ChevronLeft className="w-4 h-4" /> Quay lại
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
