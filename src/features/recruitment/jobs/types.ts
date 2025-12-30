export enum JobStatus {
    DRAFT = 'Draft',
    PENDING_APPROVAL = 'PendingApproval',
    OPEN = 'Open',
    CLOSED = 'Closed'
}

export enum ApplicationStatus {
    APPLIED = 'Applied',
    SCREENING = 'Screening',
    INTERVIEWING = 'Interviewing',
    OFFERED = 'Offered',
    HIRED = 'Hired',
    REJECTED = 'Rejected',
    WITHDRAWN = 'Withdrawn'
}

export interface JobSkill {
    id: number;
    name: string;
    weight: number;
    minProficiency: number;
}

export interface Job {
    id: string; // PK
    title: string;
    description: string;
    requirements: string;
    minSalary: number;
    maxSalary: number;
    currency: 'VND' | 'USD';
    location: string;
    departmentId: number; // Backend uses Int
    departmentName?: string;
    creatorId: string;
    creatorName?: string;
    status: JobStatus;
    postingType: string;
    publishDate?: string;
    expiresAt?: string;
    skills?: JobSkill[];

    // Virtual/Computed fields not yet in DTO, make optional
    createdAt?: string;
    updatedAt?: string;
    applicantsCount?: number;
}

export interface Application {
    id: string; // PK
    jobId: string; // FK
    candidateId: string; // FK
    resumeId?: string; // FK
    cvUrl: string; // VARCHAR
    coverLetter: string; // TEXT
    matchingScore?: number; // FLOAT
    status: ApplicationStatus; // ENUM
    appliedAt: string; // DATETIME
    withdrawnAt?: string; // DATETIME, Nullable
    withdrawReason?: string; // NVARCHAR, Nullable

    // Helper fields for display
    jobTitle?: string;
    candidateName?: string;
    candidateEmail?: string;
}
