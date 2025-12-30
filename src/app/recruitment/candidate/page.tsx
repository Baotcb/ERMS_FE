"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles, Briefcase } from "lucide-react"
import { useEffect, useState } from "react"
import { Job, JobStatus } from "@/features/recruitment/jobs/types"
import { JobService } from "@/features/recruitment/jobs/api/jobs-service"
import { JobCard, JobFilters } from "@/features/recruitment/jobs/components"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function JobListingPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true)
            try {
                // For candidate view, we strictly fetch OPEN jobs
                const data = await JobService.getAll({ status: 'Open' })
                setJobs(data)
            } catch (error) {
                console.error("Failed to fetch jobs", error)
                setError("There was a problem loading job postings. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchJobs()
    }, [])

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location?.toLowerCase().includes(searchTerm.toLowerCase())

        // Match status filter (ignore casing)
        const matchesStatus = statusFilter === "ALL" || job.status === statusFilter

        // For public page, assume we might technically want to filter by OPEN only, 
        // but for demo purpose let's allow seeing everything or filter later if needed.
        // Usually candidate page only shows OPEN.

        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-8 pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 sm:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 -transtale-y-1/2 translate-x-1/4 opacity-10">
                    <Sparkles className="h-96 w-96 text-white" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                            Join Our Team
                        </h1>
                        <p className="text-slate-300 text-lg sm:text-xl">
                            Discover your next career opportunity and help us build the future.
                            Explore open positions below.
                        </p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-0 space-y-8">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-6">
                    <JobFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                    />

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 rounded-xl bg-muted" />
                            ))}
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-20 rounded-xl border border-dashed bg-muted/30">
                            <Briefcase className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">No open positions found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                            {filteredJobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
