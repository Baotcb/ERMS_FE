import * as z from 'zod';

export const trainingRequestSchema = z.object({
    requestedById: z.string().min(1, 'ID người yêu cầu là bắt buộc'),
    subject: z.string().min(5, 'Chủ đề đào tạo phải có ít nhất 5 ký tự'),
    urgency: z.enum(['Normal', 'High', 'Urgent']),
    description: z.string().optional(),
    targetAudience: z.string().optional(),
    estimatedParticipants: z.number().optional(),
    estimatedBudget: z.number().optional(),
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
