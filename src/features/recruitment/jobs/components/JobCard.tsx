import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Briefcase, MapPin, MoreHorizontal, Users, Clock, DollarSign, Building } from "lucide-react"
import Link from "next/link"
import { JobPosting, JobStatus } from "../types"

interface JobCardProps {
    job: JobPosting
}

export function JobCard({ job }: JobCardProps) {
    const getStatusVariant = (status: JobStatus) => {
        switch (status) {
            case JobStatus.PUBLISHED: return "default" // Green-ish usually
            case JobStatus.DRAFT: return "secondary"
            case JobStatus.CLOSED: return "destructive"
            case JobStatus.ARCHIVED: return "outline"
            default: return "default"
        }
    }

    const { salary } = job
    const salaryText = salary?.isVisible
        ? `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} ${salary.currency}`
        : "Negotiable"

    return (
        <Card className="group hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Building className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold leading-none tracking-tight group-hover:text-primary transition-colors">
                            {job.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {job.departmentName}
                        </p>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/recruitment/jobs/${job.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/recruitment/jobs/${job.id}/edit`}>Edit Job</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Close Job</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                        <Clock className="h-3 w-3" />
                        {job.employmentType.replace("_", " ")}
                    </div>
                    <div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-md">
                        <DollarSign className="h-3 w-3" />
                        {salaryText}
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap--1">
                        <div className="flex -space-x-2 overflow-hidden">
                            {[...Array(Math.min(3, job.applicantsCount))].map((_, i) => (
                                <Avatar key={i} className="inline-block h-6 w-6 ring-2 ring-background">
                                    <AvatarFallback className="text-[10px] bg-muted">U</AvatarFallback>
                                </Avatar>
                            ))}
                            {job.applicantsCount > 3 && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted ring-2 ring-background text-[10px] font-medium">
                                    +{job.applicantsCount - 3}
                                </div>
                            )}
                        </div>
                        <span className="ml-2 text-xs text-muted-foreground">
                            {job.applicantsCount} applicants
                        </span>
                    </div>
                    <Badge variant={getStatusVariant(job.status)} className="capitalize">
                        {job.status.toLowerCase()}
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button variant="outline" className="w-full text-xs h-8" asChild>
                    <Link href={`/recruitment/jobs/${job.id}`}>Manage Application</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
