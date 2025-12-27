export enum JobStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    CLOSED = 'CLOSED',
    ARCHIVED = 'ARCHIVED'
}

export enum JobCategory {
    SOFTWARE_ENGINEERING = 'Software Engineering',
    ARTIFICIAL_INTELLIGENCE = 'Artificial Intelligence',
    EDUCATION = 'Education',
    BUSINESS_ANALYSIS = 'Business Analysis',
    QUALITY_ASSURANCE = 'Quality Assurance',
    DATA_SCIENCE = 'Data Science',
    PROJECT_MANAGEMENT = 'Project Management',
    OTHER = 'Other'
}

export interface SkillRequirement {
    id: string;
    name: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    isMandatory: boolean;
}

export interface SalaryRange {
    isVisible: boolean;
    min: number;
    max: number;
    currency: 'VND' | 'USD';
}

export interface JobPosting {
    id: string;
    title: string;
    departmentId: string; // Could be mapped to Department name later
    departmentName?: string; // Optional for display
    location: string;
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
    description: string;
    requirements: {
        skills: SkillRequirement[];
        experienceYears: number;
        educationLevel?: string;
    };
    salary: SalaryRange;
    category: JobCategory;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    applicantsCount: number;
}
