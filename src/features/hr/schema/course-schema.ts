import * as z from 'zod';

export const createCourseSchema = z.object({
    trainingPlanId: z.string().min(1, 'Vui lòng chọn kế hoạch đào tạo trước khi tiếp tục.'),
    courseName: z.string().min(1, 'Vui lòng nhập tên khóa học.'),
    courseCode: z.string().min(1, 'Vui lòng nhập mã khóa học.'),
    description: z.string().optional(),
    trainerEmail: z.string().min(1, 'Vui lòng nhập email người đào tạo.').email('Email không đúng định dạng.'),
    durationMinutes: z.string().optional().refine(
        v => !v || (!isNaN(Number(v)) && Number(v) > 0),
        'Thời lượng phải là số lớn hơn 0.'
    ),
    maxEnrollments: z.string().optional().refine(
        v => !v || (!isNaN(Number(v)) && Number(v) > 0),
        'Số lượng học viên tối đa phải là số lớn hơn 0.'
    ),
    completionCriteria: z.string().min(1, 'Vui lòng chọn tiêu chí hoàn thành.'),
    isMandatory: z.boolean(),
});

export type CreateCourseFormValues = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = z.object({
    courseName: z.string().min(3, 'Tên khóa học phải có ít nhất 3 ký tự'),
    courseCode: z.string().min(2, 'Mã khóa học bắt buộc'),
    trainerEmail: z.string().email('Email không hợp lệ').min(1, 'Email giảng viên là bắt buộc'),
    description: z.string().optional(),
    location: z.string().optional(),
    startTime: z.string().min(1, 'Thời gian bắt đầu là bắt buộc'),
    isOnline: z.boolean(),
    durationMinutes: z.number().min(30, 'Thời lượng tối thiểu 30 phút').optional(),
    level: z.string().optional(),
    isMandatory: z.boolean(),
    maxEnrollments: z.number().min(1, 'Số lượng học viên phải lớn hơn 0').optional(),
    enrollmentDeadline: z.string().optional(),
    completionCriteria: z.string().min(5, 'Tiêu chí hoàn thành là bắt buộc (ví dụ: Hoàn tất 100% video và bài kiểm tra trên 80 điểm)'),
});

export type UpdateCourseValues = z.infer<typeof updateCourseSchema>;

