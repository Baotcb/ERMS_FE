'use client';

import React, { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { Search, CheckCircle2, PlusCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { courseService } from '@/features/hr/api/course-service';
import { Course, CourseResult, UpdateCourseCommand } from '@/features/hr/types/course-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

import { getEmployees, Employee, PaginatedResult } from '@/features/hr/api/employee-service';

export function AssignTrainingPage({
    initialCourses,
    initialTrainers,
    initialTrainees
}: {
    initialCourses?: CourseResult;
    initialTrainers?: PaginatedResult<Employee>;
    initialTrainees?: PaginatedResult<Employee>;
}) {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedPlanId = searchParams.get('planId') || '';
    const preselectedCourseId = searchParams.get('courseId') || '';
    const [selectedCourseId, setSelectedCourseId] = useState<string>(preselectedCourseId);
    const [trainerSearch, setTrainerSearch] = useState('');
    const [traineeSearch, setTraineeSearch] = useState('');
    const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
    const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const debouncedTrainerSearch = useDebouncedValue(trainerSearch, 300);
    const debouncedTraineeSearch = useDebouncedValue(traineeSearch, 300);

    // Fetch Courses
    const { data: coursesData, isLoading: isLoadingCourses } = useSWR<CourseResult>(
        ['/api/Course', 'assignment'],
        () => courseService.getAllCourses({ status: 'Draft', pageSize: 100 }),
        { fallbackData: initialCourses }
    );

    // Fetch Potential Trainers (Employees with 'Trainer' role or similar - for now just all employees)
    const { data: trainersData, isLoading: isLoadingTrainers } = useSWR(
        ['/api/Employees', 'trainers', debouncedTrainerSearch],
        () => getEmployees({ search: debouncedTrainerSearch, pageSize: 5 }),
        { fallbackData: initialTrainers }
    );

    // Fetch Potential Trainees
    const { data: traineesData, isLoading: isLoadingTrainees } = useSWR(
        ['/api/Employees', 'trainees', debouncedTraineeSearch],
        () => getEmployees({ search: debouncedTraineeSearch, pageSize: 10 }),
        { fallbackData: initialTrainees }
    );

    // Fetch Current Course Assignment if selected
    const { data: currentCourse } = useSWR<Course>(
        selectedCourseId ? `/api/Course/${selectedCourseId}` : null,
        () => courseService.getCourseDetails(selectedCourseId)
    );

    useEffect(() => {
        if (currentCourse) {
            const trainerId = currentCourse.trainerId || '';
            setSelectedTrainerId(trainerId);
            // Remove trainer from trainee selection if already selected
            if (trainerId) {
                setSelectedTraineeIds(prev => prev.filter(id => id !== trainerId));
            }
        }
    }, [currentCourse]);

    const courses = useMemo(() => {
        const allCourses = coursesData?.items || [];

        if (!selectedPlanId) {
            return allCourses;
        }

        return allCourses.filter((course) => course.trainingPlanId === selectedPlanId);
    }, [coursesData?.items, selectedPlanId]);

    useEffect(() => {
        if (!preselectedCourseId) {
            return;
        }

        setSelectedCourseId(preselectedCourseId);
    }, [preselectedCourseId]);

    useEffect(() => {
        if (selectedCourseId && courses.some((course) => course.id === selectedCourseId)) {
            return;
        }

        if (selectedPlanId && courses.length > 0) {
            setSelectedCourseId(courses[0].id);
        }
    }, [courses, selectedCourseId, selectedPlanId]);

    const handleSaveAssignment = async () => {
        if (!selectedCourseId) {
            toast({ title: 'Lỗi', description: 'Vui lòng chọn khóa học', variant: 'destructive' });
            return;
        }

        if (!selectedTrainerId) {
            toast({ title: 'Lỗi', description: 'Vui lòng chọn người đào tạo', variant: 'destructive' });
            return;
        }

        if (!currentCourse) {
            toast({ title: 'Lỗi', description: 'Chưa tải được thông tin khóa học. Vui lòng thử lại.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Update Trainer
            await courseService.updateCourse(selectedCourseId, {
                ...currentCourse!,
                trainerId: selectedTrainerId
            } as UpdateCourseCommand);

            // 2. Assign Trainees
            if (selectedTraineeIds.length > 0) {
                await courseService.assignEmployees(selectedCourseId, selectedTraineeIds);
            }

            toast({ title: 'Thành công', description: 'Đã lưu phân công đào tạo' });
            
            // Navigate to step 2: Setup Schedule (Dept Head flow)
            router.push(`/enterprise/dept-head/training/schedule?courseId=${selectedCourseId}`);
        } catch (error: unknown) {
            void error;
            toast({ title: 'Lỗi', description: 'Không thể lưu phân công đào tạo. Vui lòng thử lại.', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const potentialTrainers = useMemo(() => {
        const employees = trainersData?.items || [];
        return employees;
    }, [trainersData?.items]);
    const potentialTrainees = traineesData?.items || [];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#0F4C75] mb-1">Phân công Đào tạo</h1>
                    <p className="text-gray-500">Thiết lập danh sách người đào tạo và học viên cho khóa học.</p>
                </div>
                <Button 
                    onClick={handleSaveAssignment} 
                    disabled={isSubmitting || !selectedCourseId}
                    className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white px-8 rounded-full"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Lưu phân công
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
                {selectedPlanId && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-[#0F4C75]">
                        {courses.length > 0
                            ? 'Danh sách khóa học đang được giới hạn theo kế hoạch đào tạo bạn vừa chọn.'
                            : 'Chưa tìm thấy khóa học nháp nào gắn với kế hoạch này. Nếu kế hoạch đã duyệt nhưng chưa có course, cần backend hoặc luồng tạo course riêng để sinh dữ liệu.'}
                        {courses.length === 0 && (
                            <div className="mt-3">
                                <Button
                                    size="sm"
                                    className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white"
                                    onClick={() => router.push('/enterprise/dept-head/training/plans')}
                                >
                                    Quay lại tạo khóa học
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-semibold">1</div>
                        <h2 className="text-[13px] font-bold text-gray-700 tracking-wider">BƯỚC 1: CHỌN KHÓA HỌC</h2>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Chọn khóa học đào tạo cần phân công</p>
                        <Select 
                            value={selectedCourseId} 
                            onValueChange={(val) => {
                                setSelectedCourseId(val);
                                setSelectedTraineeIds([]); // Clear trainees when course changes
                            }}
                        >
                            <SelectTrigger className="w-full md:w-[600px] border-gray-300">
                                <SelectValue placeholder={isLoadingCourses ? "Đang tải danh sách..." : "Chọn khóa học"} />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map(course => (
                                    <SelectItem key={course.id} value={course.id}>
                                        {course.courseName} (Mã: {course.courseCode})
                                    </SelectItem>
                                ))}
                                {courses.length === 0 && !isLoadingCourses && (
                                    <SelectItem value="none" disabled>Không có khóa học chờ phân công</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Step 2 wrapper */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-gray-100">
                    
                    {/* Step 2.1 */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-semibold">2.1</div>
                            <h2 className="text-[13px] font-bold text-gray-700 tracking-wider uppercase">Phân công người đào tạo</h2>
                        </div>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input 
                                placeholder="Tìm giảng viên..." 
                                value={trainerSearch}
                                onChange={(e) => setTrainerSearch(e.target.value)}
                                className="pl-9 border-gray-200 bg-gray-50/50" 
                            />
                        </div>

                        <p className="text-xs text-gray-500">
                            Bạn có thể chọn bất kỳ nhân viên nào làm người đào tạo; hệ thống sẽ tự nâng thành giảng viên khi lưu phân công.
                        </p>

                        <div className="space-y-3 mt-4 min-h-[300px]">
                            {isLoadingTrainers ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                            ) : potentialTrainers.map((trainer: Employee) => (
                                <div 
                                    key={trainer.id} 
                                    className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                                        selectedTrainerId === trainer.id 
                                            ? 'border-[#0F4C75] bg-blue-50/30' 
                                            : 'border-gray-200 hover:border-blue-200 bg-white'
                                    }`}
                                    onClick={() => {
                                        setSelectedTrainerId(trainer.id);
                                        // Automatically remove this person from trainee list
                                        setSelectedTraineeIds(prev => prev.filter(id => id !== trainer.id));
                                    }}
                                >
                                    {selectedTrainerId === trainer.id && (
                                        <Badge variant="secondary" className="absolute -top-3 right-4 bg-[#0F4C75] text-white hover:bg-[#155A8A] text-[10px] px-2 py-0">ĐÃ CHỌN</Badge>
                                    )}
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                            <AvatarFallback className="bg-[#0F4C75] text-white text-xs font-bold">
                                                {trainer.fullName?.split(' ').pop()?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-bold text-[#0F4C75] truncate">{trainer.fullName}</h3>
                                                {selectedTrainerId === trainer.id ? (
                                                    <div className="w-5 h-5 bg-[#0F4C75] rounded-full flex items-center justify-center">
                                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                                    </div>
                                                ) : (
                                                    <PlusCircle className="w-5 h-5 text-gray-300 hover:text-[#3282B8] transition-colors shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-500 mb-2 truncate font-medium">{trainer.position || 'Nhân viên'}</p>
                                            <p className="text-[10px] text-[#0F4C75] mb-2">
                                                {trainer.isTrainer ? 'Giảng viên hiện có' : 'Nhân viên sẽ được nâng thành giảng viên'}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {trainer.departmentName && (
                                                    <Badge key={trainer.departmentName} variant="secondary" className="text-[9px] text-[#0F4C75] font-bold bg-blue-50 border-0 px-2 py-0">
                                                        {trainer.departmentName}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {potentialTrainers.length === 0 && !isLoadingTrainers && (
                                <p className="text-center text-gray-400 py-10 text-sm italic">Không tìm thấy giảng viên</p>
                            )}
                        </div>
                    </div>

                    {/* Step 2.2 */}
                    <div className="lg:col-span-8 bg-gray-50/30 rounded-xl border border-gray-100 p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-semibold">2.2</div>
                                <h2 className="text-[13px] font-bold text-gray-700 tracking-wider uppercase">Phân công học viên</h2>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input 
                                        placeholder="Tìm theo tên..." 
                                        value={traineeSearch}
                                        onChange={(e) => setTraineeSearch(e.target.value)}
                                        className="pl-9 w-[220px] bg-white border-gray-200" 
                                    />
                                </div>
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[160px] bg-white border-gray-200">
                                        <SelectValue placeholder="Tất cả phòng ban" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả phòng ban</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                        <TableHead className="w-[50px]">
                                            <Checkbox 
                                                checked={potentialTrainees.filter((p: Employee) => p.id !== selectedTrainerId).length > 0 && selectedTraineeIds.length === potentialTrainees.filter((p: Employee) => p.id !== selectedTrainerId).length}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setSelectedTraineeIds(potentialTrainees.filter((p: Employee) => p.id !== selectedTrainerId).map((p: Employee) => p.id));
                                                    else setSelectedTraineeIds([]);
                                                }}
                                            />
                                        </TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-500">HỌ VÀ TÊN</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-500">PHÒNG BAN</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-500">VỊ TRÍ</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-500 text-center">TRẠNG THÁI</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingTrainees ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" /></TableCell></TableRow>
                                    ) : potentialTrainees.map((trainee: Employee) => {
                                        const isTrainer = trainee.id === selectedTrainerId;
                                        return (
                                            <TableRow key={trainee.id} className={isTrainer ? 'opacity-50 bg-gray-50/80' : ''}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedTraineeIds.includes(trainee.id)}
                                                        disabled={isTrainer}
                                                        onCheckedChange={(checked) => {
                                                            if (isTrainer) return;
                                                            if (checked) setSelectedTraineeIds([...selectedTraineeIds, trainee.id]);
                                                            else setSelectedTraineeIds(selectedTraineeIds.filter(id => id !== trainee.id));
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="w-8 h-8 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                                            <AvatarFallback className="bg-[#0F4C75] text-white text-[10px] font-bold">
                                                                {trainee.fullName?.split(' ').pop()?.[0]}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <span className="font-medium text-gray-900">{trainee.fullName}</span>
                                                            {isTrainer && (
                                                                <span className="ml-2 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">Trainer</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">{trainee.departmentName}</TableCell>
                                                <TableCell className="text-sm text-gray-500">{trainee.position}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="font-normal text-gray-500">{trainee.status}</Badge>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {potentialTrainees.length === 0 && !isLoadingTrainees && (
                                        <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-400 italic">Không tìm thấy nhân viên</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">Đã chọn {selectedTraineeIds.length} nhân viên</span>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="w-8 h-8 text-gray-400 border-gray-200">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="default" size="icon" className="w-8 h-8 bg-[#0F4C75] text-white hover:bg-[#155A8A]">
                                    1
                                </Button>
                                <Button variant="outline" size="icon" className="w-8 h-8 text-gray-400 border-gray-200">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.back()} className="px-6 rounded-full border-gray-300">
                        Hủy bỏ
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" className="px-6 rounded-full border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700">
                            Lưu nháp
                        </Button>
                        <Button 
                            onClick={handleSaveAssignment} 
                            disabled={isSubmitting || !selectedCourseId}
                            className="px-6 rounded-full bg-[#0F4C75] hover:bg-[#1A5F8C] text-white"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Tiếp tục: Thiết lập lịch trình →'}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
