import { apiClient } from '@/lib/api-client';

export interface WorkshopConfirmation {
    id: string;
    courseId: string;
    confirmedByUserId: string;
    evidencePhotoUrls: string[];
    notes?: string;
    confirmedAt: string;
}

export interface ConfirmWorkshopPayload {
    evidencePhotoUrls: string[];
    notes?: string;
}

export const workshopService = {
    async confirmWorkshopCompletion(courseId: string, payload: ConfirmWorkshopPayload) {
        const response = await apiClient.post(
            `/api/Course/${courseId}/workshop-confirmation`,
            payload
        );
        if (!response.ok) {
            let message = 'Không thể xác nhận workshop';
            try {
                const body = await response.text();
                const json = JSON.parse(body);
                message = json.message ?? json.title ?? body ?? message;
            } catch { /* ignore */ }
            throw new Error(message);
        }
        return response.json() as Promise<{ message: string; confirmationId: string }>;
    },

    async getWorkshopConfirmation(courseId: string): Promise<WorkshopConfirmation | null> {
        try {
            const response = await apiClient.get(
                `/api/Course/${courseId}/workshop-confirmation`
            );
            if (!response.ok) return null;
            return response.json() as Promise<WorkshopConfirmation>;
        } catch {
            return null;
        }
    },
};
