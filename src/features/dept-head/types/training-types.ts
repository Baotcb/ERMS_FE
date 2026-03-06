export interface TrainingRequest {
    id: string;
    subject: string;
    urgency: string;
    status: string;
    description?: string;
    targetAudience?: string;
    estimatedParticipants?: number;
    estimatedBudget?: number;
    requestedById: string;
    requestedByName?: string;
    departmentId: number;
    departmentName?: string;
    createdAt: string;
}

export interface CreateTrainingRequest {
    departmentId: number;
    subject: string;
    urgency: string;
    description?: string;
    targetAudience?: string;
    estimatedParticipants?: number;
    estimatedBudget?: number;
}

export interface TrainingRequestsResult {
    items: TrainingRequest[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
