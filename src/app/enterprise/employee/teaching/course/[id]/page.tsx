import { Suspense } from 'react';
import { TrainerCourseDashboard } from '@/features/employee/components/teaching/trainer-course-dashboard';
import { Loader2, AlertTriangle } from 'lucide-react';
import { trainingServerService } from '@/features/hr/api/training-server-service';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let course = null;
    let errorMessage = '';
    try {
        course = await trainingServerService.getCourseDetails(id);
    } catch (err: unknown) {
        errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu khóa học';
        console.error('[Teaching Course Page] getCourseDetails failed:', errorMessage, 'courseId:', id);
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-500" />
                <h2 className="text-xl font-bold text-gray-700">Không thể tải khóa học</h2>
                <p className="text-gray-500 max-w-md">
                    {errorMessage || `Khóa học với ID "${id}" không tồn tại hoặc bạn chưa có quyền truy cập. Hãy thử đăng nhập lại.`}
                </p>
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
            </div>
        }>
            <TrainerCourseDashboard initialCourse={course} />
        </Suspense>
    );
}
