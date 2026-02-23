"use client"

import Image from "next/image"
import Link from 'next/link'
import { ChevronRight, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePublicEnterprises } from "../hooks/use-public-enterprises"

export function TopCompaniesSection() {
    const { data, isLoading } = usePublicEnterprises()

    // Lấy top 6 công ty nhiều việc nhất
    const topCompanies = data?.slice(0, 6) || []

    return (
        <section className="py-10 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-[#212f3f]">
                            Top Công ty hàng đầu
                        </h2>
                        <p className="text-[#6f7882] text-sm mt-1">
                            Những thương hiệu tuyển dụng uy tín đã xác thực
                        </p>
                    </div>
                    {topCompanies.length > 0 && (
                        <Link href="/companies" className="hidden md:block">
                            <Button
                                variant="outline"
                                className="border-[#1B5583] text-[#1B5583] hover:bg-[#1B5583] hover:text-white transition-colors"
                            >
                                Xem tất cả
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Companies Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-[200px] rounded-lg bg-[#EDE8F0] animate-pulse" />
                        ))}
                    </div>
                ) : topCompanies.length === 0 ? (
                    <div className="text-center py-12 bg-[#EDE8F0] rounded-lg border border-[#e8e8e8]">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-[#a6acb2]" />
                        </div>
                        <p className="text-[#6f7882] font-medium">Chưa có thông tin công ty.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {topCompanies.map((company) => (
                            <Link href={`/companies/${encodeURIComponent(company.enterpriseName)}`} key={company.enterpriseName}>
                                <div className="bg-white border border-[#e8e8e8] rounded-lg p-4 flex flex-col items-center text-center hover:border-[#1B5583] hover:shadow-[0_4px_16px_rgba(27,85,131,0.1)] transition-all cursor-pointer group h-full">
                                    {/* Logo */}
                                    <div className="w-16 h-16 border border-[#e8e8e8] rounded-lg p-1.5 mb-3 group-hover:border-[#1B5583]/30 transition-colors bg-white relative overflow-hidden flex-shrink-0">
                                        <Image
                                            src={company.enterpriseLogoUrl || '/placeholder-logo.png'}
                                            alt={company.enterpriseName}
                                            fill
                                            sizes="64px"
                                            className="object-contain p-1 w-full h-full"
                                        />
                                    </div>

                                    {/* Company Name */}
                                    <h4 className="text-xs font-semibold text-[#212f3f] line-clamp-2 min-h-[32px] group-hover:text-[#1B5583] transition-colors leading-tight">
                                        {company.enterpriseName}
                                    </h4>

                                    {/* Job Count */}
                                    <div className="mt-auto pt-3">
                                        <span className="text-[11px] text-[#1B5583] font-medium bg-[#B5D5F5]/20 rounded px-2 py-0.5">
                                            {company.jobCount} việc làm
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Mobile View All */}
                {topCompanies.length > 0 && (
                    <div className="mt-6 text-center md:hidden">
                        <Link href="/companies">
                            <Button
                                variant="outline"
                                className="border-[#1B5583] text-[#1B5583] hover:bg-[#1B5583] hover:text-white transition-colors w-full"
                            >
                                Xem tất cả công ty
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    )
}
