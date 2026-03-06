import { TrainingRequest } from '../../dept-head/types/training-types';

export interface TrainingPlan {
    id: string;
    planName: string;
    year: number;
    description: string;
    status: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
    totalBudget: number;
    totalCourses: number;
    createdAt: string;
    updatedAt: string;
}

export interface TrainingPlanCourse {
    id: string;
    trainingPlanId: string;
    subject: string;
    description: string;
    targetAudience: string;
    estimatedParticipants: number;
    estimatedBudget: number;
    trainingRequestId?: string; // Link back to original request if any
}

export interface CreateTrainingPlan {
    planName: string;
    year: number;
    description: string;
    courseIds: string[]; // Selected requests to include
}
