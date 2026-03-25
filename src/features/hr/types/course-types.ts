export interface Course {
    id: string;
    trainingPlanId?: string;
    courseName: string;
    courseCode: string;
    description?: string;
    thumbnailUrl?: string;
    trainerEmail?: string;
    contentManagerEmail?: string;
    location?: string;
    startTime?: string;
    isOnline?: boolean;
    trainerId?: string;
    trainerName?: string;
    durationMinutes?: number;
    level?: string;
    status: string;
    isMandatory: boolean;
    maxEnrollments?: number;
    enrollmentDeadline?: string;
    completionCriteria: string;
    publishedAt?: string;
    lessonCount: number;
    enrollmentCount: number;
    hasFinalQuiz?: boolean;
    finalQuizId?: string;
    createdAt: string;
}

export interface CreateCourseCommand {
    trainingPlanId?: string;
    courseName: string;
    courseCode: string;
    description?: string;
    thumbnailUrl?: string;
    trainerEmail: string;
    location?: string;
    startTime: string;
    isOnline: boolean;
    durationMinutes?: number;
    level?: string;
    isMandatory: boolean;
    maxEnrollments?: number;
    enrollmentDeadline?: string;
    completionCriteria?: string;
}

export interface UpdateCourseCommand extends CreateCourseCommand {
    id: string;
}

export interface PublishCourseCommand {
    id: string;
    startTime: string;
    trainingType: 'Online' | 'Offline';
    location: string;
}

export interface CourseResult {
    items: Course[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
