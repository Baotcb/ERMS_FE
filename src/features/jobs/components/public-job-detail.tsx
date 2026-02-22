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
            <div className="min-h-screen bg-[#f4f5f5]">
                <div className="container mx-auto px-4 max-w-6xl py-6">
                    <div className="space-y-4">
                        <div className="bg-white rounded-lg p-6 animate-pulse">
                            <div className="h-8 bg-[#f4f5f5] rounded w-2/3 mb-4" />
                            <div className="h-4 bg-[#f4f5f5] rounded w-1/3 mb-6" />
                            <div className="grid grid-cols-3 gap-4">
                                <div className="h-16 bg-[#f4f5f5] rounded" />
                                <div className="h-16 bg-[#f4f5f5] rounded" />
                                <div className="h-16 bg-[#f4f5f5] rounded" />
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-6 animate-pulse">
                            <div className="h-64 bg-[#f4f5f5] rounded" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !job) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f5f5]">
                <div className="text-center space-y-4 bg-white rounded-lg p-12 shadow-sm border border-[#e8e8e8]">
                    <div className="w-20 h-20 bg-[#f4f5f5] rounded-full flex items-center justify-center mx-auto">
                        <Briefcase className="w-10 h-10 text-[#a6acb2]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#212f3f]">Không tìm thấy công việc</h1>
                    <p className="text-[#6f7882] max-w-md">Tin tuyển dụng này có thể đã bị xóa hoặc không tồn tại.</p>
                    <Button
                        onClick={() => router.push('/jobs')}
                        className="mt-4 bg-[#00b14f] hover:bg-[#009643] text-white"
                    >
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
        <div className="min-h-screen bg-[#f4f5f5]">
            {/* Breadcrumb Bar */}
            <div className="bg-white border-b border-[#e8e8e8]">
                <div className="container mx-auto px-4 max-w-6xl py-3">
                    <div className="flex items-center gap-2 text-sm text-[#6f7882]">
                        <Link href="/jobs" className="hover:text-[#00b14f] transition-colors">
                            Trang chủ
                        </Link>
                        <span>/</span>
                        <Link href="/jobs" className="hover:text-[#00b14f] transition-colors">
                            Việc làm
                        </Link>
                        <span>/</span>
                        <span className="text-[#212f3f] font-medium truncate max-w-[300px]">
                            {job.jobTitle}
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Job Header Card */}
                        <div className="bg-white rounded-lg p-6 border border-[#e8e8e8]">
                            {/* Title & Badges */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    {job.isHot && (
                                        <Badge className="bg-[#e74c3c] text-white border-none text-[11px] font-bold rounded">
                                            🔥 Tuyển gấp
                                        </Badge>
                                    )}
                                    <Badge className="bg-[#f4f5f5] text-[#6f7882] border-none text-[11px] font-medium rounded">
                                        {job.employmentType}
                                    </Badge>
                                </div>
                                <h1 className="text-2xl font-bold text-[#212f3f] leading-tight">
                                    {job.jobTitle}
                                </h1>
                            </div>

                            {/* Key Info Row - TopCV Style */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <InfoCard
                                    icon={<DollarSign className="w-6 h-6" />}
                                    label="Mức lương"
                                    value={formatSalary()}
                                    iconBg="bg-[#f0faf4]"
                                    iconColor="text-[#00b14f]"
                                />
                                <InfoCard
                                    icon={<MapPin className="w-6 h-6" />}
                                    label="Địa điểm"
                                    value={job.location || 'Hà Nội'}
                                    iconBg="bg-[#fff5f0]"
                                    iconColor="text-[#e74c3c]"
                                />
                                <InfoCard
                                    icon={<Briefcase className="w-6 h-6" />}
                                    label="Kinh nghiệm"
                                    value={job.experienceLevel || 'Không yêu cầu'}
                                    iconBg="bg-[#f0f4ff]"
                                    iconColor="text-[#3b7ddd]"
                                />
                            </div>

                            {/* Deadline */}
                            <div className="flex items-center gap-2 text-sm text-[#6f7882] mb-6 bg-[#f4f5f5] rounded-lg px-4 py-3">
                                <Clock className="w-4 h-4 text-[#a6acb2]" />
                                <span>Hạn nộp hồ sơ: </span>
                                <span className="font-semibold text-[#212f3f]">
                                    {job.applicationDeadline
                                        ? format(new Date(job.applicationDeadline), 'dd/MM/yyyy')
                                        : 'Đang cập nhật'}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            size="lg"
                                            className="flex-1 bg-[#00b14f] hover:bg-[#009643] text-white font-bold h-12 text-base rounded-lg transition-colors"
                                        >
                                            <CheckCircle2 className="mr-2 h-5 w-5" />
                                            Ứng tuyển ngay
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

                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handleSaveJob}
                                    className={`h-12 px-6 rounded-lg border-[#e8e8e8] font-medium transition-colors ${isSaved
                                            ? 'border-[#e74c3c] text-[#e74c3c] bg-[#fff5f0]'
                                            : 'text-[#6f7882] hover:border-[#00b14f] hover:text-[#00b14f]'
                                        }`}
                                >
                                    <Heart className={`mr-2 h-4 w-4 ${isSaved ? 'fill-[#e74c3c]' : ''}`} />
                                    {isSaved ? 'Đã lưu' : 'Lưu tin'}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="h-12 px-6 rounded-lg border-[#e8e8e8] text-[#6f7882] hover:border-[#00b14f] hover:text-[#00b14f] font-medium transition-colors"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href)
                                        toast({ title: 'Đã sao chép link' })
                                    }}
                                >
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Chia sẻ
                                </Button>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="bg-white rounded-lg p-6 border border-[#e8e8e8] space-y-6">
                            <Section
                                title="Chi tiết tin tuyển dụng"
                                titleIcon="📋"
                            >
                                <SectionBlock title="Mô tả công việc" content={job.description} />

                                {job.requirements && (
                                    <SectionBlock title="Yêu cầu ứng viên" content={job.requirements} />
                                )}

                                {job.benefits && (
                                    <SectionBlock title="Quyền lợi" content={job.benefits} />
                                )}
                            </Section>

                            {/* Additional Info */}
                            <div className="border-t border-[#e8e8e8] pt-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <DetailItem
                                        label="Hình thức"
                                        value={job.employmentType}
                                    />
                                    <DetailItem
                                        label="Cấp bậc"
                                        value={job.experienceLevel || 'Không yêu cầu'}
                                    />
                                    <DetailItem
                                        label="Học vấn"
                                        value={job.educationLevel || 'Không yêu cầu'}
                                    />
                                    <DetailItem
                                        label="Số lượng"
                                        value={`${job.quantity} người`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Company Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-[#e8e8e8] sticky top-24 overflow-hidden">
                            {/* Company Header */}
                            <div className="p-5 border-b border-[#e8e8e8]">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 relative border border-[#e8e8e8] rounded-lg overflow-hidden flex-shrink-0 bg-white p-1">
                                        <Image
                                            src={job.enterpriseLogoUrl || '/placeholder-logo.png'}
                                            alt={job.enterpriseName}
                                            fill
                                            className="object-contain p-1"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[15px] text-[#212f3f] line-clamp-2 leading-tight">
                                            {job.enterpriseName}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Company Details */}
                            <div className="p-5 space-y-4">
                                <CompanyInfoRow
                                    icon={<Users className="w-5 h-5 text-[#a6acb2]" />}
                                    label="Quy mô"
                                    value="100-499 nhân viên"
                                />
                                <CompanyInfoRow
                                    icon={<MapPin className="w-5 h-5 text-[#a6acb2]" />}
                                    label="Địa chỉ"
                                    value={job.location || 'Đang cập nhật'}
                                />
                                <CompanyInfoRow
                                    icon={<Building2 className="w-5 h-5 text-[#a6acb2]" />}
                                    label="Phòng ban"
                                    value={job.departmentName}
                                />
                            </div>

                            {/* View More */}
                            <div className="p-5 border-t border-[#e8e8e8]">
                                <Button
                                    variant="outline"
                                    className="w-full border-[#00b14f] text-[#00b14f] hover:bg-[#00b14f] hover:text-white rounded-lg h-10 font-medium transition-colors"
                                    asChild
                                >
                                    <Link href="#">Xem trang công ty</Link>
                                </Button>
                            </div>
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
        <div className="flex items-center gap-3">
            <div className={`p-3 ${iconBg} rounded-lg ${iconColor} flex-shrink-0`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-[#a6acb2] mb-0.5">{label}</p>
                <p className="font-semibold text-[#212f3f] text-sm truncate">{value}</p>
            </div>
        </div>
    )
}

function Section({ title, titleIcon, children }: {
    title: string
    titleIcon: string
    children: React.ReactNode
}) {
    return (
        <div>
            <h2 className="text-lg font-bold text-[#212f3f] mb-4 flex items-center gap-2">
                <span>{titleIcon}</span>
                {title}
            </h2>
            <div className="space-y-5">
                {children}
            </div>
        </div>
    )
}

function SectionBlock({ title, content }: { title: string; content: string }) {
    return (
        <div>
            <h3 className="text-[15px] font-bold text-[#212f3f] mb-3 pl-3 border-l-3 border-l-[#00b14f]" style={{ borderLeftWidth: '3px' }}>
                {title}
            </h3>
            <div className="text-sm text-[#4a4a4a] leading-relaxed whitespace-pre-line pl-3">
                {content}
            </div>
        </div>
    )
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="text-center p-3 bg-[#f4f5f5] rounded-lg">
            <p className="text-[11px] text-[#a6acb2] mb-1 uppercase font-medium tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-[#212f3f]">{value}</p>
        </div>
    )
}

function CompanyInfoRow({ icon, label, value }: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 flex-shrink-0">{icon}</div>
            <div>
                <p className="text-[13px] text-[#a6acb2] mb-0.5">{label}</p>
                <p className="text-sm text-[#212f3f] font-medium">{value}</p>
            </div>
        </div>
    )
}
