"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Job, JobStatus } from "@/features/recruitment/jobs/types"
import { MockJobService } from "@/features/recruitment/jobs/data/mock-jobs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Clock, DollarSign, Calendar, ArrowLeft, Share2, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default function JobDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [job, setJob] = useState<Job | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchJob = async () => {
            if (!params.id) return
            try {
                const data = await MockJobService.getById(params.id as string)
                if (data) {
                    setJob(data)
                }
            } catch (error) {
                console.error("Failed to fetch job", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchJob()
    }, [params.id])

    const handleApply = () => {
        // Simple auth check simulation
        const token = localStorage.getItem('token')
        if (!token) {
            // Encode current URL to return after login
            const returnUrl = encodeURIComponent(`/recruitment/candidate/${params.id}/apply`)
            router.push(`/login?returnUrl=${returnUrl}`)
            return
        }

        router.push(`/recruitment/candidate/${params.id}/apply`)
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 px-4 space-y-8 animate-pulse">
                <div className="h-8 w-32 bg-muted rounded" />
                <div className="h-64 bg-muted rounded-xl" />
                <div className="space-y-4">
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-6 w-1/2 bg-muted rounded" />
                </div>
            </div>
        )
    }

    if (!job) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold text-slate-900">Job not found</h2>
                <Button asChild variant="link" className="mt-4">
                    <Link href="/recruitment/jobs">Back to Jobs</Link>
                </Button>
            </div>
        )
    }

    const isClosed = job.status === JobStatus.CLOSED || new Date(job.expiresAt) < new Date()

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Header / Hero */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Button variant="ghost" className="gap-2" asChild>
                        <Link href="/recruitment/candidate">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Jobs
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                            <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                            onClick={handleApply}
                            disabled={isClosed}
                            className={isClosed ? "" : "bg-indigo-600 hover:bg-indigo-700"}
                        >
                            {isClosed ? "Position Closed" : "Apply Now"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm border space-y-8">
                    {/* Title Section */}
                    <div>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                                    {job.title}
                                </h1>
                                <div className="flex flex-wrap items-center gap-4 mt-4 text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="h-4 w-4 text-indigo-500" />
                                        <span className="font-medium text-slate-700">{job.departmentName}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="h-4 w-4" />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        <span>Full-time</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <DollarSign className="h-4 w-4" />
                                        <span>{job.minSalary.toLocaleString()} - {job.maxSalary.toLocaleString()} {job.currency}</span>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center">
                                <Building2 className="h-8 w-8 text-slate-400" />
                            </div> */}
                        </div>
                    </div>

                    <hr />

                    {/* Description */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-slate-900">Job Description</h3>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                            {job.description}
                        </p>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-slate-900">Requirements</h3>
                        <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                                {job.requirements}
                            </p>
                            {/* Example of bullet points if requirements were structured */}
                            {/* <ul className="space-y-3 mt-4">
                                {job.requirements.split('\n').map((req, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                                        <span className="text-slate-700">{req.replace(/^- /, '')}</span>
                                    </li>
                                ))}
                            </ul> */}
                        </div>
                    </div>

                    {/* Benefits (Mocked for now since not in schema explicitly, usually part of desc) */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-slate-900">Why Join Us?</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                "Competitive Salary & Performance Bonus",
                                "Premium Healthcare Package",
                                "Hybrid Working Model",
                                "Annual Company Trip & Team Building",
                                "MacBook Pro provided",
                                "Unlimited Coffee & Snacks"
                            ].map((benefit, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-700">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    {benefit}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center pt-8 gap-4">
                        <div className="text-center text-slate-500 text-sm">
                            Application closes on {format(new Date(job.expiresAt), 'MMMM d, yyyy')}
                        </div>
                        <Button
                            size="lg"
                            className="bg-indigo-600 hover:bg-indigo-700 min-w-[200px]"
                            onClick={handleApply}
                            disabled={isClosed}
                        >
                            {isClosed ? "Position Closed" : "Apply for this Job"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
