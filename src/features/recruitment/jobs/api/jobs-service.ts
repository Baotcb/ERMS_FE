import { api } from "@/lib/api";
import { Job } from "../types";

export interface CreateJobPostingCommand {
    title: string;
    description?: string;
    requirements?: string;
    minSalary?: number;
    maxSalary?: number;
    currency: string;
    location?: string;
    departmentId?: number;
    postingType?: string;
    publishDate?: string;
    expiresAt?: string;
    skillIds?: number[];
}

export const JobService = {
    create: async (data: CreateJobPostingCommand) => {
        return api.post('/api/JobPostings', data);
    },

    getAll: async (filters?: { status?: string; postingType?: string }) => {
        const query = new URLSearchParams();
        if (filters?.status) query.append('status', filters.status);
        if (filters?.postingType) query.append('postingType', filters.postingType);

        const queryString = query.toString();
        const url = `/api/JobPostings${queryString ? `?${queryString}` : ''}`;

        return api.get<Job[]>(url);
    },

    update: async (id: string, data: Partial<CreateJobPostingCommand>) => {
        return api.put(`/api/JobPostings/${id}`, data);
    },

    getById: async (id: string) => {
        return api.get<Job>(`/api/JobPostings/${id}`);
    }
}
