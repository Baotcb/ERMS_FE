'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    MapPin,
    DollarSign,
    Clock,
    Briefcase,
    Calendar,
    ArrowLeft,
    Share2,
    Heart,
    Building2,
    Users,
    CheckCircle2
} from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import { usePublicJob } from '../hooks/use-public-jobs'
import { JobApplyForm } from '@/features/candidate/components/job-apply-form'

interface PublicJobDetailProps {
    id: string
}

export function PublicJobDetail({ id }: PublicJobDetailProps) {
    const router = useRouter()
    const { toast } = useToast()
    const { data: job, isLoading, error } = usePublicJob(id)
    const [isApplyOpen, setIsApplyOpen] = useState(false)
    const [isSaved, setIsSaved] = useState(false)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="bg-white rounded-2xl p-8 space-y-8 animate-pulse">
                        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-32 bg-slate-200 rounded"></div>
                        <div className="h-64 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                        <Briefcase className="w-10 h-10 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy công việc</h1>
                    <p className="text-slate-500 max-w-md">Tin tuyển dụng này có thể đã bị xóa hoặc không tồn tại.</p>
                    <Button onClick={() => router.push('/jobs')} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại danh sách việc làm
                    </Button>
                </div>
            </div>
        )
    }

    const formatSalary = () => {
        if (!job.showSalary) return 'Thỏa thuận'
        if (job.salaryRangeMin && job.salaryRangeMax) {
            return `${(job.salaryRangeMin / 1000000).toLocaleString('vi-VN')} - ${(job.salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu VNĐ`
        }
        if (job.salaryRangeMin) return `Từ ${(job.salaryRangeMin / 1000000).toLocaleString('vi-VN')} triệu VNĐ`
        if (job.salaryRangeMax) return `Đến ${(job.salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu VNĐ`
        return 'Thỏa thuận'
    }

    const handleSaveJob = () => {
        setIsSaved(!isSaved)
        toast({
            title: isSaved ? 'Đã bỏ lưu tin tuyển dụng' : 'Đã lưu tin tuyển dụng',
            description: isSaved ? undefined : 'Bạn có thể xem lại trong mục "Việc làm đã lưu"'
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Sticky Header */}
            <div className="bg-white/95 backdrop-blur-sm border-b sticky top-0 z-20 shadow-sm">
                <div className="container mx-auto px-4 py-4 max-w-6xl flex justify-between items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-slate-600 hover:text-brand-primary hover:bg-brand-primary/5"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveJob}
                            className={isSaved ? 'border-red-200 text-red-600 hover:bg-red-50' : ''}
                        >
                            <Heart className={`mr-2 h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                            {isSaved ? 'Đã lưu' : 'Lưu tin'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                            navigator.clipboard.writeText(window.location.href)
                            toast({ title: 'Đã sao chép link' })
                        }}>
                            <Share2 className="mr-2 h-4 w-4" /> Chia sẻ
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Header Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        {job.isHot && (
                                            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-none shadow-lg shadow-red-200 animate-pulse">
                                                🔥 Tuyển gấp
                                            </Badge>
                                        )}
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                            {job.employmentType}
                                        </Badge>
                                        <span className="text-slate-400 text-sm flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {format(new Date(job.publishedAt || new Date()), 'dd/MM/yyyy')}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold text-slate-900 mb-2 leading-tight">{job.jobTitle}</h1>
                                    <p className="text-slate-500 flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        {job.enterpriseName}
                                    </p>
                                </div>
                            </div>

                            {/* Key Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <InfoCard
                                    icon={<DollarSign className="w-5 h-5" />}
                                    label="Mức lương"
                                    value={formatSalary()}
                                    iconBg="bg-green-50"
                                    iconColor="text-green-600"
                                />
                                <InfoCard
                                    icon={<MapPin className="w-5 h-5" />}
                                    label="Địa điểm"
                                    value={job.location || 'Hà Nội'}
                                    iconBg="bg-blue-50"
                                    iconColor="text-blue-600"
                                />
                                <InfoCard
                                    icon={<Briefcase className="w-5 h-5" />}
                                    label="Kinh nghiệm"
                                    value={job.experienceLevel || 'Không yêu cầu'}
                                    iconBg="bg-purple-50"
                                    iconColor="text-purple-600"
                                />
                                <InfoCard
                                    icon={<Calendar className="w-5 h-5" />}
                                    label="Hạn nộp hồ sơ"
                                    value={job.applicationDeadline ? format(new Date(job.applicationDeadline), 'dd/MM/yyyy') : 'Đang cập nhật'}
                                    iconBg="bg-orange-50"
                                    iconColor="text-orange-600"
                                />
                            </div>

                            {/* Apply Button */}
                            <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-[#00b14f] to-[#00d45a] hover:from-[#00a047] hover:to-[#00c252] text-white font-bold h-14 text-lg shadow-xl shadow-green-200 hover:shadow-2xl hover:shadow-green-300 transition-all hover:-translate-y-0.5"
                                    >
                                        <CheckCircle2 className="mr-2 h-5 w-5" />
                                        ỨNG TUYỂN NGAY
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl">Ứng tuyển: {job.jobTitle}</DialogTitle>
                                    </DialogHeader>
                                    <JobApplyForm
                                        jobId={job.id}
                                        jobTitle={job.jobTitle}
                                        onSuccess={() => setIsApplyOpen(false)}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Job Description */}
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-8">
                            <Section
                                title="Mô tả công việc"
                                content={job.description}
                            />

                            {job.requirements && (
                                <>
                                    <Separator />
                                    <Section
                                        title="Yêu cầu ứng viên"
                                        content={job.requirements}
                                    />
                                </>
                            )}

                            {job.benefits && (
                                <>
                                    <Separator />
                                    <Section
                                        title="Quyền lợi"
                                        content={job.benefits}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Company Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 sticky top-24 space-y-6">
                            <div className="flex items-center gap-4 pb-6 border-b">
                                <div className="w-20 h-20 relative border-2 border-slate-100 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm">
                                    <Image
                                        src={job.enterpriseLogoUrl || '/placeholder-logo.png'}
                                        alt={job.enterpriseName}
                                        fill
                                        className="object-contain p-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-slate-900 line-clamp-2 leading-tight">{job.enterpriseName}</h3>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-700">Địa chỉ</p>
                                        <p className="text-slate-600 mt-1">{job.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <Users className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" />
                                    <div>
                                        <p className="font-medium text-slate-700">Quy mô</p>
                                        <p className="text-slate-600 mt-1">100-499 nhân viên</p>
                                    </div>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full border-slate-200 hover:bg-slate-50 hover:border-brand-primary hover:text-brand-primary transition-all" asChild>
                                <Link href="#">Xem trang công ty</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper Components
function InfoCard({ icon, label, value, iconBg, iconColor }: {
    icon: React.ReactNode
    label: string
    value: string
    iconBg: string
    iconColor: string
}) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 hover:border-slate-200 transition-colors">
            <div className={`p-3 ${iconBg} rounded-xl ${iconColor} flex-shrink-0`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-1">{label}</p>
                <p className="font-semibold text-slate-900 truncate">{value}</p>
            </div>
        </div>
    )
}

function Section({ title, content }: { title: string; content: string }) {
    return (
        <div>
            <h3 className="text-xl font-bold border-l-4 border-[#00b14f] pl-4 mb-4 text-slate-900">
                {title}
            </h3>
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-line pl-4">
                {content}
            </div>
        </div>
    )
}
