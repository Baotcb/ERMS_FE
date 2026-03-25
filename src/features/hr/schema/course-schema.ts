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
