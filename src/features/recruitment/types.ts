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

export interface Job {
    id: string; // PK
    title: string; // NVARCHAR
    description: string; // TEXT
    requirements: string; // TEXT
    minSalary: number; // DECIMAL
    maxSalary: number; // DECIMAL
    currency: 'VND' | 'USD'; // VARCHAR
    location: string; // NVARCHAR
    departmentId: string; // FK -> Departments.Id
    departmentName?: string; // Helper for display
    creatorId: string; // FK -> Employees.UserId
    creatorName?: string; // Helper for display
    status: JobStatus; // ENUM
    expiresAt: string; // DATETIME (ISO string)
    createdAt: string;
    updatedAt: string;
    applicantsCount?: number; // Computed
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
