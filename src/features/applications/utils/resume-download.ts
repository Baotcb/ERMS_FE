export function getApplicationResumeDownloadUrl(applicationId: string): string {
    return `/api/applications/${applicationId}/resume/download`
}
