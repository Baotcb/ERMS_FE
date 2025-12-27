import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JobPosting, JobStatus } from "../types"
import { Briefcase, FileText, CheckCircle, Users } from "lucide-react"

interface JobStatsProps {
    jobs: JobPosting[]
}

export function JobStats({ jobs }: JobStatsProps) {
    const totalJobs = jobs.length
    const activeJobs = jobs.filter(j => j.status === JobStatus.PUBLISHED).length
    const draftJobs = jobs.filter(j => j.status === JobStatus.DRAFT).length
    const totalApplicants = jobs.reduce((acc, curr) => acc + curr.applicantsCount, 0)

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Postings</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalJobs}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">{activeJobs}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                    <FileText className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{draftJobs}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalApplicants}</div>
                </CardContent>
            </Card>
        </div>
    )
}
