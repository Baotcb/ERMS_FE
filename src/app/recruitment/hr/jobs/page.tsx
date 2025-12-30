"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlusCircle, Edit, MoreHorizontal, Search, Filter } from "lucide-react"
import { useEffect, useState } from "react"
import { Job, JobStatus } from "@/features/recruitment/jobs/types"
import { JobService } from "@/features/recruitment/jobs/api/jobs-service"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function HRManageJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchJobs = async () => {
            setIsLoading(true)
            try {
                const data = await JobService.getAll()
                setJobs(data)
            } catch (error) {
                console.error(error)
                setError("Failed to load jobs. Please try again later.")
            } finally {
                setIsLoading(false)
            }
        }
        fetchJobs()
    }, [])

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusVariant = (status: JobStatus) => {
        switch (status) {
            case JobStatus.OPEN: return "default"
            case JobStatus.DRAFT: return "secondary"
            case JobStatus.CLOSED: return "destructive"
            case JobStatus.PENDING_APPROVAL: return "secondary"
            default: return "outline"
        }
    }

    return (
        <div className="space-y-6 container mx-auto py-10 px-4">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
                    <p className="text-muted-foreground">Create and manage job postings for your organization.</p>
                </div>
                <Button asChild>
                    <Link href="/recruitment/hr/jobs/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Job
                    </Link>
                </Button>
            </div>


            {
                error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )
            }

            <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search jobs..."
                        className="pl-9"
                        aria-label="Search jobs"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Applicants</TableHead>
                            <TableHead>Posted Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
                            </TableRow>
                        ) : filteredJobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No jobs found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredJobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{job.title}</span>
                                            <span className="text-xs text-muted-foreground">{job.location}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{job.departmentName}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(job.status)}>
                                            {job.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{job.applicantsCount || 0}</TableCell>
                                    <TableCell>{job.publishDate ? format(new Date(job.publishDate), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/recruitment/candidate/${job.id}`}>View Details</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/recruitment/hr/jobs/${job.id}/edit`}>Edit Job</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">
                                                    Close Job
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div >
    )
}
