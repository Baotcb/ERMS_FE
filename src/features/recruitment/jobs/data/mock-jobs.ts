import { JobCategory, JobPosting, JobStatus } from "../types";

const MOCK_JOBS: JobPosting[] = [
    {
        id: "job-001",
        title: "Senior Java Developer",
        departmentId: "dept-sw",
        departmentName: "Software Delivery",
        location: "F-Town 3, HCMC",
        employmentType: "FULL_TIME",
        description: "<p>We are looking for an experienced Java Developer to lead our banking transformation projects.</p>",
        requirements: {
            skills: [
                { id: "s1", name: "Java", level: "EXPERT", isMandatory: true },
                { id: "s2", name: "Spring Boot", level: "ADVANCED", isMandatory: true },
                { id: "s3", name: "Microservices", level: "ADVANCED", isMandatory: false }
            ],
            experienceYears: 5,
            educationLevel: "Bachelor"
        },
        salary: { isVisible: true, min: 2000, max: 3500, currency: "USD" },
        category: JobCategory.SOFTWARE_ENGINEERING,
        status: JobStatus.PUBLISHED,
        createdAt: "2024-01-15T08:00:00Z",
        updatedAt: "2024-01-15T08:00:00Z",
        publishedAt: "2024-01-20T09:00:00Z",
        applicantsCount: 12
    },
    {
        id: "job-002",
        title: "AI Research Scientist",
        departmentId: "dept-ai",
        departmentName: "FPT AI Center",
        location: "FPT Tower, Hanoi",
        employmentType: "FULL_TIME",
        description: "<p>Join our elite team researching LLMs and Computer Vision.</p>",
        requirements: {
            skills: [
                { id: "s4", name: "Python", level: "EXPERT", isMandatory: true },
                { id: "s5", name: "PyTorch", level: "ADVANCED", isMandatory: true },
                { id: "s6", name: "NLP", level: "ADVANCED", isMandatory: true }
            ],
            experienceYears: 3,
            educationLevel: "Master/PhD"
        },
        salary: { isVisible: false, min: 0, max: 0, currency: "USD" },
        category: JobCategory.ARTIFICIAL_INTELLIGENCE,
        status: JobStatus.PUBLISHED,
        createdAt: "2024-02-01T10:00:00Z",
        updatedAt: "2024-02-01T10:00:00Z",
        publishedAt: "2024-02-02T11:00:00Z",
        applicantsCount: 45
    },
    {
        id: "job-003",
        title: "Fresher Business Analyst",
        departmentId: "dept-ba",
        departmentName: "Global Healthcare",
        location: "F-Complex, Da Nang",
        employmentType: "FULL_TIME",
        description: "<p>Great opportunity for fresh graduates to start a career in BA.</p>",
        requirements: {
            skills: [
                { id: "s7", name: "Communication", level: "INTERMEDIATE", isMandatory: true },
                { id: "s8", name: "English", level: "ADVANCED", isMandatory: true },
                { id: "s9", name: "SQL", level: "BEGINNER", isMandatory: false }
            ],
            experienceYears: 0,
            educationLevel: "Bachelor"
        },
        salary: { isVisible: true, min: 10000000, max: 15000000, currency: "VND" },
        category: JobCategory.BUSINESS_ANALYSIS,
        status: JobStatus.DRAFT,
        createdAt: "2024-03-10T14:30:00Z",
        updatedAt: "2024-03-10T14:30:00Z",
        applicantsCount: 0
    },
    {
        id: "job-004",
        title: "University Lecturer - Computer Science",
        departmentId: "dept-edu",
        departmentName: "FPT University",
        location: "Hoa Lac, Hanoi",
        employmentType: "CONTRACT",
        description: "<p>Teaching Introduction to Programming and Data Structures.</p>",
        requirements: {
            skills: [
                { id: "s10", name: "Teaching", level: "ADVANCED", isMandatory: true },
                { id: "s1", name: "Java", level: "ADVANCED", isMandatory: true }
            ],
            experienceYears: 2,
            educationLevel: "Master"
        },
        salary: { isVisible: true, min: 20000000, max: 35000000, currency: "VND" },
        category: JobCategory.EDUCATION,
        status: JobStatus.CLOSED,
        createdAt: "2023-11-15T08:00:00Z",
        updatedAt: "2023-12-20T17:00:00Z",
        publishedAt: "2023-11-20T09:00:00Z",
        applicantsCount: 8
    }
];

// Simple in-memory storage simulation
let jobsStore = [...MOCK_JOBS];

export const MockJobService = {
    getAll: async (): Promise<JobPosting[]> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return [...jobsStore];
    },

    getById: async (id: string): Promise<JobPosting | undefined> => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return jobsStore.find(j => j.id === id);
    },

    create: async (job: Omit<JobPosting, "id" | "createdAt" | "updatedAt" | "applicantsCount">): Promise<JobPosting> => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const newJob: JobPosting = {
            ...job,
            id: `job-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            applicantsCount: 0
        };
        jobsStore = [newJob, ...jobsStore];
        return newJob;
    },

    update: async (id: string, updates: Partial<JobPosting>): Promise<JobPosting> => {
        await new Promise(resolve => setTimeout(resolve, 600));
        const index = jobsStore.findIndex(j => j.id === id);
        if (index === -1) throw new Error("Job not found");

        const updatedJob = {
            ...jobsStore[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        jobsStore[index] = updatedJob;
        return updatedJob;
    },

    delete: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        jobsStore = jobsStore.filter(j => j.id !== id);
    }
};
