"use client"

import { useState } from "react"
import Image from "next/image"
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Building2, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePublicEnterprises } from "../hooks/use-public-enterprises"
import { cn } from "@/lib/utils"

const INDUSTRY_TABS = [
    { key: "all", label: "Tất cả" },
    { key: "it", label: "IT - Phần mềm" },
    { key: "finance", label: "Tài chính" },
    { key: "retail", label: "Bán lẻ - FMCG" },
    { key: "construction", label: "Xây dựng" },
    { key: "manufacturing", label: "Sản xuất" },
    { key: "telecom", label: "Viễn thông" },
] as const

export function TopCompaniesSection() {
    const { data, isLoading } = usePublicEnterprises()
    const [activeTab, setActiveTab] = useState("all")

    const companies = data || []
    const featuredCompany = companies[0]
    const gridCompanies = companies.slice(1, 7)
    const bottomCompanies = companies.slice(7, 10)

    return (
        <section className="py-10 bg-[#f4f5f5]">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* ===== Header Banner - TopCV gold style adapted to blue ===== */}
                <div className="relative rounded-2xl overflow-hidden mb-5">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0e3a5c] via-[#1B5583] to-[#154360]" />

                    {/* Diagonal logo pattern overlay (right side) */}
                    <div className="absolute right-0 top-0 bottom-0 w-[60%] opacity-[0.08]" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Crect x='10' y='10' width='40' height='40' rx='8' transform='rotate(-15 30 30)'/%3E%3Crect x='70' y='10' width='40' height='40' rx='8' transform='rotate(-15 90 30)'/%3E%3Crect x='10' y='70' width='40' height='40' rx='8' transform='rotate(-15 30 90)'/%3E%3Crect x='70' y='70' width='40' height='40' rx='8' transform='rotate(-15 90 90)'/%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '120px',
                    }} />

                    {/* Decorative floating company silhouettes */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-4 opacity-[0.15]">
                        {[40, 56, 48, 36, 52, 44].map((size, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-lg flex-shrink-0"
                                style={{
                                    width: `${size}px`,
                                    height: `${size}px`,
                                    transform: `rotate(${-10 + i * 5}deg) translateY(${i % 2 === 0 ? -8 : 8}px)`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 px-7 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl md:text-[26px] font-bold text-white italic leading-tight">
                                Thương hiệu lớn tiêu biểu
                            </h2>
                            <p className="text-white/60 text-sm mt-1.5">
                                Hàng trăm thương hiệu lớn tiêu biểu đang tuyển dụng trên ERMS
                            </p>
                        </div>

                        {/* Pro badge */}
                        <div className="hidden md:flex items-center">
                            <span className="px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/30 text-white text-sm font-bold rounded-full">
                                ERMS Pro Company
                            </span>
                        </div>
                    </div>
                </div>

                {/* ===== Filter Tabs - TopCV pill style ===== */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 scrollbar-hide">
                        {INDUSTRY_TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border flex-shrink-0",
                                    activeTab === tab.key
                                        ? "bg-[#1B5583] text-white border-[#1B5583]"
                                        : "text-[#4a4a4a] border-[#e8e8e8] hover:text-[#1B5583] hover:border-[#1B5583] bg-white"
                                )}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {/* Scroll arrows */}
                    <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
                        <button className="w-8 h-8 rounded-full border border-[#e8e8e8] bg-white flex items-center justify-center text-[#a6acb2] hover:border-[#1B5583] hover:text-[#1B5583] transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 rounded-full border border-[#e8e8e8] bg-white flex items-center justify-center text-[#a6acb2] hover:border-[#1B5583] hover:text-[#1B5583] transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ===== Main Content ===== */}
                {isLoading ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
                            <div className="h-[360px] bg-white rounded-xl animate-pulse" />
                            <div className="grid grid-cols-2 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="h-[105px] bg-white rounded-xl animate-pulse" />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : companies.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-[#e8e8e8]">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#f4f5f5] flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-[#a6acb2]" />
                        </div>
                        <p className="text-[#6f7882] font-medium">Chưa có thông tin công ty.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Two-column: Featured + Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
                            {/* ===== Featured Company (Left) - Dark background card ===== */}
                            {featuredCompany && (
                                <Link href={`/companies/${featuredCompany.id || encodeURIComponent(featuredCompany.enterpriseName)}`}>
                                    <div className="relative h-full rounded-xl overflow-hidden cursor-pointer group min-h-[360px]">
                                        {/* Dark background with subtle pattern */}
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
                                        <div className="absolute inset-0 opacity-10" style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Crect x='20' y='20' width='2' height='60'/%3E%3Crect x='40' y='10' width='2' height='80'/%3E%3Crect x='60' y='15' width='2' height='70'/%3E%3Crect x='80' y='5' width='2' height='90'/%3E%3C/g%3E%3C/svg%3E")`,
                                        }} />

                                        {/* Content */}
                                        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6 text-center">
                                            {/* Logo in white container */}
                                            <div className="w-24 h-24 bg-white rounded-xl mb-5 relative overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                                                <Image
                                                    src={featuredCompany.enterpriseLogoUrl || '/placeholder-logo.png'}
                                                    alt={featuredCompany.enterpriseName}
                                                    fill
                                                    sizes="96px"
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Company name */}
                                            <h3 className="text-base font-bold text-white uppercase tracking-wide line-clamp-2 mb-1.5 leading-snug">
                                                {featuredCompany.enterpriseName}
                                            </h3>

                                            {/* Job count pill */}
                                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1.5 rounded-full mt-2 mb-4">
                                                <Briefcase className="w-3.5 h-3.5 text-white/80" />
                                                <span className="text-white text-xs font-medium">{featuredCompany.jobCount} việc làm</span>
                                            </div>

                                            {/* Pro badge */}
                                            <div className="px-4 py-1.5 bg-[#B5D5F5] text-[#0e3a5c] text-[11px] font-bold rounded-full mb-3 uppercase tracking-wider">
                                                Pro Company
                                            </div>

                                            {/* Follow button */}
                                            <button
                                                type="button"
                                                className="px-6 py-2 border border-white/40 text-white text-sm font-medium rounded-full hover:bg-white hover:text-[#1B5583] transition-all"
                                                onClick={(e) => e.preventDefault()}
                                            >
                                                + Theo dõi
                                            </button>
                                        </div>

                                        {/* Left/Right nav hints */}
                                        <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white/60 hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100">
                                            <ChevronLeft className="w-4 h-4" />
                                        </button>
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white/60 hover:bg-black/40 transition-colors opacity-0 group-hover:opacity-100">
                                            <ChevronRight className="w-4 h-4" />
                                        </button>

                                        {/* Carousel dots */}
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {[0, 1, 2].map(i => (
                                                <span key={i} className={cn("w-2 h-2 rounded-full transition-colors", i === 0 ? "bg-white" : "bg-white/30")} />
                                            ))}
                                        </div>
                                    </div>
                                </Link>
                            )}

                            {/* ===== Right Grid - 2 cols x 3 rows ===== */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {gridCompanies.map((company) => (
                                    <CompanyCard key={company.enterpriseName} company={company} />
                                ))}
                                {/* Fill empty slots */}
                                {gridCompanies.length < 6 && Array.from({ length: 6 - gridCompanies.length }).map((_, i) => (
                                    <EmptyCompanySlot key={`empty-${i}`} />
                                ))}
                            </div>
                        </div>

                        {/* ===== Bottom Row - 3 cards ===== */}
                        {bottomCompanies.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {bottomCompanies.map((company) => (
                                    <CompanyCard key={company.enterpriseName} company={company} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <EmptyCompanySlot key={`bottom-empty-${i}`} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== Bottom CTA ===== */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <Link href="/companies">
                        <Button
                            variant="outline"
                            className="border-[#1B5583] text-[#1B5583] hover:bg-[#1B5583] hover:text-white transition-colors rounded-full px-8 h-11 font-semibold"
                        >
                            Xem tất cả công ty
                            <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}

/* ==========================================
   Company Card (TopCV horizontal style)
   ========================================== */
interface CompanyData {
    id?: string
    enterpriseName: string
    enterpriseLogoUrl?: string
    jobCount: number
    locations: string[]
}

function CompanyCard({ company }: { company: CompanyData }) {
    return (
        <Link href={`/companies/${company.id || encodeURIComponent(company.enterpriseName)}`}>
            <div className="flex items-start gap-4 p-4 rounded-xl border border-[#e8e8e8] hover:border-[#1B5583] hover:shadow-[0_4px_16px_rgba(27,85,131,0.1)] transition-all cursor-pointer group bg-white h-full">
                {/* Logo */}
                <div className="w-[60px] h-[60px] border border-[#e8e8e8] rounded-lg flex-shrink-0 relative overflow-hidden bg-white group-hover:border-[#1B5583]/30 transition-colors">
                    <Image
                        src={company.enterpriseLogoUrl || '/placeholder-logo.png'}
                        alt={company.enterpriseName}
                        fill
                        sizes="60px"
                        className="object-cover"
                    />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col">
                    <h4 className="text-[13px] font-bold text-[#212f3f] line-clamp-2 group-hover:text-[#1B5583] transition-colors leading-snug mb-1">
                        {company.enterpriseName}
                    </h4>
                    {/* Industry placeholder */}
                    <p className="text-[11px] text-[#a6acb2] mb-2 line-clamp-1">
                        {company.locations.join(', ') || 'Đang cập nhật'}
                    </p>
                    {/* Job count */}
                    <div className="flex items-center gap-1.5 text-[#6f7882] mt-auto">
                        <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs font-medium">{company.jobCount} việc làm</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

/* ==========================================
   Empty Company Slot
   ========================================== */
function EmptyCompanySlot() {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl border border-dashed border-[#e8e8e8] bg-[#fafbfc] h-full min-h-[105px]">
            <div className="w-[60px] h-[60px] bg-[#f0f0f0] rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-[#d0d0d0]" />
            </div>
            <div className="flex-1 flex flex-col justify-center">
                <div className="h-3.5 bg-[#eee] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#eee] rounded w-1/2 mb-2" />
                <div className="h-2.5 bg-[#eee] rounded w-1/3" />
            </div>
        </div>
    )
}
