"use client"

import { useEffect, useState } from "react"
import { CreateJobWizard } from "@/features/recruitment/jobs/components"
import { JobService } from "@/features/recruitment/jobs/api/jobs-service"
import { Job } from "@/features/recruitment/jobs/types"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function EditJobPage() {
    const params = useParams()
    const router = useRouter()
    const [job, setJob] = useState<Job | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchJob = async () => {
            if (!params.id) return
            try {
                const data = await JobService.getById(params.id as string) as unknown as Job
                // API might return standard object, verifying type match happens at runtime
                setJob(data)
            } catch (error) {
                console.error("Failed to fetch job", error)
                // router.push('/recruitment/hr/jobs')
            } finally {
                setIsLoading(false)
            }
        }
        fetchJob()
    }, [params.id, router])

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!job) {
        return <div>Job not found</div>
    }

    return <CreateJobWizard initialData={job} isEditMode={true} />
}
