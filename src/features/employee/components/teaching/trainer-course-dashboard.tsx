'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    ChevronLeft, Save,
    FileText, Send, CheckCircle2, 
    Layout, ArrowRight, Loader2, Award, Copy
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
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

interface TrainerCourseDashboardProps {
    initialCourse: Course;
    teachingBasePath?: string;
}

function getQuizStorageKey(courseId: string): string {
    return `course-quiz:${courseId}`;
}

export function TrainerCourseDashboard({ initialCourse, teachingBasePath = '/enterprise/employee/teaching' }: TrainerCourseDashboardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [course, setCourse] = useState<Course>(initialCourse);
    const [activeTab, setActiveTab] = useState('basics');
    const [isSaving, setIsSaving] = useState(false);
    const [savedQuizId, setSavedQuizId] = useState('');

    useEffect(() => {
        if (activeTab !== 'publish') {
            return;
        }

        const storedQuizId = localStorage.getItem(getQuizStorageKey(course.id)) || sessionStorage.getItem(getQuizStorageKey(course.id)) || '';
        setSavedQuizId(storedQuizId);
    }, [activeTab, course.id]);

    const handleCopyQuizId = async () => {
        if (!savedQuizId) {
            toast({ title: 'Chưa có Quiz ID', description: 'Vui lòng tạo quiz ở tab Bài thi cuối khóa trước.', variant: 'destructive' });
            return;
        }

        try {
            await navigator.clipboard.writeText(savedQuizId);
            toast({ title: 'Đã copy Quiz ID', description: 'Bạn có thể gửi mã này cho HR/học viên.' });
        } catch {
            toast({ title: 'Không thể copy', description: 'Trình duyệt chặn thao tác copy. Vui lòng copy thủ công.', variant: 'destructive' });
        }
    };

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            courseName: initialCourse.courseName,
            description: initialCourse.description || '',
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
            setActiveTab('exam');
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
            toast({ title: 'Chúc mừng!', description: 'Khóa học đã được xuất bản theo luồng nhiệm vụ giảng viên.' });
            router.push(teachingBasePath);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Không thể xuất bản khóa học.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full hover:bg-blue-50">
                        <ChevronLeft className="w-5 h-5 text-[#0F4C75]" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="bg-blue-50 text-[#0F4C75] border-0 font-bold px-2 py-0">
                                {course.courseCode}
                            </Badge>
                            <span className="text-xs text-gray-400 font-medium">| Nhiệm vụ giảng dạy</span>
                        </div>
                        <h1 className="text-2xl font-bold text-[#0F4C75] tracking-tight">{course.courseName}</h1>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <Badge className={course.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                        {course.status === 'Published' ? 'Đã xuất bản' : 'Đang thiết lập'}
                    </Badge>
                    <Button variant="outline" className="rounded-xl border-gray-200" onClick={handleSaveDraft} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        Lưu bản nháp
                    </Button>
                </div>
            </div>

            {/* Workflow Steps */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-full md:w-auto h-auto grid grid-cols-1 md:grid-cols-4 gap-1">
                    <TabsTrigger value="basics" className="rounded-xl py-3 px-6 data-[state=active]:bg-[#0F4C75] data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-wider gap-2">
                        <Layout className="w-4 h-4" /> 1. Nhận nhiệm vụ
                    </TabsTrigger>
                    <TabsTrigger value="curriculum" className="rounded-xl py-3 px-6 data-[state=active]:bg-[#0F4C75] data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-wider gap-2">
                        <FileText className="w-4 h-4" /> 2. Nội dung học
                    </TabsTrigger>
                    <TabsTrigger value="exam" className="rounded-xl py-3 px-6 data-[state=active]:bg-[#0F4C75] data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-wider gap-2">
                        <Award className="w-4 h-4" /> 3. Quiz cuối khóa
                    </TabsTrigger>
                    <TabsTrigger value="publish" className="rounded-xl py-3 px-6 data-[state=active]:bg-[#0F4C75] data-[state=active]:text-white transition-all font-bold text-xs uppercase tracking-wider gap-2">
                        <Send className="w-4 h-4" /> 4. Xuất bản
                    </TabsTrigger>
                </TabsList>

                {/* Content Area */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[500px] p-8">
                    <TabsContent value="basics" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="max-w-3xl space-y-8">
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-[#0F4C75]">Nhận nhiệm vụ & Khởi tạo khóa học</h2>
                                <p className="text-gray-500 text-sm">Giảng viên tiếp nhận khóa học được giao và hoàn thiện thông tin khởi tạo trước khi tạo quiz cuối khóa.</p>
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
                                                    <Input {...field} className="rounded-xl border-gray-200 h-11" />
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
                                                            onChange={e => field.onChange(parseInt(e.target.value))} 
                                                            className="rounded-xl border-gray-200 h-11" 
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
                            <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                                <h2 className="text-lg font-bold text-[#0F4C75]">Thiết kế lộ trình học tập</h2>
                                <p className="text-sm text-gray-600 mt-1">Tạo lesson, đính kèm video và upload tài liệu để học viên có thể học theo từng học phần.</p>
                            </div>
                            <CurriculumManager courseId={course.id} />
                        </div>
                    </TabsContent>

                    <TabsContent value="exam" className="m-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <ExamBuilder courseId={course.id} />
                    </TabsContent>

                    <TabsContent value="publish" className="m-0 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="max-w-2xl space-y-8">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-bold text-[#0F4C75]">Xuất bản khóa học</h2>
                                <p className="text-gray-500 font-medium">Kiểm tra lại toàn bộ nội dung trước khi chính thức mở khóa học cho học viên.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-4 p-5 rounded-3xl border border-green-50 bg-green-50/20">
                                    <div className="w-10 h-10 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-800">Thông tin cơ bản</p>
                                        <p className="text-xs text-green-600 font-medium">Đã điền đầy đủ tiêu đề, mô tả và cấp độ.</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-5 rounded-3xl border border-blue-50 bg-blue-50/20">
                                    <div className="w-10 h-10 bg-[#3282B8] text-white rounded-2xl flex items-center justify-center shadow-sm">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[#0F4C75]">Quiz cuối khóa</p>
                                        <p className="text-xs text-[#3282B8] font-medium">Tạo bộ câu hỏi để đánh giá pass/failed sau khóa học.</p>
                                        {savedQuizId ? (
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <span className="text-[11px] font-semibold text-[#0F4C75]">Quiz ID:</span>
                                                <span className="rounded-md bg-white px-2 py-1 font-mono text-[11px] text-[#0F4C75] border border-blue-100">{savedQuizId}</span>
                                                <Button type="button" variant="outline" size="sm" className="h-7 border-blue-200 text-[#0F4C75] hover:bg-white" onClick={handleCopyQuizId}>
                                                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-amber-700 mt-2">Chưa có Quiz ID. Hãy tạo quiz ở tab Bài thi cuối khóa trước khi xuất bản.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-5 rounded-3xl border border-gray-50 bg-gray-50/50">
                                    <div className="w-10 h-10 bg-gray-200 text-gray-500 rounded-2xl flex items-center justify-center">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-400">Bài thi đánh giá</p>
                                        <p className="text-xs text-gray-400 font-medium">Tùy chọn: Thêm bài tập hoặc bài kiểm tra cuối khóa.</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-gray-100" />

                            <div className="bg-[#1B262C] text-white p-8 rounded-[40px] relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3282B8]/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative z-10 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold">Sẵn sàng ra mắt?</h3>
                                        <p className="text-gray-400 text-sm">Sau khi xuất bản, khóa học sẽ xuất hiện trong danh mục đào tạo và học viên có thể bắt đầu đăng ký tham gia.</p>
                                    </div>
                                    <Button 
                                        onClick={handlePublish}
                                        className="w-full bg-[#3282B8] hover:bg-[#BBE1FA] hover:text-[#0F4C75] text-white px-12 py-8 rounded-2xl font-bold text-xl shadow-lg transition-all gap-3"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                            <>
                                                <Send className="w-6 h-6" />
                                                XUẤT BẢN NGAY
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
