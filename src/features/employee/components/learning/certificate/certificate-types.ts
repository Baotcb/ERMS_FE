/** Shared types for the certificate export feature. */

export interface CertificateData {
    learnerName: string;
    learnerEmail: string;
    departmentName: string;
    courseName: string;
    courseCode: string;
    trainerName: string;
    score: number;
    completionDate: string; // yyyy-MM-dd
    companyName: string;
    companyLogoUrl: string;
}
