'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    MapPin,
    DollarSign,
    Clock,
    Briefcase,
    ArrowLeft,
    Share2,
    Heart,
    Building2,
    Users,
    GraduationCap,
    CalendarDays,
    UserCheck,
    Globe,
    ChevronRight,
    Send,
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
import { useSavedJobsStore } from '../stores/use-saved-jobs-store'
import { JobApplyForm } from '@/features/candidate/components/job-apply-form'

interface PublicJobDetailProps {
    id: string
}

export function PublicJobDetail({ id }: PublicJobDetailProps) {
    const router = useRouter()
    const { toast } = useToast()
    const { data: job, isLoading, error } = usePublicJob(id)
    const [isApplyOpen, setIsApplyOpen] = useState(false)
    const [showStickyBar, setShowStickyBar] = useState(false)
    const headerRef = useRef<HTMLDivElement>(null)

    const { saveJob, removeJob, isSaved: checkIsSaved, fetchSavedJobIds, isLoaded: savedJobsLoaded } = useSavedJobsStore()

    useEffect(() => {
        if (!savedJobsLoaded) {
            fetchSavedJobIds()
        }
    }, [savedJobsLoaded, fetchSavedJobIds])

    const isSaved = job ? checkIsSaved(job.id) : false

    // Sticky apply bar on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setShowStickyBar(!entry.isIntersecting)
            },
            { threshold: 0 }
        )
        const currentRef = headerRef.current
        if (currentRef) {
            observer.observe(currentRef)
        }
        return () => {
            if (currentRef) observer.unobserve(currentRef)
        }
    }, [job])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f4f5f5]">
                <div className="container mx-auto px-4 max-w-6xl py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-lg p-6 border border-[#e8e8e8] animate-pulse">
                                <div className="h-7 bg-[#f4f5f5] rounded w-3/4 mb-4" />
                                <div className="h-5 bg-[#f4f5f5] rounded w-1/2 mb-6" />
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="h-[72px] bg-[#f4f5f5] rounded-lg" />
                                    <div className="h-[72px] bg-[#f4f5f5] rounded-lg" />
                                    <div className="h-[72px] bg-[#f4f5f5] rounded-lg" />
                                </div>
                                <div className="h-12 bg-[#f4f5f5] rounded-lg" />
                            </div>
                            <div className="bg-white rounded-lg p-6 border border-[#e8e8e8] animate-pulse space-y-4">
                                <div className="h-6 bg-[#f4f5f5] rounded w-1/3" />
                                <div className="h-4 bg-[#f4f5f5] rounded w-full" />
                                <div className="h-4 bg-[#f4f5f5] rounded w-5/6" />
                                <div className="h-4 bg-[#f4f5f5] rounded w-4/6" />
                                <div className="h-4 bg-[#f4f5f5] rounded w-full" />
                                <div className="h-4 bg-[#f4f5f5] rounded w-3/4" />
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg p-5 border border-[#e8e8e8] animate-pulse space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-16 bg-[#f4f5f5] rounded-lg" />
                                    <div className="h-5 bg-[#f4f5f5] rounded w-2/3" />
                                </div>
                                <div className="h-4 bg-[#f4f5f5] rounded w-full" />
                                <div className="h-4 bg-[#f4f5f5] rounded w-3/4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !job) {
        const isNotFound = !error && !job // API returned null (404) → job closed/removed
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f5f5]">
                <div className="text-center space-y-4 bg-white rounded-lg p-12 shadow-sm border border-[#e8e8e8]">
                    <div className="w-20 h-20 bg-[#f4f5f5] rounded-full flex items-center justify-center mx-auto">
                        <Briefcase className="w-10 h-10 text-[#a6acb2]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#212f3f]">
                        {isNotFound ? 'Tin tuyển dụng đã ngừng nhận hồ sơ' : 'Không thể tải tin tuyển dụng'}
                    </h1>
                    <p className="text-[#6f7882] max-w-md">
                        {isNotFound
                            ? 'Vị trí này đã đóng hoặc hết hạn ứng tuyển. Hãy khám phá các cơ hội khác!'
                            : 'Đã có lỗi xảy ra khi tải thông tin. Vui lòng thử lại sau.'}
                    </p>
                    <Button
                        onClick={() => router.push('/jobs')}
                        className="mt-4 bg-[#1B5583] hover:bg-[#154360] text-white font-medium rounded-lg h-10 shadow-none"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Xem các vị trí khác
                    </Button>
                </div>
            </div>
        )
    }

    const formatSalary = () => {
        if (!job.showSalary) return 'Thỏa thuận'
        if (job.salaryRangeMin && job.salaryRangeMax) {
            return `${(job.salaryRangeMin / 1000000).toLocaleString('vi-VN')} - ${(job.salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu`
        }
        if (job.salaryRangeMin) return `Từ ${(job.salaryRangeMin / 1000000).toLocaleString('vi-VN')} triệu`
        if (job.salaryRangeMax) return `Đến ${(job.salaryRangeMax / 1000000).toLocaleString('vi-VN')} triệu`
        return 'Thỏa thuận'
    }

    const handleSaveJob = () => {
        if (!job) return
        if (isSaved) {
            removeJob(job.id)
        } else {
            saveJob(job.id)
        }
        toast({
            title: isSaved ? 'Đã bỏ lưu tin tuyển dụng' : 'Đã lưu tin tuyển dụng',
            description: isSaved ? undefined : 'Bạn có thể xem lại trong mục "Việc làm đã lưu"'
        })
    }

    const deadlineText = job.applicationDeadline
        ? format(new Date(job.applicationDeadline), 'dd/MM/yyyy')
        : 'Đang cập nhật'

    const publishedText = job.publishedAt
        ? format(new Date(job.publishedAt), 'dd/MM/yyyy')
        : undefined

    return (
        <div className="min-h-screen bg-[#f4f5f5]">
            {/* Sticky Apply Bar - TopCV style */}
            <div
                className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e8e8e8] shadow-sm transition-transform duration-300 ${showStickyBar ? 'translate-y-0' : '-translate-y-full'
                    }`}
            >
                <div className="container mx-auto px-4 max-w-6xl h-[60px] flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-4">
                        <h2 className="text-sm font-bold text-[#212f3f] truncate">{job.jobTitle}</h2>
                        <p className="text-xs text-[#6f7882] truncate">{job.enterpriseName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSaveJob}
                            className={`h-9 rounded-lg border-[#e8e8e8] ${isSaved ? 'border-[#e74c3c] text-[#e74c3c]' : 'text-[#6f7882] hover:border-[#1B5583] hover:text-[#1B5583]'}`}
                        >
                            <Heart className={`h-4 w-4 mr-1.5 ${isSaved ? 'fill-[#e74c3c]' : ''}`} />
                            {isSaved ? 'Đã lưu' : 'Lưu'}
                        </Button>
                        <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="h-9 bg-[#1B5583] hover:bg-[#154360] text-white font-bold rounded-lg px-5 transition-colors shadow-none">
                                    <Send className="h-4 w-4 mr-1.5" />
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
                    </div>
                </div>
            </div>

            {/* Breadcrumb Bar */}
            <div className="bg-white border-b border-[#e8e8e8]">
                <div className="container mx-auto px-4 max-w-6xl py-3">
                    <nav className="flex items-center gap-1.5 text-sm text-[#6f7882]">
                        <Link href="/" className="hover:text-[#1B5583] transition-colors">Trang chủ</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-[#a6acb2]" />
                        <Link href="/jobs" className="hover:text-[#1B5583] transition-colors">Tìm việc làm</Link>
                        <ChevronRight className="w-3.5 h-3.5 text-[#a6acb2]" />
                        <span className="text-[#212f3f] font-medium truncate max-w-[300px]">{job.jobTitle}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ========== Main Content ========== */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Job Header Card */}
                        <div ref={headerRef} className="bg-white rounded-lg border border-[#e8e8e8] overflow-hidden">
                            <div className="p-6">
                                {/* Title & Badges */}
                                <div className="mb-5">
                                    <h1 className="text-[22px] font-bold text-[#212f3f] leading-tight mb-2">
                                        {job.jobTitle}
                                    </h1>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {job.isHot && (
                                            <Badge className="bg-[#e74c3c] text-white border-none text-[11px] font-bold rounded px-2 py-0.5">
                                                🔥 HOT
                                            </Badge>
                                        )}
                                        <span className="text-sm text-[#6f7882]">{job.enterpriseName}</span>
                                        {publishedText && (
                                            <span className="text-xs text-[#a6acb2]">• Đăng ngày {publishedText}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Key Info Row - 3 boxes TopCV style */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                                    <HighlightBox
                                        icon={<DollarSign className="w-6 h-6" />}
                                        label="Mức lương"
                                        value={formatSalary()}
                                        accentColor="#1B5583"
                                    />
                                    <HighlightBox
                                        icon={<MapPin className="w-6 h-6" />}
                                        label="Địa điểm"
                                        value={job.location || 'Hà Nội'}
                                        accentColor="#1B5583"
                                    />
                                    <HighlightBox
                                        icon={<Briefcase className="w-6 h-6" />}
                                        label="Kinh nghiệm"
                                        value={job.experienceLevel || 'Không yêu cầu'}
                                        accentColor="#1B5583"
                                    />
                                </div>

                                {/* Deadline bar */}
                                <div className="flex items-center gap-2 bg-[#FFF9E6] border border-[#FFE8A3] rounded-lg px-4 py-2.5 mb-5">
                                    <Clock className="w-4 h-4 text-[#E6A817] flex-shrink-0" />
                                    <span className="text-sm text-[#996B00]">
                                        Hạn nộp hồ sơ: <strong className="text-[#212f3f]">{deadlineText}</strong>
                                    </span>
                                </div>

                                {/* Action Buttons Row */}
                                <div className="flex gap-3">
                                    <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                size="lg"
                                                className="flex-1 bg-[#1B5583] hover:bg-[#154360] text-white font-bold h-[48px] text-[15px] rounded-lg transition-colors shadow-none"
                                            >
                                                <Send className="mr-2 h-5 w-5" />
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
                                        className={`h-[48px] px-5 rounded-lg font-medium transition-colors ${isSaved
                                            ? 'border-[#e74c3c] text-[#e74c3c] bg-[#fff5f0] hover:bg-[#ffe8e0]'
                                            : 'border-[#1B5583] text-[#1B5583] hover:bg-[#B5D5F5]/20'
                                            }`}
                                    >
                                        <Heart className={`mr-1.5 h-5 w-5 ${isSaved ? 'fill-[#e74c3c]' : ''}`} />
                                        {isSaved ? 'Đã lưu' : 'Lưu tin'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Job Description Card */}
                        <div className="bg-white rounded-lg border border-[#e8e8e8] p-6">
                            <h2 className="text-lg font-bold text-[#212f3f] mb-5 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#1B5583] rounded-full" />
                                Chi tiết tin tuyển dụng
                            </h2>

                            <div className="space-y-6">
                                {/* Mô tả */}
                                <DescriptionSection title="Mô tả công việc" content={job.description} />

                                {/* Yêu cầu */}
                                {job.requirements && (
                                    <DescriptionSection title="Yêu cầu ứng viên" content={job.requirements} />
                                )}

                                {/* Quyền lợi */}
                                {job.benefits && (
                                    <DescriptionSection title="Quyền lợi" content={job.benefits} />
                                )}
                            </div>

                            {/* Tags / Keywords */}
                            <div className="mt-6 pt-5 border-t border-[#e8e8e8]">
                                <p className="text-sm font-semibold text-[#212f3f] mb-3">Từ khóa liên quan</p>
                                <div className="flex flex-wrap gap-2">
                                    {[job.employmentType, job.location, job.departmentName, job.experienceLevel].filter(Boolean).map((tag, index) => (
                                        <span
                                            key={`tag-${index}`}
                                            className="px-3 py-1.5 bg-[#f4f5f5] text-[#6f7882] rounded-full text-xs font-medium hover:bg-[#1B5583] hover:text-white cursor-pointer transition-colors"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Share section */}
                            <div className="mt-5 pt-5 border-t border-[#e8e8e8] flex items-center gap-3">
                                <span className="text-sm text-[#6f7882]">Chia sẻ:</span>
                                <button
                                    className="p-2 rounded-full hover:bg-[#f4f5f5] text-[#6f7882] hover:text-[#1B5583] transition-colors"
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href)
                                        toast({ title: 'Đã sao chép link' })
                                    }}
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* General Info Card */}
                        <div className="bg-white rounded-lg border border-[#e8e8e8] p-6">
                            <h2 className="text-lg font-bold text-[#212f3f] mb-5 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#1B5583] rounded-full" />
                                Thông tin chung
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
                                <GeneralInfoItem
                                    icon={<UserCheck className="w-5 h-5" />}
                                    label="Cấp bậc"
                                    value={job.experienceLevel || 'Nhân viên'}
                                />
                                <GeneralInfoItem
                                    icon={<GraduationCap className="w-5 h-5" />}
                                    label="Học vấn"
                                    value={job.educationLevel || 'Không yêu cầu'}
                                />
                                <GeneralInfoItem
                                    icon={<Briefcase className="w-5 h-5" />}
                                    label="Hình thức"
                                    value={job.employmentType || 'Toàn thời gian'}
                                />
                                <GeneralInfoItem
                                    icon={<Users className="w-5 h-5" />}
                                    label="Số lượng"
                                    value={`${job.quantity || 1} người`}
                                />
                                <GeneralInfoItem
                                    icon={<Globe className="w-5 h-5" />}
                                    label="Làm việc"
                                    value={job.remoteOption === 'Remote' ? 'Từ xa' : job.remoteOption === 'Hybrid' ? 'Linh hoạt' : 'Tại văn phòng'}
                                />
                                <GeneralInfoItem
                                    icon={<CalendarDays className="w-5 h-5" />}
                                    label="Hạn nộp"
                                    value={deadlineText}
                                />
                            </div>
                        </div>
                    </div>

                    {/* ========== Sidebar ========== */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Company Card */}
                        <div className="bg-white rounded-lg border border-[#e8e8e8] overflow-hidden">
                            {/* Company Header */}
                            <div className="p-5 text-center border-b border-[#e8e8e8]">
                                <div className="w-[80px] h-[80px] mx-auto mb-3 border border-[#e8e8e8] rounded-lg bg-white relative overflow-hidden">
                                    <Image
                                        src={job.enterpriseLogoUrl || '/placeholder-logo.png'}
                                        alt={job.enterpriseName}
                                        fill
                                        sizes="80px"
                                        className="object-contain p-1"
                                    />
                                </div>
                                <h3 className="font-bold text-[15px] text-[#212f3f] leading-tight line-clamp-2">
                                    {job.enterpriseName}
                                </h3>
                            </div>

                            {/* Company Details */}
                            <div className="p-5 space-y-4">
                                <SidebarInfoRow
                                    icon={<Users className="w-[18px] h-[18px]" />}
                                    label="Quy mô"
                                    value="100-499 nhân viên"
                                />
                                <SidebarInfoRow
                                    icon={<Building2 className="w-[18px] h-[18px]" />}
                                    label="Lĩnh vực"
                                    value={job.departmentName || 'Đang cập nhật'}
                                />
                                <SidebarInfoRow
                                    icon={<MapPin className="w-[18px] h-[18px]" />}
                                    label="Địa chỉ"
                                    value={job.location || 'Đang cập nhật'}
                                />
                            </div>

                            {/* View Company Button */}
                            <div className="px-5 pb-5">
                                <Button
                                    variant="outline"
                                    className="w-full border-[#1B5583] text-[#1B5583] hover:bg-[#1B5583] hover:text-white rounded-lg h-10 font-medium transition-colors text-sm"
                                    asChild
                                >
                                    <Link href={`/companies/${encodeURIComponent(job.enterpriseName)}`}>
                                        Xem trang công ty
                                        <ChevronRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* General Info Sidebar Card */}
                        <div className="bg-white rounded-lg border border-[#e8e8e8] p-5">
                            <h4 className="font-bold text-sm text-[#212f3f] mb-4">Thông tin chung</h4>
                            <div className="space-y-3.5">
                                <SidebarInfoRow
                                    icon={<DollarSign className="w-[18px] h-[18px]" />}
                                    label="Mức lương"
                                    value={formatSalary()}
                                    highlight
                                />
                                <SidebarInfoRow
                                    icon={<Briefcase className="w-[18px] h-[18px]" />}
                                    label="Kinh nghiệm"
                                    value={job.experienceLevel || 'Không yêu cầu'}
                                />
                                <SidebarInfoRow
                                    icon={<GraduationCap className="w-[18px] h-[18px]" />}
                                    label="Học vấn"
                                    value={job.educationLevel || 'Không yêu cầu'}
                                />
                                <SidebarInfoRow
                                    icon={<Users className="w-[18px] h-[18px]" />}
                                    label="Số lượng"
                                    value={`${job.quantity || 1} người`}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/* =========================================
   Helper Components - TopCV Style
   ========================================= */

