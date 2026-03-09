import * as z from 'zod';

export const trainingRequestSchema = z.object({
    requestedById: z.string().uuid('ID người yêu cầu không hợp lệ'),
    subject: z.string().min(5, 'Chul đề đào tạo phải có ít nhất 5 ký tự'),
    urgency: z.enum(['Normal', 'High', 'Urgent']),
    description: z.string().optional(),
    targetAudience: z.string().optional(),
    estimatedParticipants: z.coerce.number().min(1, 'Số lượng tối thiểu là 1').optional(),
    estimatedBudget: z.coerce.number().min(0, 'Ngân sách phải lớn hơn hoặc bằng 0').optional(),
});

export type TrainingRequestValues = z.infer<typeof trainingRequestSchema>;

export interface TrainingRequestFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export const TRAINING_REQUEST_DEFAULTS: TrainingRequestValues = {
    requestedById: '',
    subject: '',
    urgency: 'Normal',
    description: '',
    targetAudience: '',
    estimatedParticipants: 1,
    estimatedBudget: 0,
};
