"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Eye, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { JobPosting, JobStatus } from "@/features/recruitment/jobs/types"
import { MockJobService } from "@/features/recruitment/jobs/data/mock-jobs"
import { JobStats, JobCard, JobFilters } from "@/features/recruitment/jobs/components"
import { useToast } from "@/hooks/use-toast"

export default function JobListingPage() {
    const [jobs, setJobs] = useState<JobPosting[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    const { toast } = useToast()

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true)
            try {
                const data = await MockJobService.getAll()
                setJobs(data)
            } catch (error) {
                console.error("Failed to fetch jobs", error)
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem loading job postings.",
                })
            } finally {
                setIsLoading(false)
            }
        }
        fetchJobs()
    }, [toast])

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "ALL" || job.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadgeVariant = (status: JobStatus) => {
        switch (status) {
            case JobStatus.PUBLISHED: return "default"
            case JobStatus.DRAFT: return "secondary"
            case JobStatus.CLOSED: return "destructive"
            case JobStatus.ARCHIVED: return "outline"
            default: return "default"
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 shadow-2xl">
                <div className="absolute top-0 right-0 -transtale-y-1/2 translate-x-1/4 opacity-10">
                    <Sparkles className="h-96 w-96 text-white" />
                </div>

                <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            Recruitment Dashboard
                        </h1>
                        <p className="text-blue-100 max-w-xl text-lg">
                            Manage your talent pipeline, track applications, and publish new opportunities all in one place.
                        </p>
                    </div>
                    <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-blue-50 shadow-lg border-0">
                        <Link href="/recruitment/jobs/create">
                            <PlusCircle className="mr-2 h-5 w-5" />
                            Create New Job
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-0 space-y-8">
                <JobStats jobs={jobs} />

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
                            <h3 className="text-lg font-semibold">No jobs found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or create a new job.</p>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredJobs.map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Applicants</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredJobs.map((job) => (
                                        <TableRow key={job.id} className="hover:bg-muted/20 transition-colors">
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-base">{job.title}</span>
                                                    <span className="text-xs text-muted-foreground">{job.category}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{job.departmentName}</TableCell>
                                            <TableCell>{job.location}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadgeVariant(job.status)}>
                                                    {job.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                                    {job.applicantsCount} candidates
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/recruitment/jobs/${job.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button variant="ghost" size="icon" asChild>
                                                        <Link href={`/recruitment/jobs/${job.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
