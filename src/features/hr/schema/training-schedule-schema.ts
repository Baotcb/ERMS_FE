import * as z from 'zod';

export const trainingScheduleSchema = z.object({
    selectedCourseId: z.string().min(1, 'Vui lòng chọn khóa học.'),
    locationType: z.enum(['online', 'offline']),
    startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu.'),
    startTime: z.string().min(1, 'Vui lòng chọn giờ bắt đầu.'),
    endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc.'),
    endTime: z.string().min(1, 'Vui lòng chọn giờ kết thúc.'),
    meetingLink: z.string().optional(),
    offlineLocation: z.string().optional(),
    notifyTrainerOnAssignment: z.boolean(),
}).superRefine((data, ctx) => {
    if (data.locationType === 'online' && data.meetingLink && data.meetingLink.trim() !== '') {
        try {
            const url = new URL(data.meetingLink.trim());
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                throw new Error();
            }
        } catch {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Link cuộc họp không hợp lệ. Để trống nếu muốn hệ thống tự tạo Zoom.',
                path: ['meetingLink'],
            });
        }
    }

    if (data.locationType === 'offline' && (!data.offlineLocation || data.offlineLocation.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Vui lòng nhập phòng họp/địa điểm tổ chức.',
            path: ['offlineLocation'],
        });
    }

    if (data.startDate && data.startTime && data.endDate && data.endTime) {
        // Chuẩn hoá time: chỉ lấy HH:mm, bỏ phần :ss nếu browser trả về
        const normalizeTime = (t: string) => t.split(':').slice(0, 2).join(':');
        const sTime = normalizeTime(data.startTime);
        const eTime = normalizeTime(data.endTime);

        const start = new Date(`${data.startDate}T${sTime}:00`);
        const end = new Date(`${data.endDate}T${eTime}:00`);
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end < start) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu.',
                path: ['endTime'],
            });
        }
    }
});

export type TrainingScheduleFormValues = z.infer<typeof trainingScheduleSchema>;
