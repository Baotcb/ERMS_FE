import {
    Dialog,
    DialogContent,
    DialogTitle,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ApplicationDto } from '../../types/application-types'
import { AIScoreBadge } from './ai-score-badge'
import { StageBadge } from './stage-badge'
import { Calendar, Download, Mail, Phone, CheckCircle, AlertTriangle, XCircle, FileText, Send } from 'lucide-react'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ApplicationDetailModalProps {
    application: ApplicationDto | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onForward: (application: ApplicationDto) => void
    onReject?: (application: ApplicationDto) => void
}

export function ApplicationDetailModal({
    application,
    open,
    onOpenChange,
    onForward,
    onReject
}: ApplicationDetailModalProps) {
    if (!application) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-xl border-none shadow-2xl">
                <VisuallyHidden>
                    <DialogTitle>Chi tiết ứng viên: {application.candidateName}</DialogTitle>
                </VisuallyHidden>
                {/* Header */}
                <div className="bg-slate-900 text-white px-8 py-6 flex-shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <FileText className="w-64 h-64 transform rotate-12" />
                    </div>

                    <div className="relative z-10 flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            <Avatar className="h-20 w-20 border-4 border-white/10 shadow-xl">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(application.candidateName)}&background=random`} />
                                <AvatarFallback className="text-slate-900 font-bold text-xl">{application.candidateName.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-bold tracking-tight">{application.candidateName}</h2>
                                    <StageBadge stage={application.stage} />
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-300 text-sm mt-2">
                                    <span className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-slate-400" /> {application.candidateEmail}
                                    </span>
                                    {application.candidatePhone && (
                                        <span className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-slate-400" /> {application.candidatePhone}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" /> Ứng tuyển: {format(new Date(application.appliedAt), 'dd/MM/yyyy')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {application.cvScreeningResult && (
                            <div className="flex flex-col items-end bg-white/5 p-4 rounded-lg backdrop-blur-sm border border-white/10">
                                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">AI Match Score</span>
                                <AIScoreBadge score={application.cvScreeningResult.overallScore} />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex-1 bg-slate-50 overflow-hidden flex flex-col lg:flex-row">
                    {/* Main Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
                        {/* Summary Section */}
                        {application.cvScreeningResult ? (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-800">Đánh giá tổng quan từ AI</h3>
                                </div>

                                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
                                    <p className="text-slate-600 leading-relaxed text-base">
                                        {application.cvScreeningResult.summary}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-green-50/50 p-4 rounded-lg border border-green-100">
                                            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4" /> Điểm mạnh
                                            </h4>
                                            <ul className="space-y-2">
                                                {(application.cvScreeningResult.strengths ?? []).map((item) => (
                                                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {(application.cvScreeningResult.concerns ?? []).length > 0 && (
                                            <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                                                <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-4 h-4" /> Cần lưu ý
                                                </h4>
                                                <ul className="space-y-2">
                                                    {(application.cvScreeningResult.concerns ?? []).map((item) => (
                                                        <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Skills Analysis */}
                                    <div className="pt-4 border-t border-slate-50">
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Kỹ năng chuyên môn</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(application.cvScreeningResult.matchedSkills ?? []).map(skill => (
                                                    <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                                {(application.cvScreeningResult.missingSkills ?? []).map(skill => (
                                                    <Badge key={skill} variant="outline" className="border-red-200 text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 opacity-75">
                                                        Thiếu: {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 animate-pulse">
                                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                    <LoaderIcon className="w-6 h-6 animate-spin" />
                                </div>
                                Đang phân tích hồ sơ...
                            </div>
                        )}

                        {/* Additional Info Section */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800">Tài liệu đính kèm</h3>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-brand-primary/20 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 bg-red-50 rounded flex items-center justify-center text-red-500 group-hover:scale-105 transition-transform">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-slate-900">CV_{application.candidateName.replace(/\s+/g, '_')}.pdf</h4>
                                        <p className="text-sm text-slate-500">Đã tải lên {format(new Date(application.appliedAt), 'HH:mm dd/MM/yyyy')}</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="group-hover:bg-brand-primary group-hover:text-white group-hover:border-brand-primary transition-all" asChild>
                                    <a href={application.cvUrl} target="_blank" rel="noopener noreferrer">
                                        <Download className="w-4 h-4 mr-2" /> Tải xuống
                                    </a>
                                </Button>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar - Actions & Metrics */}
                    <div className="w-full lg:w-[320px] border-l bg-white p-6 flex flex-col gap-6 overflow-y-auto">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Chi tiết điểm số</h3>
                            {application.cvScreeningResult && (
                                <div className="space-y-4">
                                    <ScoreItem label="Kinh nghiệm" score={application.cvScreeningResult.experienceMatchScore} />
                                    <ScoreItem label="Kỹ năng" score={application.cvScreeningResult.skillMatchScore} />
                                    <ScoreItem label="Học vấn" score={application.cvScreeningResult.educationMatchScore} />
                                    <ScoreItem label="Từ khóa" score={application.cvScreeningResult.keywordMatchScore} />
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ghi chú HR</h3>
                            <div className="bg-yellow-50/50 p-4 rounded-lg border border-yellow-100 text-sm italic text-slate-600 min-h-[100px]">
                                {application.hrNote || "Chưa có ghi chú nào..."}
                            </div>
                        </div>

                        <div className="mt-auto space-y-3 pt-6">
                            {(application.stage === 'Applied' || application.stage === 'Reviewing') ? (
                                <>
                                    <Button onClick={() => onForward(application)} className="w-full bg-brand-primary hover:bg-brand-primary/90 h-10 shadow-lg shadow-brand-primary/20 transition-all hover:-translate-y-0.5">
                                        <Send className="w-4 h-4 mr-2" /> Chuyển tiếp (Shortlist)
                                    </Button>
                                    <Button variant="outline" onClick={() => onReject?.(application)} className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300">
                                        <XCircle className="w-4 h-4 mr-2" /> Từ chối hồ sơ
                                    </Button>
                                </>
                            ) : (
                                <div className="p-4 bg-slate-100 rounded text-center text-sm text-slate-500">
                                    Hồ sơ đang ở trạng thái <strong>{application.stage}</strong>. Không thể thay đổi.
                                </div>
                            )}
                            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full">
                                Đóng
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

function ScoreItem({ label, score }: { label: string; score?: number }) {
    if (score == null) return null;
    const percentage = Math.round(score);
    const getColor = (p: number) => {
        if (p >= 80) return "bg-green-500";
        if (p >= 50) return "bg-yellow-500";
        return "bg-red-500";
    };

    return (
        <div>
            <div className="flex justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-600">{label}</span>
                <span className="text-xs font-bold text-slate-900">{percentage}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}

function LoaderIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}
