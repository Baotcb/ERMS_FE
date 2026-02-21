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
        <div className="relative overflow-hidden min-h-[500px] flex flex-col items-center pt-6 pb-8 bg-gradient-to-br from-[#0F4C75] via-[#0a3d5f] to-[#06263c]">
            {/* Simplified Geometric Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(30deg,#ffffff08_1px,transparent_1px)] bg-[length:40px_40px] opacity-30" />
                <div className="absolute top-1/2 left-0 w-[300px] h-[300px] -translate-y-1/2 -translate-x-1/2 border-r-2 border-b-2 border-white/10 rotate-[-45deg]" />
                <div className="absolute top-1/2 right-0 w-[300px] h-[300px] -translate-y-1/2 translate-x-1/2 border-r-2 border-b-2 border-white/10 rotate-[135deg]" />
                <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-gradient-to-bl from-[#00b14f]/10 to-transparent rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col items-center h-full">
                {/* 1. Header Text - Positioned higher */}
                <div className="text-center mb-5 animate-in fade-in zoom-in duration-700 flex flex-col justify-center max-w-3xl w-full">
                    <h1 className="text-xl md:text-[22px] font-bold text-white leading-tight">
                        Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
                    </h1>
                </div>

                {/* 2. Search Box */}
                <div className="bg-white rounded-full p-1 shadow-2xl flex items-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 w-full max-w-6xl h-12 md:h-14">
                    {/* Keyword Input */}
                    <div className="flex-1 flex items-center px-4 md:px-6 h-full border-r border-slate-100 relative">
                        <Search className="w-5 h-5 text-slate-400 mr-2 md:mr-3 shrink-0" />
                        <input
                            placeholder="Vị trí tuyển dụng, tên công ty..."
                            className="w-full text-sm text-slate-900 placeholder:text-slate-400 outline-none border-none bg-transparent truncate"
                        />
                    </div>

                    {/* Location Select */}
                    <div className="hidden md:flex items-center px-6 h-full min-w-[200px] cursor-pointer hover:bg-slate-50 transition-colors group">
                        <MapPin className="w-5 h-5 text-slate-400 mr-2 group-hover:text-[#0F4C75]" />
                        <Select defaultValue="">
                            <SelectTrigger className="border-0 shadow-none focus:ring-0 w-full p-0 h-auto text-sm font-normal text-slate-700 bg-transparent">
                                <SelectValue placeholder="Địa điểm" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả địa điểm</SelectItem>
                                <SelectItem value="hanoi">Hà Nội</SelectItem>
                                <SelectItem value="hcm">Hồ Chí Minh</SelectItem>
                                <SelectItem value="danang">Đà Nẵng</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Button */}
                    <Button className="h-full px-6 md:px-8 rounded-full bg-[#00b14f] hover:bg-[#00b14f]/90 text-white font-bold text-sm md:text-base shadow-lg transition-all hover:scale-105 active:scale-95 ml-2 hidden md:flex">
                        Tìm kiếm
                    </Button>
                </div>

                {/* 3. Quick Selection Area */}
                <div className="mt-6 flex flex-col md:flex-row gap-6 w-full max-w-6xl h-auto md:h-72 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    {/* Left Panel: Categories */}
                    <div className="bg-white rounded-lg shadow-lg overflow-y-auto scrollbar-hide py-2 w-full md:w-80 h-60 md:h-full shrink-0">
                        {HERO_CATEGORIES.map((cat) => (
                            <div
                                key={cat.id}
                                className={cn(
                                    "px-6 py-3 cursor-pointer flex items-center justify-between text-base font-medium transition-colors hover:text-[#00b14f] hover:bg-[#E8F8EE]",
                                    activeCategory === cat.id ? "text-[#00b14f] bg-[#E8F8EE]" : "text-slate-600"
                                )}
                                onMouseEnter={() => setActiveCategory(cat.id)}
                            >
                                <span>{cat.label}</span>
                                {activeCategory === cat.id && <ChevronRight className="w-4 h-4" />}
                            </div>
                        ))}
                    </div>

                    {/* Right Panel: Job Tags / Sub-Categories */}
                    <div className="bg-white rounded-lg shadow-lg overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent flex-1 h-60 md:h-full">
                        {HERO_CATEGORIES.map((cat) => {
                            if (cat.id !== activeCategory) return null;

                            return (
                                <div key={cat.id} className="animate-in fade-in duration-300 space-y-4">
                                    {cat.subCategories?.map((sub, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-2 md:gap-4 pb-4 border-b border-dashed border-slate-100 last:border-0 last:pb-0">
                                            {/* Sub Category Title */}
                                            <h4 className="text-sm font-bold text-slate-900 w-full sm:w-[180px] shrink-0 pt-1.5 leading-tight">
                                                {sub.name}
                                            </h4>

                                            {/* Tags Horizontal Flow */}
                                            <div className="flex flex-wrap gap-2 flex-1">
                                                {sub.tags.map((tag, tIdx) => (
                                                    <div
                                                        key={tIdx}
                                                        className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-full text-xs md:text-sm hover:bg-[#E8F8EE] hover:text-[#00b14f] cursor-pointer transition-colors whitespace-nowrap"
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
