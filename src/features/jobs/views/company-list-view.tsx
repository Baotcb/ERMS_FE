"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Building2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePublicEnterprises } from '../hooks/use-public-enterprises'

export function CompanyListView() {
    const { data: companies, isLoading, error } = usePublicEnterprises()
    const [searchQuery, setSearchQuery] = useState('')

    const filteredCompanies = companies?.filter(company =>
        company.enterpriseName.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    return (
        <div className="min-h-screen bg-[#EDE8F0] pb-12">
            {/* Header Section */}
            <div className="bg-white border-b border-[#e8e8e8] py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <h1 className="text-2xl font-bold text-[#212f3f] mb-4 text-center">
                        Khám phá công ty nổi bật
                    </h1>
                    <p className="text-[#6f7882] text-center mb-8 max-w-2xl mx-auto">
                        Tra cứu thông tin công ty và tìm kiếm nơi làm việc tốt nhất dành cho bạn
                    </p>

                    <div className="max-w-3xl mx-auto flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a6acb2]" />
                            <Input
                                type="text"
                                placeholder="Nhập tên công ty để tìm kiếm..."
                                className="pl-10 h-12 rounded-lg border-[#e8e8e8] focus-visible:ring-[#1B5583]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button className="h-12 px-8 bg-[#1B5583] hover:bg-[#154360] text-white font-semibold rounded-lg shadow-none">
                            Tìm kiếm
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 max-w-6xl mt-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[20px] font-bold text-[#212f3f]">
                        Danh sách công ty
                    </h2>
                    {!isLoading && companies && (
                        <p className="text-sm text-[#6f7882]">
                            Tìm thấy <strong>{filteredCompanies.length}</strong> công ty
                        </p>
                    )}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-lg p-6 border border-[#e8e8e8] h-[240px] animate-pulse">
                                <div className="flex gap-4 mb-4">
                                    <div className="w-16 h-16 bg-[#EDE8F0] rounded-lg" />
                                    <div className="flex-1 space-y-2 py-2">
                                        <div className="h-4 bg-[#EDE8F0] rounded w-3/4" />
                                        <div className="h-3 bg-[#EDE8F0] rounded w-1/2" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-3 bg-[#EDE8F0] rounded w-full" />
                                    <div className="h-3 bg-[#EDE8F0] rounded w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-[#e8e8e8]">
                        <p className="text-[#e74c3c]">Đã xảy ra lỗi khi tải danh sách công ty.</p>
                        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-[#1B5583] text-[#1B5583] hover:bg-[#B5D5F5]/20">
                            Thử lại
                        </Button>
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-[#e8e8e8]">
                        <div className="w-20 h-20 bg-[#EDE8F0] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="w-10 h-10 text-[#a6acb2]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#212f3f] mb-2">Không tìm thấy công ty</h3>
                        <p className="text-[#6f7882]">Vui lòng thử lại với từ khóa khác.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map((company) => (
                            <Link href={`/companies/${encodeURIComponent(company.enterpriseName)}`} key={company.enterpriseName}>
                                <div className="bg-white rounded-lg border border-[#e8e8e8] hover:border-[#1B5583] hover:shadow-[0_4px_16px_rgba(27,85,131,0.12)] transition-all cursor-pointer h-full flex flex-col group p-5">
                                    {/* Logo & Name */}
                                    <div className="flex gap-4 mb-4">
                                        <div className="w-16 h-16 border border-[#e8e8e8] rounded-lg flex-shrink-0 relative overflow-hidden bg-white">
                                            <Image
                                                src={company.enterpriseLogoUrl || '/placeholder-logo.png'}
                                                alt={company.enterpriseName}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 className="font-bold text-[#212f3f] line-clamp-2 text-[15px] group-hover:text-[#1B5583] transition-colors leading-snug" title={company.enterpriseName}>
                                                {company.enterpriseName}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="mt-1 mb-4">
                                        <p className="text-sm text-[#6f7882] line-clamp-3">
                                            Công ty hàng đầu trong lĩnh vực với môi trường làm việc chuyên nghiệp, cơ hội thăng tiến rõ ràng cùng chế độ đãi ngộ hấp dẫn.
                                        </p>
                                    </div>

                                    {/* Location & Jobs Count */}
                                    <div className="mt-auto pt-4 border-t border-[#e8e8e8] flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs text-[#6f7882] min-w-0 mr-4">
                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{company.locations.join(', ') || 'Đang cập nhật'}</span>
                                        </div>
                                        <div className="bg-[#B5D5F5]/20 px-2 py-1 rounded text-[#1B5583] text-xs font-bold whitespace-nowrap">
                                            {company.jobCount} việc làm
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
