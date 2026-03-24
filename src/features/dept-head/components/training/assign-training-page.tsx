'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { courseService } from '@/features/hr/api/course-service';
import { Course, CourseResult } from '@/features/hr/types/course-types';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

import { getEmployees, Employee, PaginatedResult } from '@/features/hr/api/employee-service';
import { getDepartments, type Department } from '@/features/hr/api/department-service';
import { normalizeEmail } from '@/features/hr/utils/course-workflow';

const TRAINEES_PAGE_SIZE = 10;

function parseNotifyConfig(description: string | undefined): boolean {
    const match = (description || '').match(/Thông báo:\s*giangvien_khi_phancong=(on|off)/i);
    return match ? match[1].toLowerCase() === 'on' : true;
}

export function AssignTrainingPage({
    initialCourses,
    initialTrainees
}: {
    initialCourses?: CourseResult;
    initialTrainees?: PaginatedResult<Employee>;
}) {
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedPlanId = searchParams.get('planId') || '';
    const preselectedCourseId = searchParams.get('courseId') || '';
    const [selectedCourseId, setSelectedCourseId] = useState<string>(preselectedCourseId);
    const [traineeSearch, setTraineeSearch] = useState('');
    const [selectedTraineeIds, setSelectedTraineeIds] = useState<string[]>([]);
    const [notifyTrainer, setNotifyTrainer] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('all');

    const debouncedTraineeSearch = useDebouncedValue(traineeSearch, 300);

    // Fetch Courses
    const { data: coursesData, isLoading: isLoadingCourses } = useSWR<CourseResult>(
        ['/api/Course', 'assignment'],
        () => courseService.getAllCourses({ pageSize: 100 }),
        { fallbackData: initialCourses }
    );

    // Fetch Departments for filter
    const { data: departmentsData } = useSWR(
        '/api/Departments/list',
        () => getDepartments({ pageSize: 100 }),
    );
    const departments: Department[] = departmentsData?.items || [];

    // Fetch Potential Trainees with real pagination & department filter
    const { data: traineesData, isLoading: isLoadingTrainees } = useSWR(
        ['/api/Employees', 'trainees', debouncedTraineeSearch, currentPage, selectedDepartmentId],
        () => getEmployees({
            search: debouncedTraineeSearch,
            page: currentPage,
            pageSize: TRAINEES_PAGE_SIZE,
            departmentId: selectedDepartmentId !== 'all' ? Number(selectedDepartmentId) : undefined,
        }),
        { fallbackData: initialTrainees, keepPreviousData: true }
    );
    const totalPages = traineesData?.totalPages || 1;
    const totalCount = traineesData?.totalCount || 0;

    // Fetch Current Course Assignment if selected
    const { data: currentCourse } = useSWR<Course>(
        selectedCourseId ? `/api/Course/${selectedCourseId}` : null,
        () => courseService.getCourseDetails(selectedCourseId)
    );

    const normalizedTrainerEmail = useMemo(
        () => normalizeEmail(currentCourse?.trainerEmail),
        [currentCourse?.trainerEmail]
    );

    const { data: invitedTrainer, isLoading: isLoadingTrainerProfile } = useSWR<Employee | null>(
        normalizedTrainerEmail ? ['/api/Employees', 'trainer-by-email', normalizedTrainerEmail] : null,
        async () => {
            const result = await getEmployees({ search: normalizedTrainerEmail, pageSize: 20 });
            return result.items.find(
                (employee) => normalizeEmail(employee.email) === normalizedTrainerEmail
            ) || null;
        }
    );

    useEffect(() => {
        if (!invitedTrainer?.id) {
            return;
        }

        setSelectedTraineeIds((prev) => prev.filter((id) => id !== invitedTrainer.id));
    }, [invitedTrainer?.id]);

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
        setNotifyTrainer(parseNotifyConfig(currentCourse?.description));
    }, [currentCourse?.description]);

    // Reset page when search or department filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedTraineeSearch, selectedDepartmentId]);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }, [totalPages]);

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

        if (!currentCourse) {
            toast({ title: 'Lỗi', description: 'Chưa tải được thông tin khóa học. Vui lòng thử lại.', variant: 'destructive' });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedTrainerEmail)) {
            toast({ title: 'Lỗi', description: 'Khóa học chưa có email người đào tạo hợp lệ. HR cần mời trainer trước.', variant: 'destructive' });
            return;
        }

        if (!currentCourse.startTime) {
            toast({ title: 'Lỗi', description: 'Khóa học chưa có thời gian bắt đầu. Vui lòng để HR thiết lập lịch trước.', variant: 'destructive' });
            return;
        }

        if (typeof currentCourse.isOnline !== 'boolean') {
            toast({ title: 'Lỗi', description: 'Khóa học chưa xác định hình thức online/offline.', variant: 'destructive' });
            return;
        }

        if (currentCourse.isOnline && !currentCourse.location) {
            toast({ title: 'Lỗi', description: 'Khóa học online chưa có link họp.', variant: 'destructive' });
            return;
        }

        if (selectedTraineeIds.length === 0) {
            toast({ title: 'Lỗi', description: 'Vui lòng chọn ít nhất một học viên.', variant: 'destructive' });
            return;
        }

        setIsSubmitting(true);
        try {
            await courseService.assignEmployees(
                selectedCourseId,
                selectedTraineeIds,
                {
                    meetUrl: currentCourse.isOnline ? (currentCourse.location || '') : '',
                    notifyTrainer,
                }
            );

            toast({ title: 'Thành công', description: 'Đã lưu phân công đào tạo' });
            router.push('/enterprise/dept-head/training');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể lưu phân công đào tạo. Vui lòng thử lại.';
            toast({ title: 'Lỗi', description: errorMessage, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const potentialTrainees = useMemo(() => {
        const trainerId = invitedTrainer?.id;
        if (!trainerId) {
            return traineesData?.items || [];
        }

        return (traineesData?.items || []).filter((employee) => employee.id !== trainerId);
    }, [invitedTrainer?.id, traineesData?.items]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-blue-50">
                        <ChevronLeft className="w-5 h-5 text-[#0F4C75]" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#0F4C75] mb-1">Phân công Đào tạo</h1>
                        <p className="text-gray-500">Xác nhận trainer đã được HR mời và chọn học viên cho khóa học.</p>
                    </div>
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
                            : 'Chưa tìm thấy khóa học nào gắn với kế hoạch này.'}
                        {courses.length === 0 && (
                            <div className="mt-3">
                                <Button
                                    size="sm"
                                    className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white"
                                    onClick={() => router.push('/enterprise/dept-head/training/plans')}
                                >
                                    Quay lại xem kế hoạch
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
                                    <SelectItem value="none" disabled>Không có khóa học sẵn sàng để phân công</SelectItem>
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
                            <h2 className="text-[13px] font-bold text-gray-700 tracking-wider uppercase">Người đào tạo đã được mời</h2>
                        </div>
                        <p className="text-xs text-gray-500">
                            Trainer được HR mời ngay từ bước tạo khóa học. Ở bước này bạn chỉ chọn học viên tham gia, không được đổi người đào tạo.
                        </p>

                        <div className="space-y-3 mt-4 min-h-[300px]">
                            {!selectedCourseId ? (
                                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-10 text-center text-sm text-gray-400">
                                    Chọn khóa học để xem trainer đã được mời.
                                </div>
                            ) : isLoadingTrainerProfile ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                            ) : (
                                <div className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 space-y-3">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                            <AvatarFallback className="bg-[#0F4C75] text-white text-xs font-bold">
                                                {(invitedTrainer?.fullName || normalizedTrainerEmail || '?').trim().charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-[#0F4C75] truncate">{invitedTrainer?.fullName || currentCourse?.trainerName || 'Trainer đã được mời'}</h3>
                                                <Badge variant="secondary" className="bg-[#0F4C75] text-white hover:bg-[#0F4C75] text-[10px] px-2 py-0">
                                                    GIẢNG VIÊN
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 break-all">{normalizedTrainerEmail || 'Chưa có email trainer'}</p>
                                            <p className="text-xs text-gray-500">{invitedTrainer?.position || 'Thông tin vị trí sẽ hiển thị khi tìm thấy hồ sơ nhân viên tương ứng.'}</p>
                                            {invitedTrainer?.departmentName && (
                                                <Badge variant="secondary" className="text-[10px] text-[#0F4C75] font-bold bg-white border border-blue-100 px-2 py-0">
                                                    {invitedTrainer.departmentName}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {!normalizedTrainerEmail && (
                                        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                            Khóa học này chưa có trainerEmail hợp lệ. HR cần cập nhật trước khi bạn phân công học viên.
                                        </div>
                                    )}
                                </div>
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
                                <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                                    <SelectTrigger className="w-[200px] bg-white border-gray-200">
                                        <SelectValue placeholder="Tất cả phòng ban" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả phòng ban</SelectItem>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={String(dept.id)}>
                                                {dept.departmentName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-blue-50/40 px-4 py-3 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-[#0F4C75]">Thông báo trainer cùng lúc gửi học viên</p>
                                <p className="text-xs text-gray-600 mt-1">Khi bật, hệ thống gửi email trainer đồng thời với email phân công học viên.</p>
                            </div>
                            <Switch
                                checked={notifyTrainer}
                                onCheckedChange={setNotifyTrainer}
                                className="data-[state=checked]:bg-[#0F4C75]"
                            />
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                        <TableHead className="w-[50px]">
                                            <Checkbox 
                                                checked={potentialTrainees.length > 0 && selectedTraineeIds.length === potentialTrainees.length}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setSelectedTraineeIds(potentialTrainees.map((p: Employee) => p.id));
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
                                        return (
                                            <TableRow key={trainee.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedTraineeIds.includes(trainee.id)}
                                                        onCheckedChange={(checked) => {
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
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-gray-500">{trainee.departmentName}</TableCell>
                                                <TableCell className="text-sm text-gray-500">{trainee.position}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline" className="font-normal text-gray-500">{{ Active: 'Đang làm việc', Inactive: 'Ngừng hoạt động', OnLeave: 'Đang nghỉ phép' }[trainee.status] || trainee.status}</Badge>
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
                            <span className="text-gray-500 font-medium">
                                Đã chọn {selectedTraineeIds.length} nhân viên · Hiển thị {potentialTrainees.length}/{totalCount}
                            </span>
                            {totalPages > 1 && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-8 h-8 text-gray-400 border-gray-200"
                                        disabled={currentPage <= 1}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                        let pageNum: number;
                                        if (totalPages <= 5) {
                                            pageNum = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNum = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i;
                                        } else {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={currentPage === pageNum ? 'default' : 'outline'}
                                                size="icon"
                                                className={`w-8 h-8 ${
                                                    currentPage === pageNum
                                                        ? 'bg-[#0F4C75] text-white hover:bg-[#155A8A]'
                                                        : 'text-gray-400 border-gray-200'
                                                }`}
                                                onClick={() => handlePageChange(pageNum)}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="w-8 h-8 text-gray-400 border-gray-200"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.back()} className="px-6 rounded-full border-gray-300">
                        Hủy bỏ
                    </Button>
                    <Button 
                        onClick={handleSaveAssignment} 
                        disabled={isSubmitting || !selectedCourseId}
                        className="px-6 rounded-full bg-[#0F4C75] hover:bg-[#1A5F8C] text-white"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Hoàn tất phân công'}
                    </Button>
                </div>

            </div>
        </div>
    );
}
