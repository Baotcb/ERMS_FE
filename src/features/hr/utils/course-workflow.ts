import { Course, PublishCourseCommand } from '../types/course-types';

interface CourseUserIdentity {
    id?: string | null;
    email?: string | null;
    fullName?: string | null;
}

export function normalizeEmail(value?: string | null): string {
    return value?.trim().toLowerCase() || '';
}

function normalizeName(value?: string | null): string {
    return value?.trim().toLowerCase() || '';
}

export function isCourseOwnedByUser(
    course: Course, 
    user: CourseUserIdentity | null | undefined,
    role?: string | string[] | null
): boolean {
    if (role && (Array.isArray(role) ? role.includes('HR') : role === 'HR')) {
        return true;
    }

    if (!user) {
        return false;
    }

    const normalizedUserEmail = normalizeEmail(user.email);

    // Match by trainerEmail
    const normalizedTrainerEmail = normalizeEmail(course.trainerEmail);
    if (normalizedTrainerEmail && normalizedUserEmail && normalizedTrainerEmail === normalizedUserEmail) {
        return true;
    }

    if (course.trainerId && user.id) {
        return course.trainerId === user.id;
    }

    const normalizedTrainerName = normalizeName(course.trainerName);
    const normalizedUserFullName = normalizeName(user.fullName);

    return Boolean(normalizedTrainerName) && Boolean(normalizedUserFullName) && normalizedTrainerName === normalizedUserFullName;
}

export function buildPublishCourseCommand(course: Course): PublishCourseCommand {
    const trainerEmail = normalizeEmail(course.trainerEmail);
    if (!trainerEmail) {
        throw new Error('Khóa học chưa có email giảng viên hợp lệ.');
    }

    if (!course.startTime) {
        throw new Error('Khóa học chưa có thời gian bắt đầu. Vui lòng nhờ HR thiết lập lịch trước.');
    }

    if (typeof course.isOnline !== 'boolean') {
        throw new Error('Khóa học chưa xác định hình thức online/offline.');
    }

    const location = course.location?.trim() || '';
    if (!location) {
        throw new Error(course.isOnline ? 'Khóa học online chưa có link họp.' : 'Khóa học offline chưa có địa điểm đào tạo.');
    }

    return {
        id: course.id,
        startTime: course.startTime,
        trainingType: course.isOnline ? 'Online' : 'Offline',
        location,
    };
}