/** Highlight box for salary/location/experience in header */
function HighlightBox({ icon, label, value, accentColor }: {
    icon: React.ReactNode
    label: string
    value: string
    accentColor: string
}) {
    return (
        <div className="flex items-center gap-3 bg-[#f4f5f5] rounded-lg px-4 py-3">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
            >
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#a6acb2] leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-[#212f3f] truncate">{value}</p>
            </div>
        </div>
    )
}

/** Description section block with green left border */
function DescriptionSection({ title, content }: { title: string; content: string }) {
    return (
        <div>
            <h3
                className="text-[15px] font-bold text-[#212f3f] mb-3 pl-3 relative"
                style={{ borderLeft: '3px solid #1B5583' }}
            >
                {title}
            </h3>
            <div className="text-sm text-[#4a4a4a] leading-[1.8] whitespace-pre-line">
                {content}
            </div>
        </div>
    )
}

/** General Info item with icon circle */
function GeneralInfoItem({ icon, label, value }: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#B5D5F5]/20 text-[#1B5583] flex items-center justify-center flex-shrink-0 mt-0.5">
                {icon}
            </div>
            <div>
                <p className="text-xs text-[#a6acb2] mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-[#212f3f]">{value}</p>
            </div>
        </div>
    )
}

/** Sidebar info row */
function SidebarInfoRow({ icon, label, value, highlight = false }: {
    icon: React.ReactNode
    label: string
    value: string
    highlight?: boolean
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#f4f5f5] text-[#6f7882] flex items-center justify-center flex-shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[12px] text-[#a6acb2] leading-none mb-1">{label}</p>
                <p className={`text-sm font-medium truncate ${highlight ? 'text-[#1B5583] font-bold' : 'text-[#212f3f]'}`}>
                    {value}
                </p>
            </div>
        </div>
    )
}
