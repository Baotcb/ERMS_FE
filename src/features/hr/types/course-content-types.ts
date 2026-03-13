export interface Lesson {
    id: string;
    courseId: string;
    sectionId?: string;
    title: string;
    description?: string;
    content?: string;
    videoUrl?: string;
    durationMinutes: number;
    orderIndex: number;
    materials?: Material[];
}

export interface Material {
    id: string;
    lessonId: string;
    title: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}

export interface CourseSection {
    id: string;
    courseId: string;
    title: string;
    orderIndex: number;
    lessons: Lesson[];
}

export interface CreateLessonCommand {
    courseId: string;
    sectionId?: string;
    title: string;
    description?: string;
    content?: string;
    videoUrl?: string;
    durationMinutes?: number;
    orderIndex: number;
}
