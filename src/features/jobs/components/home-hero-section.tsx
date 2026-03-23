"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, ChevronRight, ChevronDown, Clock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HERO_CATEGORIES } from "../data/hero-categories"
import { ALL_LOCATIONS_LABEL, buildJobsHref, normalizeLocationChoice } from "../job-filtering"
import { useUserLocation } from "../hooks/use-user-location"

const LOCATIONS = [ALL_LOCATIONS_LABEL, "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Bình Dương", "Đồng Nai"]

function LocationDropdown({
    value,
    onChange,
}: {
    value: string
    onChange: (value: string) => void
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handler = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    return (
        <div className="relative h-full" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 px-4 h-full text-sm text-[#4a4a4a] hover:text-[#1B5583] whitespace-nowrap transition-colors"
            >
                <MapPin className="w-4 h-4 text-[#1B5583] flex-shrink-0" />
                <span className="max-w-[120px] truncate">{value}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform text-[#a6acb2]", open && "rotate-180")} />
            </button>
            {open && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#e8e8e8] py-1.5 z-50">
                    {LOCATIONS.map((location) => (
                        <button
                            key={location}
                            type="button"
                            onClick={() => {
                                onChange(location)
                                setOpen(false)
                            }}
                            className={cn(
                                "w-full text-left px-4 py-2.5 text-sm transition-colors",
                                value === location
                                    ? "bg-[#B5D5F5]/20 text-[#1B5583] font-medium"
                                    : "text-[#4a4a4a] hover:bg-[#f4f5f5]"
                            )}
                        >
                            {location}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export function HeroSection() {
    const router = useRouter()
    const [activeCategory, setActiveCategory] = useState<string>("marketing")
    const [keyword, setKeyword] = useState("")
    const [locationOverride, setLocationOverride] = useState<string | null>(null)
    const { location: userLocation } = useUserLocation()
    const autoLocation = userLocation?.city && LOCATIONS.includes(userLocation.city)
        ? userLocation.city
        : ALL_LOCATIONS_LABEL
    const locationFilter = locationOverride ?? autoLocation

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault()
        router.push(buildJobsHref({
            q: keyword.trim() || null,
            location: normalizeLocationChoice(locationFilter) ?? null,
        }))
    }

    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0e3a5c] via-[#1B5583] to-[#1B5583]/90" />

            <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#B5D5F5]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-[#154360]/20 rounded-full blur-3xl" />

            <div className="relative z-10 pt-10 pb-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-7">
                        <h1 className="text-[22px] md:text-[28px] font-bold text-white leading-tight">
                            Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
                        </h1>
                        <p className="text-white/60 text-sm mt-2">
                            Tiếp cận hàng nghìn tin tuyển dụng việc làm mới mỗi ngày từ hàng nghìn doanh nghiệp uy tín
                        </p>
                    </div>

                    <form className="max-w-3xl mx-auto mb-5" onSubmit={handleSearch}>
                        <div className="flex items-center bg-white rounded-full shadow-lg shadow-black/10 h-[52px] pr-1.5">
                            <div className="flex-1 flex items-center h-full pl-5 min-w-0">
                                <Search className="w-5 h-5 text-[#a6acb2] flex-shrink-0" />
                                <input
                                    placeholder="Vị trí tuyển dụng, tên công ty..."
                                    className="flex-1 h-full px-3 text-sm text-[#212f3f] placeholder:text-[#a6acb2] bg-transparent outline-none border-none min-w-0"
                                    value={keyword}
                                    onChange={(event) => setKeyword(event.target.value)}
                                />
                            </div>

                            <div className="hidden md:block w-px h-7 bg-[#e8e8e8] flex-shrink-0" />

                            <div className="hidden md:block h-full">
                                <LocationDropdown value={locationFilter} onChange={setLocationOverride} />
                            </div>

                            <Button className="h-[42px] px-7 bg-[#1B5583] hover:bg-[#154360] text-white font-bold rounded-full shadow-none text-sm transition-colors flex items-center gap-2 flex-shrink-0">
                                <Search className="w-4 h-4" />
                                <span className="hidden md:inline">Tìm kiếm</span>
                            </Button>
                        </div>
                    </form>

                    <div className="flex items-center justify-center gap-6 md:gap-8 mb-7 text-sm text-white/80 flex-wrap">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#2ecc71] rounded-full animate-pulse" />
                            Việc làm đang tuyển
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            Cập nhật hàng giờ
                        </span>
                        <span className="flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Miễn phí cho ứng viên
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-0 rounded-2xl overflow-hidden shadow-xl shadow-black/10 bg-white">
                        <div className="w-full md:w-[270px] shrink-0 bg-[#fafbfc] border-r border-[#e8e8e8] max-h-[340px] overflow-y-auto">
                            {HERO_CATEGORIES.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    className={cn(
                                        "w-full px-5 py-3.5 cursor-pointer flex items-center justify-between text-[13px] font-medium transition-all text-left",
                                        activeCategory === category.id
                                            ? "text-[#1B5583] bg-white font-semibold border-r-2 border-[#1B5583] shadow-sm"
                                            : "text-[#4a4a4a] hover:bg-white hover:text-[#1B5583] border-r-2 border-transparent"
                                    )}
                                    onMouseEnter={() => setActiveCategory(category.id)}
                                >
                                    <span className="leading-snug">{category.label}</span>
                                    <ChevronRight
                                        className={cn(
                                            "w-3.5 h-3.5 shrink-0 ml-2 text-[#a6acb2] transition-all",
                                            activeCategory === category.id && "text-[#1B5583]"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 p-6 max-h-[340px] overflow-y-auto">
                            {HERO_CATEGORIES.map((category) => {
                                if (category.id !== activeCategory) return null

                                return (
                                    <div key={category.id} className="space-y-5">
                                        {category.subCategories?.map((subCategory) => (
                                            <div
                                                key={subCategory.name}
                                                className="flex flex-col sm:flex-row sm:items-start gap-2 md:gap-4 pb-4 border-b border-dashed border-[#e8e8e8] last:border-0 last:pb-0"
                                            >
                                                <h4 className="text-[13px] font-bold text-[#212f3f] w-full sm:w-[160px] shrink-0 pt-0.5 leading-tight">
                                                    {subCategory.name}
                                                </h4>
                                                <div className="flex flex-wrap gap-2 flex-1">
                                                    {subCategory.tags.map((tag) => (
                                                        <Link
                                                            key={tag}
                                                            href={buildJobsHref({ q: tag })}
                                                            className="inline-block px-3 py-1.5 rounded-full text-[12px] border border-[#e8e8e8] text-[#6f7882] bg-white hover:border-[#1B5583] hover:text-[#1B5583] hover:bg-[#B5D5F5]/10 transition-all whitespace-nowrap"
                                                        >
                                                            {tag}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
