'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Building2, Camera, CheckCircle2, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { courseService } from '@/features/hr/api/course-service';
import { workshopService, type WorkshopConfirmation } from '@/features/hr/api/workshop-service';
import { WorkshopConfirmationDialog } from './workshop-confirmation-dialog';

export function WorkshopManagementList() {
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; courseId: string; courseName: string }>({
        open: false, courseId: '', courseName: '',
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

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75] mb-1">Quản lý Workshop</h1>
                <p className="text-gray-500">Xác nhận hoàn thành workshop (khóa đào tạo offline) để mở khóa bài kiểm tra cho trainee.</p>
            </div>

            {offlineCourses.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto">
                        <Building2 className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="font-bold text-[#0F4C75]">Chưa có khóa workshop nào</p>
                        <p className="text-sm text-gray-400 mt-1">Các khóa đào tạo offline đã xuất bản sẽ xuất hiện tại đây.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {offlineCourses.map((course) => {
                        const confirmation = confirmations?.[course.id];
                        const isConfirmed = !!confirmation;

                        return (
                            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-[#0F4C75] truncate">{course.courseName}</h3>
                                            {isConfirmed ? (
                                                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Đã xác nhận
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                                                    Chưa xác nhận
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Building2 className="w-3.5 h-3.5" /> {course.location || 'Chưa rõ địa điểm'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {course.startTime ? new Date(course.startTime).toLocaleDateString('vi-VN') : 'Chưa có lịch'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3.5 h-3.5" /> {course.enrollmentCount || 0} trainee
                                            </span>
                                        </div>

                                        {isConfirmed && confirmation && (
                                            <div className="mt-4 bg-green-50 rounded-xl p-4 border border-green-100">
                                                <p className="text-sm text-green-800 font-medium mb-2">
                                                    Xác nhận lúc {new Date(confirmation.confirmedAt).toLocaleString('vi-VN')}
                                                </p>
                                                {confirmation.notes && (
                                                    <p className="text-sm text-green-700 italic">{confirmation.notes}</p>
                                                )}
                                                {confirmation.evidencePhotoUrls.length > 0 && (
                                                    <div className="flex gap-2 mt-3">
                                                        {confirmation.evidencePhotoUrls.map((url, i) => (
                                                            <a key={i} href={url} target="_blank" rel="noreferrer" className="rounded-lg overflow-hidden border border-green-200 w-16 h-16 block">
                                                                <img src={url} alt={`Ảnh ${i + 1}`} className="w-full h-full object-cover" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {!isConfirmed && (
                                        <Button
                                            onClick={() => setConfirmDialog({ open: true, courseId: course.id, courseName: course.courseName })}
                                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 font-bold gap-2 shadow-lg shadow-green-200 shrink-0"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Xác nhận WS
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

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
