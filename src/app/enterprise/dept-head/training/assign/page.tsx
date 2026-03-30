import { Suspense } from 'react';
import { AssignTrainingPage } from '@/features/dept-head/components/training/assign-training-page';
import { trainingServerService } from '@/features/hr/api/training-server-service';
import { normalizeEmail } from '@/features/hr/utils/course-workflow';
import { getProfileServer } from '@/lib/server/profile-service';

export const metadata = {
    title: 'Phân công khóa học - Hệ thống Đào tạo nội bộ',
    description: 'Phân công nhân viên tham gia các khóa học trong công ty.',
};

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const planId = typeof resolvedParams.planId === 'string' ? resolvedParams.planId : undefined;
    const courseId = typeof resolvedParams.courseId === 'string' ? resolvedParams.courseId : undefined;
    
    // pagination & search mapped to List Page params
    const page = parseInt(typeof resolvedParams.page === 'string' ? resolvedParams.page : '1', 10);
    const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : '';

    // Fetch dept head's profile to get their departmentId
    let deptHeadDepartmentId: number | undefined;
    try {
        const profile = await getProfileServer();
        deptHeadDepartmentId = profile.departmentId;
    } catch {
        // If profile fetch fails, we can't filter by department - continue with all employees
    }

    // We fetch Base Dependencies parallelly
    // 1. All Published Courses (for combo box) - We only assign to ready courses
    // 2. Trainees (paginated via URL params) - filtered by dept head's department
    const [allReadyCourses, initialTrainees] = await Promise.all([
        trainingServerService.getAllCourses({ status: 'Published', pageSize: 100 }),
        trainingServerService.getEmployees({
            page: page,
            pageSize: 10,
            search: search,
            departmentId: deptHeadDepartmentId,
        }),
    ]);

    const initialCourses = {
        ...allReadyCourses,
        items: allReadyCourses.items.filter((course) => {
            if (courseId) {
                return course.id === courseId;
            }
            if (planId) {
                return course.trainingPlanId === planId;
            }
            return true;
        }),
    };

    // Derived Context - Fetched based on selected courseId if present
    let currentCourse = null;
    let invitedTrainer = null;
    let enrolledEmployeeIds: string[] = [];

    if (courseId) {
        currentCourse = await trainingServerService.getCourseDetails(courseId);
        
        const parallelFetches = [];
        
        // Fetch enrolled employees
        parallelFetches.push(
            trainingServerService.getCourseEnrolledEmployees(courseId)
                .then(ids => { enrolledEmployeeIds = ids; })
                .catch(() => {})
        );

        // Fetch Trainer info if available
        if (currentCourse.trainerEmail) {
            const normalizedTrainerEmail = normalizeEmail(currentCourse.trainerEmail);
            parallelFetches.push(
                trainingServerService.getEmployees({ search: normalizedTrainerEmail, pageSize: 20 })
                    .then(trainerResult => {
                        invitedTrainer = trainerResult.items.find(e => normalizeEmail(e.email) === normalizedTrainerEmail) || null;
                    })
                    .catch(() => {})
            );
        }

        await Promise.all(parallelFetches);
    } else if (initialCourses.items.length > 0) {
        // If courseId is not in URL, but we have courses, prepopulate with the first one 
        // to avoid empty view state, similar to the original Hook logic.
        const defaultCourseId = initialCourses.items[0].id;
        currentCourse = await trainingServerService.getCourseDetails(defaultCourseId);
        
        const parallelFetches = [];
        parallelFetches.push(
            trainingServerService.getCourseEnrolledEmployees(defaultCourseId)
                .then(ids => { enrolledEmployeeIds = ids; })
                .catch(() => {})
        );

        if (currentCourse.trainerEmail) {
            const normalizedTrainerEmail = normalizeEmail(currentCourse.trainerEmail);
            parallelFetches.push(
                trainingServerService.getEmployees({ search: normalizedTrainerEmail, pageSize: 20 })
                    .then(trainerResult => {
                        invitedTrainer = trainerResult.items.find(e => normalizeEmail(e.email) === normalizedTrainerEmail) || null;
                    })
                    .catch(() => {})
            );
        }
        await Promise.all(parallelFetches);
    }

    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-400">Đang tải biểu mẫu phân công...</div>}>
            <AssignTrainingPage
                initialCourses={initialCourses}
                initialTrainees={initialTrainees}
                initialCurrentCourse={currentCourse}
                initialInvitedTrainer={invitedTrainer}
                initialEnrolledEmployeeIds={enrolledEmployeeIds}
                deptHeadDepartmentId={deptHeadDepartmentId}
                searchParams={{
                    page,
                    search,
                    departmentId: deptHeadDepartmentId ? String(deptHeadDepartmentId) : 'all',
                    courseId: courseId || (initialCourses.items.length > 0 ? initialCourses.items[0].id : '')
                }}
            />
        </Suspense>
    );
}

