export interface TrainingPlan {
    id: string;
    planCode: string; // From backend DTO
    planName: string;
    description: string;
    year: number;
    totalCourses: number;
    totalBudget: number;
    status: string;
    createdBy: string;
    createdAt: string;
    updatedAt?: string;
    reviewNote?: string;
    startDate: string;
    endDate: string;
}

export interface CreateTrainingPlan {
    planCode: string;
    planName: string;
    description?: string;
    startDate: string;
    endDate: string;
    totalBudget?: number;
    status?: string;
    trainingRequestIds: string[];
}

export interface TrainingPlansResult {
    items: TrainingPlan[];
    totalCount: number;
}
