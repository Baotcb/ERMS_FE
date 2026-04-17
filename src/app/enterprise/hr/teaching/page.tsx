import { Suspense } from 'react';
import { TeachingTasksPage } from '@/features/employee/components/teaching/teaching-tasks-page';
import { Loader2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-fetch';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { isCourseOwnedByUser } from '@/features/hr/utils/course-workflow';
import { HR_ROLES } from '@/utils/constants';

export default async function Page() {
    const session = await getServerSession();

    if (!session.role || !HR_ROLES.includes(session.role as typeof HR_ROLES[number])) {
        redirect('/enterprise/hr/dashboard');
    }

    const allCourses = await trainingServerService.getAllCourses({ pageSize: 100 }).catch(() => ({ items: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 0 }));
    const employeesData = await trainingServerService.getEmployees({ pageSize: 1000 }).catch(() => ({ items: [] }));
    
    // Tạo tập hợp email của nhân viên nội bộ (lower case để so sánh chính xác)
    const internalEmails = new Set(employeesData.items.map(e => e.email?.toLowerCase()).filter(Boolean));

    const initialCourses = allCourses.items.filter((course) => {
        // HR Access check
        const hasAccess = isCourseOwnedByUser(course, session.user, session.role);
        
        // Kiểm tra xem giảng viên có nằm ngoài hệ thống không (email không thuộc list nhân viên nội bộ)
        const isExternalTrainer = course.trainerEmail && !internalEmails.has(course.trainerEmail.toLowerCase());
        
        return hasAccess && isExternalTrainer;
    });

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
            </div>
        }>
            <TeachingTasksPage
                teachingBasePath="/enterprise/hr/teaching"
                initialCourses={initialCourses}
            />
        </Suspense>
    );
}
