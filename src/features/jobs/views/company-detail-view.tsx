"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    MapPin,
    Building2,
    ArrowLeft,
    Share2,
    Users,
    ChevronRight,
    Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { useEnterpriseByName } from '../hooks/use-public-enterprises'
import { JobCard } from '../components/job-card'

interface CompanyDetailViewProps {
    id: string
}

export function CompanyDetailView({ id }: CompanyDetailViewProps) {
    const router = useRouter()
    const { toast } = useToast()
    const companyName = decodeURIComponent(id)
    const { data, isLoading, error } = useEnterpriseByName(companyName)
    const company = data?.company
    const jobs = data?.jobs || []
    const [isFollowing, setIsFollowing] = useState(false)

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#EDE8F0] animate-pulse">
                <div className="h-[200px] bg-white border-b border-[#e8e8e8]" />
                <div className="container mx-auto px-4 max-w-6xl -mt-10">
                    <div className="bg-white rounded-lg p-6 flex items-start gap-4 mb-6 shadow-sm">
                        <div className="w-24 h-24 bg-[#EDE8F0] rounded-lg" />
                        <div className="space-y-3 flex-1">
                            <div className="h-6 bg-[#EDE8F0] rounded w-1/3" />
                            <div className="h-4 bg-[#EDE8F0] rounded w-1/4" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !company) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#EDE8F0]">
                <div className="text-center space-y-4 bg-white rounded-lg p-12 shadow-sm border border-[#e8e8e8]">
                    <div className="w-20 h-20 bg-[#EDE8F0] rounded-full flex items-center justify-center mx-auto">
                        <Building2 className="w-10 h-10 text-[#a6acb2]" />
                    </div>
                    <h1 className="text-2xl font-bold text-[#212f3f]">Không tìm thấy công ty</h1>
                    <p className="text-[#6f7882] max-w-md">Thông tin công ty có thể đã bị xóa hoặc tìm kiếm không chính xác.</p>
                    <Button
                        onClick={() => router.push('/companies')}
                        className="mt-4 bg-[#1B5583] hover:bg-[#154360] text-white font-medium rounded-lg h-10 shadow-none"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        )
    }

    const handleFollow = () => {
        setIsFollowing(!isFollowing)
        toast({
            title: isFollowing ? 'Đã bỏ theo dõi công ty' : 'Đang theo dõi công ty',
            description: isFollowing ? undefined : 'Bạn sẽ nhận được thông báo khi có việc làm mới.'
        })
    }

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        toast({ title: 'Đã sao chép link công ty' })
    }

    const uniqueLocations = company.locations || []

    return (
        <div className="min-h-screen bg-[#EDE8F0] pb-12">
            {/* Banner Cover */}
            <div className="h-[250px] bg-gradient-to-r from-[#1B5583] via-[#1B5583]/90 to-[#1B5583]/80 relative overflow-hidden" />

            <div className="container mx-auto px-4 max-w-6xl -mt-[80px] relative z-10">
                {/* Header Card (Logo, Name, Actions) */}
                <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-[#e8e8e8]">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        <div className="w-32 h-32 bg-white rounded-xl border border-[#e8e8e8] flex-shrink-0 shadow-sm relative overflow-hidden">
                            <Image
                                src={company.enterpriseLogoUrl || '/placeholder-logo.png'}
                                alt={company.enterpriseName}
                                fill
                                sizes="128px"
                                className="object-contain p-1.5"
                            />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-[#212f3f] mb-3 leading-tight">{company.enterpriseName}</h1>
                            <div className="flex flex-wrap gap-4 text-sm text-[#6f7882] mb-4">
                                <span className="flex items-center gap-1.5">
                                    <Building2 className="w-4 h-4 text-[#a6acb2]" />
                                    <span>Công ty</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-[#a6acb2]" />
                                    <span>100-499 nhân viên</span>
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <Button
                                onClick={handleFollow}
                                className={`flex-1 md:flex-none h-10 px-6 rounded-lg font-medium transition-colors shadow-none ${isFollowing
                                    ? 'bg-[#f4f5f5] text-[#212f3f] hover:bg-[#e8e8e8]'
                                    : 'bg-[#1B5583] text-white hover:bg-[#154360]'
                                    }`}
                            >
                                {isFollowing ? 'Đang theo dõi' : <><Plus className="w-4 h-4 mr-1.5" />Theo dõi công ty</>}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleShare}
                                className="h-10 w-10 p-0 border-[#1B5583] text-[#1B5583] hover:bg-[#B5D5F5]/20 rounded-lg"
                                title="Chia sẻ công ty"
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content & Sidebar Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Main Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Company */}
                        <div className="bg-white rounded-lg border border-[#e8e8e8] p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-[#212f3f] mb-5 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#1B5583] rounded-full" />
                                Giới thiệu công ty
                            </h2>
                            <div className="text-sm text-[#4a4a4a] leading-relaxed whitespace-pre-line">
                                {`Chào mừng bạn đến với ${company.enterpriseName}!

Chúng tôi tự hào là một trong những doanh nghiệp hàng đầu trong lĩnh vực, với sứ mệnh mang lại giá trị bền vững và các giải pháp sáng tạo cho khách hàng. Đội ngũ của chúng tôi luôn tận tâm, học hỏi và phát triển.

Với môi trường làm việc cởi mở, chế độ đãi ngộ cạnh tranh và con đường thăng tiến minh bạch, chúng tôi mong muốn đồng hành cùng các tài năng để xây dựng một tương lai tốt đẹp hơn.`}
                            </div>
                        </div>

                        {/* Company Jobs */}
                        <div className="bg-white rounded-lg border border-[#e8e8e8] p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-[#212f3f] mb-5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-1 h-6 bg-[#1B5583] rounded-full" />
                                    Tuyển dụng
                                </div>
                                <span className="text-sm font-medium text-[#1B5583] bg-[#B5D5F5]/20 px-3 py-1 rounded-full">
                                    {jobs.length} việc làm
                                </span>
                            </h2>

                            {jobs.length === 0 ? (
                                <div className="text-center py-8 text-[#a6acb2]">
                                    <Building2 className="w-10 h-10 mx-auto mb-2 text-[#d4d4d4]" />
                                    <p className="text-sm">Hiện chưa có tin tuyển dụng nào.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {jobs.map((job) => (
                                        <Link key={job.id} href={`/jobs/${job.id}`} className="block h-full">
                                            <JobCard
                                                {...job}
                                                compact={true}
                                            />
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar Column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Company Info Box */}
                        <div className="bg-white rounded-lg border border-[#e8e8e8] p-6 shadow-sm">
                            <h2 className="text-[15px] font-bold text-[#212f3f] mb-5">Thông tin công ty</h2>

                            <div className="space-y-4">
                                <SidebarInfoItem
                                    icon={<MapPin className="w-4 h-4" />}
                                    title="Địa điểm"
                                    value={uniqueLocations.join(', ') || 'Đang cập nhật'}
                                />
                                <SidebarInfoItem
                                    icon={<Building2 className="w-4 h-4" />}
                                    title="Phòng ban"
                                    value={company.departmentName || 'Đang cập nhật'}
                                />
                                <SidebarInfoItem
                                    icon={<Users className="w-4 h-4" />}
                                    title="Số vị trí đang tuyển"
                                    value={`${company.jobCount} việc làm`}
                                />
                            </div>
                        </div>

                        {/* Navigation Helper */}
                        <div className="bg-white rounded-lg border border-[#e8e8e8] p-4 shadow-sm flex items-center justify-between cursor-pointer hover:border-[#1B5583] hover:shadow-md transition-all">
                            <Link href="/companies" className="flex items-center w-full justify-between">
                                <span className="text-sm font-bold text-[#212f3f]">Khám phá thêm công ty</span>
                                <ChevronRight className="w-4 h-4 text-[#1B5583]" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SidebarInfoItem({ icon, title, value, link }: { icon: React.ReactNode, title: string, value: string, link?: string }) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#EDE8F0] flex items-center justify-center text-[#6f7882] flex-shrink-0">
                {icon}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs text-[#a6acb2] mb-1">{title}</p>
                {link ? (
                    <a href={link} className="text-sm font-semibold text-[#1B5583] truncate block hover:underline" target="_blank" rel="noopener noreferrer">
                        {value}
                    </a>
                ) : (
                    <p className="text-sm font-semibold text-[#212f3f] line-clamp-2">{value}</p>
                )}
            </div>
        </div>
    )
}
