"use client"

import { useState } from "react"
import { Search, MapPin, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { HERO_CATEGORIES } from "../data/hero-categories"

export function HeroSection() {
    const [activeCategory, setActiveCategory] = useState<string>("marketing")

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#00b14f] via-[#009643] to-[#007a37]">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(30deg,#ffffff06_1px,transparent_1px)] bg-[length:40px_40px]" />
                {/* Floating circles */}
                <div className="absolute top-10 right-20 w-[200px] h-[200px] bg-white/5 rounded-full blur-2xl" />
                <div className="absolute bottom-10 left-20 w-[150px] h-[150px] bg-white/5 rounded-full blur-2xl" />
                {/* Decorative dots */}
                <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/20 rounded-full" />
                <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/15 rounded-full" />
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/20 rounded-full" />
            </div>

            <div className="container mx-auto px-4 relative z-10 py-8 md:py-10">
                {/* Header Text */}
                <div className="text-center mb-6 animate-in fade-in zoom-in duration-700 max-w-3xl mx-auto">
                    <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                        Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
                    </h1>
                    <p className="text-white/70 text-sm mt-2">
                        Tiếp cận hàng nghìn tin tuyển dụng việc làm mới mỗi ngày từ hàng nghìn doanh nghiệp uy tín
                    </p>
                </div>

                {/* Search Box - TopCV Style */}
                <div className="max-w-4xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="bg-white rounded-lg p-1.5 shadow-[0_6px_20px_rgba(0,0,0,0.15)] flex items-center gap-1">
                        {/* Keyword Input */}
                        <div className="flex-1 flex items-center px-4 h-[44px] relative">
                            <Search className="w-5 h-5 text-[#00b14f] mr-3 shrink-0" />
                            <input
                                placeholder="Vị trí tuyển dụng, tên công ty..."
                                className="w-full text-sm text-[#212f3f] placeholder:text-[#a6acb2] outline-none border-none bg-transparent"
                            />
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px h-7 bg-[#e8e8e8]" />

                        {/* Location Select */}
                        <div className="hidden md:flex items-center px-3 h-[44px] min-w-[180px]">
                            <MapPin className="w-4 h-4 text-[#00b14f] mr-2 shrink-0" />
                            <Select defaultValue="">
                                <SelectTrigger className="border-0 shadow-none focus:ring-0 w-full p-0 h-auto text-sm font-normal text-[#212f3f] bg-transparent">
                                    <SelectValue placeholder="Tất cả địa điểm" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả địa điểm</SelectItem>
                                    <SelectItem value="hanoi">Hà Nội</SelectItem>
                                    <SelectItem value="hcm">TP. Hồ Chí Minh</SelectItem>
                                    <SelectItem value="danang">Đà Nẵng</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search Button */}
                        <Button className="h-[44px] px-8 rounded-md bg-[#00b14f] hover:bg-[#009643] text-white font-bold text-sm shadow-none transition-colors">
                            <Search className="w-4 h-4 mr-2 md:hidden" />
                            <span className="hidden md:inline">Tìm kiếm</span>
                        </Button>
                    </div>
                </div>

                {/* Quick Stats Bar */}
                <div className="flex items-center justify-center gap-6 md:gap-10 mb-6 text-white/90 text-sm animate-in fade-in duration-700 delay-300">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#ffd700] rounded-full animate-pulse" />
                        <span className="font-medium">Việc làm đang tuyển</span>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#ffd700] rounded-full animate-pulse" />
                        <span className="font-medium">Cập nhật hàng giờ</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#ffd700] rounded-full animate-pulse" />
                        <span className="font-medium">Miễn phí cho ứng viên</span>
                    </div>
                </div>

                {/* Category Panel - Two columns */}
                <div className="flex flex-col md:flex-row gap-0 max-w-5xl mx-auto rounded-lg overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
                    {/* Left Panel: Categories */}
                    <div className="bg-white w-full md:w-[280px] shrink-0 max-h-[320px] overflow-y-auto scrollbar-hide">
                        {HERO_CATEGORIES.map((cat) => (
                            <div
                                key={cat.id}
                                className={cn(
                                    "px-4 py-3 cursor-pointer flex items-center justify-between text-[13px] font-medium transition-colors border-l-2",
                                    activeCategory === cat.id
                                        ? "text-[#00b14f] bg-[#f0faf4] border-l-[#00b14f]"
                                        : "text-[#212f3f] hover:text-[#00b14f] hover:bg-[#f8f9fa] border-l-transparent"
                                )}
                                onMouseEnter={() => setActiveCategory(cat.id)}
                            >
                                <span className="leading-snug">{cat.label}</span>
                                <ChevronRight className={cn(
                                    "w-3.5 h-3.5 shrink-0 ml-2 transition-opacity",
                                    activeCategory === cat.id ? "opacity-100 text-[#00b14f]" : "opacity-0"
                                )} />
                            </div>
                        ))}
                    </div>

                    {/* Right Panel: Sub-categories & tags */}
                    <div className="bg-[#f8f9fa] flex-1 p-5 max-h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                        {HERO_CATEGORIES.map((cat) => {
                            if (cat.id !== activeCategory) return null
                            return (
                                <div key={cat.id} className="animate-in fade-in duration-200 space-y-4">
                                    {cat.subCategories?.map((sub) => (
                                        <div key={sub.name} className="flex flex-col sm:flex-row sm:items-start gap-2 md:gap-3 pb-3 border-b border-dashed border-[#e8e8e8] last:border-0 last:pb-0">
                                            <h4 className="text-[13px] font-bold text-[#212f3f] w-full sm:w-[160px] shrink-0 pt-0.5 leading-tight">
                                                {sub.name}
                                            </h4>
                                            <div className="flex flex-wrap gap-1.5 flex-1">
                                                {sub.tags.map((tag) => (
                                                    <div
                                                        key={tag}
                                                        className="px-2.5 py-1 bg-white text-[#6f7882] rounded text-xs hover:bg-[#00b14f] hover:text-white cursor-pointer transition-colors border border-[#e8e8e8] hover:border-[#00b14f] whitespace-nowrap"
                                                    >
                                                        {tag}
                                                    </div>
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
    )
}
