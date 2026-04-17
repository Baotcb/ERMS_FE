import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Send, Download, XCircle, Star, User, CalendarCheck } from 'lucide-react'
import { format } from 'date-fns'
import { ApplicationDto } from '../../types/application-types'
import { StageBadge } from './stage-badge'
import { AIScoreBadge } from './ai-score-badge'
import { ApplicationDetailModal } from './application-detail-modal'
import { ForwardApplicationDialog } from './forward-application-dialog'
import { ConfirmScheduleDialog } from '../interview/confirm-schedule-dialog'
import { RejectApplicationDialog } from './reject-application-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface ApplicationTableProps {
    applications: ApplicationDto[]
    isLoading: boolean
    onRefresh: () => void
}

export function ApplicationTable({ applications, isLoading, onRefresh }: ApplicationTableProps) {
    const [selectedApp, setSelectedApp] = useState<ApplicationDto | null>(null)
    const [detailOpen, setDetailOpen] = useState(false)
    const [forwardOpen, setForwardOpen] = useState(false)
    const [scheduleOpen, setScheduleOpen] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [selectedAppForReject, setSelectedAppForReject] = useState<ApplicationDto | null>(null)

    const handleViewDetail = (app: ApplicationDto) => {
        setSelectedApp(app)
        setDetailOpen(true)
    }

    const handleForward = (app: ApplicationDto) => {
        setSelectedApp(app)
        setForwardOpen(true)
    }

    const handleSchedule = (app: ApplicationDto) => {
        setSelectedApp(app)
        setScheduleOpen(true)
    }

    const handleReject = (app: ApplicationDto) => {
        setSelectedAppForReject(app)
        setRejectDialogOpen(true)
    }

    if (isLoading) {
        return <ApplicationTableSkeleton />
    }

    return (
        <>
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/75">
                        <TableRow>
                            <TableHead className="w-[300px] font-semibold text-slate-700">Ứng viên</TableHead>
                            <TableHead className="font-semibold text-slate-700">Trạng thái</TableHead>
                            <TableHead className="font-semibold text-slate-700">AI Match</TableHead>
                            <TableHead className="font-semibold text-slate-700">Ngày nộp</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="font-medium text-slate-600">Không tìm thấy ứng viên nào.</p>
                                        <p className="text-sm">Vui lòng thử lại với bộ lọc khác.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-slate-200">
                                                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(app.candidateName)}&background=random`} />
                                                <AvatarFallback>{app.candidateName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-medium text-slate-900 line-clamp-1">{app.candidateName}</span>
                                                    {app.isExternal && (
                                                        <Badge variant="outline" className="text-xs border-orange-200 text-orange-600 bg-orange-50 px-1.5 py-0">
                                                            CV Độc lập
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-500 line-clamp-1">
                                                    {app.candidateEmail?.includes('@placeholder.local') ? 'Chưa có email' : app.candidateEmail}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StageBadge stage={app.stage} />
                                    </TableCell>
                                    <TableCell>
                                        {app.cvScreeningResult ? (
                                            <div className="flex items-center gap-2">
                                                <AIScoreBadge score={app.cvScreeningResult.overallScore} />
                                                {app.cvScreeningResult.overallScore >= 80 && (
                                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse" />
                                                )}
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                Đang chấm điểm
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-slate-600 font-mono text-xs">
                                        {format(new Date(app.appliedAt), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200 rounded-full">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel className="text-xs text-slate-500 uppercase tracking-wider">Thao tác</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleViewDetail(app)} className="cursor-pointer">
                                                    <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild className="cursor-pointer">
                                                    <a href={app.cvUrl} target="_blank" rel="noopener noreferrer">
                                                        <Download className="mr-2 h-4 w-4" /> Tải CV
                                                    </a>
                                                </DropdownMenuItem>

                                                {(app.stage === 'Applied' || app.stage === 'Reviewing' || app.stage === 'Shortlisted') && (
                                                    <DropdownMenuSeparator />
                                                )}
                                                {(app.stage === 'Applied' || app.stage === 'Reviewing') && (
                                                    <DropdownMenuItem onClick={() => handleForward(app)} className="cursor-pointer text-brand-primary focus:text-brand-primary focus:bg-brand-primary/10">
                                                        <Send className="mr-2 h-4 w-4" /> Chuyển tiếp (Shortlist)
                                                    </DropdownMenuItem>
                                                )}
                                                {app.stage === 'Shortlisted' && (
                                                    <DropdownMenuItem onClick={() => handleSchedule(app)} className="cursor-pointer text-[#0F4C75] focus:text-[#0F4C75] focus:bg-[#BBE1FA]/10">
                                                        <CalendarCheck className="mr-2 h-4 w-4" /> Xác nhận lịch PV
                                                    </DropdownMenuItem>
                                                )}
                                                {(app.stage === 'Applied' || app.stage === 'Reviewing' || app.stage === 'Shortlisted') && (
                                                    <DropdownMenuItem onClick={() => handleReject(app)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                                        <XCircle className="mr-2 h-4 w-4" /> Từ chối
                                                    </DropdownMenuItem>
                                                )}


                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ApplicationDetailModal
                open={detailOpen}
                onOpenChange={setDetailOpen}
                application={selectedApp}
                onForward={(app) => {
                    setDetailOpen(false)
                    handleForward(app)
                }}
                onReject={(app) => {
                    setDetailOpen(false)
                    handleReject(app)
                }}
            />

            {selectedApp && (
                <ForwardApplicationDialog
                    open={forwardOpen}
                    onOpenChange={setForwardOpen}
                    applicationId={selectedApp.id}
                    candidateName={selectedApp.candidateName}
                    onSuccess={onRefresh}
                />
            )}

            {selectedApp && (
                <ConfirmScheduleDialog
                    open={scheduleOpen}
                    onOpenChange={setScheduleOpen}
                    applicationId={selectedApp.id}
                    candidateName={selectedApp.candidateName}
                    candidateEmail={selectedApp.candidateEmail}
                    isExternal={selectedApp.isExternal}
                    onSuccess={onRefresh}
                />
            )}

            {selectedAppForReject && (
                <RejectApplicationDialog
                    open={rejectDialogOpen}
                    onOpenChange={setRejectDialogOpen}
                    applicationId={selectedAppForReject.id}
                    candidateName={selectedAppForReject.candidateName}
                    onSuccess={() => {
                        setSelectedAppForReject(null)
                        onRefresh()
                    }}
                />
            )}


        </>
    )
}

function ApplicationTableSkeleton() {
    return (
        <div className="space-y-3 p-4 border rounded-xl bg-white shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
                <div className="h-10 w-full bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
                        <div className="h-16 w-full bg-slate-50 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        </div>
    )
}
