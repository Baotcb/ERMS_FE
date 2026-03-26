import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { Course } from '@/features/hr/types/course-types';
import type { Employee } from '@/features/hr/api/employee-service';

export function AssignTrainerInfo({
    courseId,
    currentCourse,
    invitedTrainer,
    normalizedTrainerEmail,
}: {
    courseId?: string;
    currentCourse: Course | null;
    invitedTrainer: Employee | null;
    normalizedTrainerEmail: string | null;
}) {
    return (
        <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-semibold">2.1</div>
                <h2 className="text-[13px] font-bold text-gray-700 tracking-wider uppercase">Người đào tạo đã được mời</h2>
            </div>
            <p className="text-xs text-gray-500">
                Trainer được HR mời ngay từ bước tạo khóa học. Ở bước này bạn chỉ chọn học viên tham gia, không được đổi người đào tạo.
            </p>

            <div className="space-y-3 mt-4 min-h-[300px]">
                {!courseId ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-10 text-center text-sm text-gray-400">
                        Chọn khóa học để xem trainer đã được mời.
                    </div>
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
    );
}
