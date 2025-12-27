"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CreateJobWizard } from "@/features/recruitment/jobs/components/CreateJobWizard"
import { MockJobService } from "@/features/recruitment/jobs/data/mock-jobs"
import { JobPosting } from "@/features/recruitment/jobs/types"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EditJobPageProps {
    params: {
        id: string
    }
}

export default function EditJobPage({ params }: EditJobPageProps) {
    const [job, setJob] = useState<JobPosting | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const data = await MockJobService.getById(params.id)
                if (data) {
                    setJob(data)
                } else {
                    toast({
                        variant: "destructive",
                        title: "Job not found",
                        description: "The requested job posting could not be found.",
                    })
                    router.push("/recruitment/jobs")
                }
            } catch (error) {
                console.error("Failed to fetch job", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load job details.",
                })
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) {
            fetchJob()
        }
    }, [params.id, router, toast])

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
