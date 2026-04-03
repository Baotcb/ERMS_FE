import * as z from 'zod';

export const editPlanSchema = z.object({
    planName: z.string().min(5, 'Tên kế hoạch phải có ít nhất 5 ký tự'),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
    totalBudget: z.number().min(0, 'Ngân sách không hợp lệ').optional(),
    description: z.string().optional(),
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate']
});

export type EditPlanValues = z.infer<typeof editPlanSchema>;
