"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CreateJobWizard } from "@/features/recruitment/jobs/components/hr/create-job-wizard"
import { MockJobService } from "@/features/recruitment/jobs/data/mock-jobs"
import { Job } from "@/features/recruitment/jobs/types"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EditJobPageProps {
    params: {
        id: string
    }
}

export default function EditJobPage({ params }: EditJobPageProps) {
    const [job, setJob] = useState<Job | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await MockJobService.getById(params.id)
                if (data) {
                    setJob(data)
                } else {
                    setError("The requested job posting could not be found.")
                }
            } catch (error) {
                console.error("Failed to fetch job", error)
                setError("Failed to load job details. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            fetchJob()
        }
    }, [params.id, router])

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-5xl mx-auto py-8 text-center">
                <Alert variant="destructive" className="mb-6 mx-auto max-w-lg text-left">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={() => router.push('/recruitment/jobs')}>
                    Back to Jobs
                </Button>
            </div>
        )
    }

    if (!job) return null

    return (
        <div className="max-w-5xl mx-auto py-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Edit Job Posting</h1>
                <p className="text-muted-foreground">Update the details for {job.title}.</p>
            </div>

            <CreateJobWizard initialData={job} isEditMode={true} />
        </div>
    )
}
