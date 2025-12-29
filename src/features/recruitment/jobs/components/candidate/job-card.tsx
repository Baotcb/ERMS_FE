import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Clock, DollarSign, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Job, JobStatus } from "../../types"
import { format } from "date-fns"

interface JobCardProps {
    job: Job
}

export function JobCard({ job }: JobCardProps) {
    const isClosingSoon = new Date(job.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

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
        <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-indigo-600 flex flex-col h-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{job.departmentName}</span>
                        </div>
                    </div>
                    {/* Only show status badge if not OPEN (e.g. for preview) or if urgent */}
                    {job.status !== JobStatus.OPEN ? (
                        <Badge variant={getStatusVariant(job.status)} className="capitalize">
                            {job.status}
                        </Badge>
                    ) : isClosingSoon ? (
                        <Badge variant="destructive" className="text-[10px] px-2 py-0.5 h-6">
                            Urgent
                        </Badge>
                    ) : null}
                </div>
            </CardHeader>
            <CardContent className="pb-3 space-y-4 flex-1">
                <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                        <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-900">
                            {job.minSalary.toLocaleString()} - {job.maxSalary.toLocaleString()} {job.currency}
                        </span>
                    </div>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2">
                    {job.description}
                </p>

                <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
                    <Clock className="h-3 w-3" />
                    <span>Posted {format(new Date(job.createdAt), 'dd/MM/yyyy')}</span>
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button className="w-full bg-slate-900 hover:bg-indigo-600 text-white transition-colors" asChild>
                    <Link href={`/recruitment/candidate/${job.id}`}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
