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
    Heart
} from 'lucide-react'
import { format } from 'date-fns'
// import { vi } from 'date-fns/locale'

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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="bg-white rounded-xl p-8 space-y-8 animate-pulse">
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
                <h1 className="text-2xl font-bold text-slate-800">Không tìm thấy công việc</h1>
                <p className="text-slate-500 mt-2 mb-6">Tin tuyển dụng này có thể đã bị xóa hoặc không tồn tại.</p>
                <Button onClick={() => router.push('/jobs')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại danh sách
                </Button>
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

    return (
        <div className="min-h-screen bg-[#F7F9FC] pb-12">
            {/* Header/Breadcrumb */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 max-w-6xl flex justify-between items-center">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-slate-500 hover:text-brand-primary">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => toast({ title: 'Đã lưu tin tuyển dụng' })}>
                            <Heart className="mr-2 h-4 w-4" /> Lưu tin
                        </Button>
                        <Button variant="outline" size="sm">
                            <Share2 className="mr-2 h-4 w-4" /> Chia sẻ
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Job Header Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">{job.jobTitle}</h1>
                        <div className="flex items-center gap-2 mb-6">
                            <Badge variant={job.isHot ? "destructive" : "secondary"}>
                                {job.isHot ? "Tuyển gấp" : job.employmentType}
                            </Badge>
                            <span className="text-slate-400 text-sm flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Đăng ngày {format(new Date(job.publishedAt || new Date()), 'dd/MM/yyyy')}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-full text-[#00b14f]">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Mức lương</p>
                                    <p className="font-semibold text-slate-900">{formatSalary()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-full text-[#0F4C75]">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Địa điểm</p>
                                    <p className="font-semibold text-slate-900">{job.location || 'Hà Nội'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Kinh nghiệm</p>
                                    <p className="font-semibold text-slate-900">{job.experienceLevel || 'Không yêu cầu'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-full text-orange-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Hạn nộp</p>
                                    <p className="font-semibold text-slate-900">
                                        {job.applicationDeadline
                                            ? format(new Date(job.applicationDeadline), 'dd/MM/yyyy')
                                            : '30/06/2026'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="w-full bg-[#00b14f] hover:bg-[#00b14f]/90 text-white font-bold h-12 text-lg shadow-lg shadow-green-200">
                                    ỨNG TUYỂN NGAY
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Ứng tuyển: {job.jobTitle}</DialogTitle>
                                </DialogHeader>
                                <JobApplyForm
                                    jobId={job.id}
                                    jobTitle={job.jobTitle}
                                    onSuccess={() => setIsApplyOpen(false)}
                                />
                                {/* <div className="p-4 text-center">
                                    Tính năng nộp hồ sơ đang được cập nhật...
                                </div> */}
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Job Description */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold border-l-4 border-[#00b14f] pl-3 mb-4">Mô tả công việc</h3>
                            <div className="prose max-w-none text-slate-600 space-y-2 whitespace-pre-line">
                                {job.description}
                            </div>
                        </div>

                        {job.requirements && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-lg font-bold border-l-4 border-[#00b14f] pl-3 mb-4">Yêu cầu ứng viên</h3>
                                    <div className="prose max-w-none text-slate-600 space-y-2 whitespace-pre-line">
                                        {job.requirements}
                                    </div>
                                </div>
                            </>
                        )}

                        {job.benefits && (
                            <>
                                <Separator />
                                <div>
                                    <h3 className="text-lg font-bold border-l-4 border-[#00b14f] pl-3 mb-4">Quyền lợi</h3>
                                    <div className="prose max-w-none text-slate-600 space-y-2 whitespace-pre-line">
                                        {job.benefits}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Sidebar - Company Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 sticky top-24">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 relative border rounded-lg overflow-hidden flex-shrink-0 bg-white">
                                <Image
                                    src={job.enterpriseLogoUrl || '/placeholder-logo.png'}
                                    alt={job.enterpriseName}
                                    fill
                                    className="object-contain p-2"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 line-clamp-2">{job.enterpriseName}</h3>
                            </div>
                        </div>

                        {/* More company info logic here if available in API */}
                        <div className="space-y-3 mt-6">
                            <div className="flex items-start gap-3 text-sm text-slate-600">
                                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                                <span>{job.location}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-slate-600">
                                <Briefcase className="w-4 h-4 mt-1 flex-shrink-0" />
                                <span>Quy mô: 100-499 nhân viên</span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full mt-6" asChild>
                            <Link href="#">Xem trang công ty</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
