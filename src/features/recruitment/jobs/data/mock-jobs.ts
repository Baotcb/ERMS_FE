import { Job, JobStatus } from '../types';

const MOCK_JOBS: Job[] = [
    {
        id: 'JOB-001',
        title: 'Senior Frontend Engineer (React/Next.js)',
        description: 'We are looking for an experienced Frontend Engineer to lead our web application development...',
        requirements: '- 5+ years of experience with React\n- Deep understanding of Next.js App Router\n- Experience with Tailwind CSS',
        minSalary: 2000,
        maxSalary: 3500,
        currency: 'USD',
        location: 'Ho Chi Minh City (Hybrid)',
        departmentId: 'DEPT-ENG',
        departmentName: 'Engineering',
        creatorId: 'EMP-001',
        creatorName: 'Nguyen Van A',
        status: JobStatus.OPEN,
        expiresAt: '2026-01-30T00:00:00Z',
        createdAt: '2025-12-01T00:00:00Z',
        updatedAt: '2025-12-01T00:00:00Z',
        applicantsCount: 12
    },
    {
        id: 'JOB-002',
        title: 'Backend Developer (.NET Core)',
        description: 'Join our backend team to build robust and scalable APIs...',
        requirements: '- Strong knowledge of C# and .NET Core\n- Experience with SQL Server and EF Core\n- Microservices architecture',
        minSalary: 1500,
        maxSalary: 2500,
        currency: 'USD',
        location: 'Ha Noi',
        departmentId: 'DEPT-ENG',
        departmentName: 'Engineering',
        creatorId: 'EMP-001',
        creatorName: 'Nguyen Van A',
        status: JobStatus.OPEN,
        expiresAt: '2026-02-15T00:00:00Z',
        createdAt: '2025-12-10T00:00:00Z',
        updatedAt: '2025-12-10T00:00:00Z',
        applicantsCount: 5
    },
    {
        id: 'JOB-003',
        title: 'Product Owner',
        description: 'Define product vision and roadmap...',
        requirements: '- Experience in Agile/Scrum\n- Strong communication skills',
        minSalary: 2500,
        maxSalary: 4000,
        currency: 'USD',
        location: 'Ho Chi Minh City',
        departmentId: 'DEPT-PROD',
        departmentName: 'Product',
        creatorId: 'EMP-002',
        creatorName: 'Le Thi B',
        status: JobStatus.PENDING_APPROVAL,
        expiresAt: '2026-03-01T00:00:00Z',
        createdAt: '2025-12-20T00:00:00Z',
        updatedAt: '2025-12-20T00:00:00Z',
        applicantsCount: 0
    }
];

export const MockJobService = {
    getAll: async (): Promise<Job[]> => {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
        return MOCK_JOBS;
    },

    getById: async (id: string): Promise<Job | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_JOBS.find(job => job.id === id);
    },

    create: async (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newJob: Job = {
            ...job,
            id: `JOB-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            applicantsCount: 0
        };
        MOCK_JOBS.unshift(newJob);
        return newJob;
    },

    update: async (id: string, updates: Partial<Job>): Promise<Job> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const index = MOCK_JOBS.findIndex(j => j.id === id);
        if (index === -1) throw new Error("Job not found");

        MOCK_JOBS[index] = {
            ...MOCK_JOBS[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        return MOCK_JOBS[index];
    }
};
