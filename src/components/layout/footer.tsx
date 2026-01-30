"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

export function Footer() {
    return (
        <footer className="bg-[#0F4C75] text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
                    {/* Column 1: Brand Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-block">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="relative w-10 h-10 bg-white rounded-lg p-1">
                                    <Image
                                        src="/logo.png"
                                        alt="ERMS Logo"
                                        fill
                                        sizes="40px"
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-2xl font-bold tracking-tight">ERMS</span>
                            </div>
                        </Link>
                        <div className="flex items-start gap-3 text-brand-secondary/80 text-sm">
                            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{siteConfig.contact.address}</p>
                        </div>
                        <div className="flex items-center gap-3 text-brand-secondary/80 text-sm">
                            <Phone className="w-5 h-5 flex-shrink-0" />
                            <p>{siteConfig.contact.phone}</p>
                        </div>
                        <div className="flex items-center gap-3 text-brand-secondary/80 text-sm">
                            <Mail className="w-5 h-5 flex-shrink-0" />
                            <p>{siteConfig.contact.email}</p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            {[Facebook, Linkedin, Youtube].map((Icon, idx) => (
                                <a
                                    key={idx}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF7E67] transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Về ERMS */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Về ERMS</h3>
                        <ul className="space-y-3 text-brand-secondary/80 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Giới thiệu</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Tuyển dụng</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Liên hệ</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Hỏi đáp</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Ứng viên */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Dành cho ứng viên</h3>
                        <ul className="space-y-3 text-brand-secondary/80 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Việc làm mới nhất</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">CV Hay</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">VietnamSalary</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Cẩm nang nghề nghiệp</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Top Công ty</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Nhà tuyển dụng */}
                    <div>
                        <h3 className="font-bold text-lg mb-6">Nhà tuyển dụng</h3>
                        <ul className="space-y-3 text-brand-secondary/80 text-sm">
                            <li><Link href="#" className="hover:text-white transition-colors">Đăng tin tuyển dụng</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Tìm hồ sơ</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Giải pháp quản lý</Link></li>
                            <li><Link href="#" className="hover:text-white transition-colors">Sản phẩm dịch vụ</Link></li>
                        </ul>
                        <div className="mt-6">
                            <Button className="w-full bg-[#FF7E67] hover:bg-[#FF7E67]/90 text-white font-bold border-0">
                                Đăng tin ngay
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-sm text-brand-secondary/60">
                    <p>&copy; 2024 ERMS Technology JSC. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
