'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { Building2, Camera, CheckCircle2, Clock, Users, Search, Eye, XCircle } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { courseService } from '@/features/hr/api/course-service';
import { workshopService, type WorkshopConfirmation } from '@/features/hr/api/workshop-service';
import { WorkshopConfirmationDialog } from './workshop-confirmation-dialog';
import type { Course } from '@/features/hr/types/course-types';

export function WorkshopManagementList() {
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; courseId: string; courseName: string }>({
        open: false, courseId: '', courseName: '',
    });
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
    const [evidenceDialog, setEvidenceDialog] = useState<{ open: boolean; confirmation: WorkshopConfirmation | null; courseName: string }>({
        open: false, confirmation: null, courseName: '',
    });

    // Fetch published courses — filter offline ones on client
    const { data: coursesData, mutate } = useSWR(
        'hr-workshop-courses',
        () => courseService.getAllCourses({ status: 'Published', pageSize: 100 })
    );

    const offlineCourses = (coursesData?.items || []).filter(c => c.isOnline === false);

    // Fetch confirmation status for each offline course
    const { data: confirmations, mutate: mutateConfirmations } = useSWR(
        offlineCourses.length > 0 ? ['workshop-confirmations', offlineCourses.map(c => c.id).join(',')] : null,
        async () => {
            const results: Record<string, WorkshopConfirmation | null> = {};
            await Promise.all(
                offlineCourses.map(async (course) => {
                    results[course.id] = await workshopService.getWorkshopConfirmation(course.id);
                })
            );
            return results;
        }
    );

    const handleConfirmed = () => {
        void mutate();
        void mutateConfirmations();
    };

    // Filter + Search
    const filteredCourses = useMemo(() => {
        const q = search.trim().toLowerCase();
        return offlineCourses.filter((course) => {
            const isConfirmed = !!confirmations?.[course.id];
            const matchesSearch = !q || course.courseName.toLowerCase().includes(q) || course.courseCode?.toLowerCase().includes(q);
            const matchesStatus = statusFilter === 'all'
                || (statusFilter === 'confirmed' && isConfirmed)
                || (statusFilter === 'pending' && !isConfirmed);
            return matchesSearch && matchesStatus;
        });
    }, [offlineCourses, confirmations, search, statusFilter]);

    // Stats
    const stats = useMemo(() => {
        const total = offlineCourses.length;
        const confirmed = offlineCourses.filter(c => !!confirmations?.[c.id]).length;
        return { total, confirmed, pending: total - confirmed };
    }, [offlineCourses, confirmations]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-5">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Quản lý Workshop</h1>
                    <p className="text-sm text-gray-500 mt-1">Xác nhận hoàn thành workshop (khóa đào tạo offline) để mở khóa bài kiểm tra cho trainee.</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-[#0F4C75] mb-2">
                        <Building2 className="w-5 h-5" /> Tổng workshop
                    </div>
                    <p className="text-3xl font-bold text-[#0F4C75]">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-green-700 mb-2">
                        <CheckCircle2 className="w-5 h-5" /> Đã xác nhận
                    </div>
                    <p className="text-3xl font-bold text-green-700">{stats.confirmed}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
                    <div className="flex items-center gap-3 text-amber-700 mb-2">
                        <Clock className="w-5 h-5" /> Chưa xác nhận
                    </div>
                    <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row items-center gap-3 bg-white px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm workshop..."
                        className="pl-10 border-gray-200 focus:border-[#3282B8]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'confirmed' | 'pending')}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                        <SelectItem value="pending">Chưa xác nhận</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="font-bold text-[#0F4C75]">Khóa học</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Địa điểm</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Ngày</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Học viên</TableHead>
                            <TableHead className="font-bold text-[#0F4C75]">Trạng thái</TableHead>
                            <TableHead className="text-right font-bold text-[#0F4C75]">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCourses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-14 h-14 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center">
                                            <Building2 className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[#0F4C75]">
                                                {offlineCourses.length === 0 ? 'Chưa có khóa workshop nào' : 'Không tìm thấy kết quả'}
                                            </p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                {offlineCourses.length === 0 ? 'Các khóa đào tạo offline đã xuất bản sẽ xuất hiện tại đây.' : 'Thử thay đổi từ khóa hoặc bộ lọc.'}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCourses.map((course) => {
                                const confirmation = confirmations?.[course.id];
                                const isConfirmed = !!confirmation;

                                return (
                                    <TableRow key={course.id} className="hover:bg-gray-50/50 transition-colors">
                                        <TableCell className="font-medium text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                                                <div>
                                                    <div>{course.courseName}</div>
                                                    <div className="text-xs text-gray-500">{course.courseCode}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-700 text-sm">
                                            {course.location || 'Chưa rõ'}
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {course.startTime
                                                ? format(new Date(course.startTime), 'dd/MM/yyyy')
                                                : 'Chưa có lịch'}
                                        </TableCell>
                                        <TableCell className="text-gray-700">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5 text-gray-400" />
                                                {course.enrollmentCount || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {isConfirmed ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Đã xác nhận
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                                    <Clock className="w-3 h-3 mr-1" /> Chưa xác nhận
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isConfirmed && confirmation ? (
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 px-2 text-[#0F4C75] hover:bg-blue-50"
                                                        onClick={() => setEvidenceDialog({ open: true, confirmation, courseName: course.courseName })}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" /> Xem
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setConfirmDialog({ open: true, courseId: course.id, courseName: course.courseName })}
                                                        className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                                                    >
                                                        <Camera className="w-3.5 h-3.5" /> Xác nhận
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Evidence Detail Dialog */}
            <Dialog open={evidenceDialog.open} onOpenChange={(open) => setEvidenceDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[#0F4C75]">Chi tiết xác nhận Workshop</DialogTitle>
                        <DialogDescription>{evidenceDialog.courseName}</DialogDescription>
                    </DialogHeader>
                    {evidenceDialog.confirmation && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">Thời gian xác nhận:</span>
                                    <p className="text-gray-600">{format(new Date(evidenceDialog.confirmation.confirmedAt), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-700">Số ảnh minh chứng:</span>
                                    <p className="text-gray-600">{evidenceDialog.confirmation.evidencePhotoUrls.length} ảnh</p>
                                </div>
                            </div>
                            {evidenceDialog.confirmation.notes && (
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Ghi chú:</span>
                                    <p className="text-sm text-gray-600 mt-1 italic">{evidenceDialog.confirmation.notes}</p>
                                </div>
                            )}
                            {evidenceDialog.confirmation.evidencePhotoUrls.length > 0 && (
                                <div>
                                    <span className="text-sm font-semibold text-gray-700 mb-2 block">Ảnh minh chứng:</span>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {evidenceDialog.confirmation.evidencePhotoUrls.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="rounded-xl overflow-hidden border border-gray-200 aspect-video block hover:shadow-md transition-shadow">
                                                <img src={url} alt={`Minh chứng ${i + 1}`} className="w-full h-full object-cover" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirm Workshop Dialog */}
            <WorkshopConfirmationDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
                courseId={confirmDialog.courseId}
                courseName={confirmDialog.courseName}
                onConfirmed={handleConfirmed}
            />
        </div>
    );
}
