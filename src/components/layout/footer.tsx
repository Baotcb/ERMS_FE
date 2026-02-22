"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"

export function Footer() {
    return (
        <footer className="bg-[#212f3f] text-white pt-12 pb-6">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
                    {/* Column 1: Brand Info */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link href="/" className="inline-block">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="relative w-9 h-9 bg-white rounded-lg p-1">
                                    <Image
                                        src="/logo.png"
                                        alt="ERMS Logo"
                                        fill
                                        sizes="36px"
                                        className="object-contain"
                                    />
                                </div>
                                <span className="text-xl font-bold tracking-tight">ERMS</span>
                            </div>
                        </Link>
                        <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                            Nền tảng tuyển dụng trực tuyến hàng đầu Việt Nam, kết nối ứng viên với hàng nghìn doanh nghiệp uy tín.
                        </p>

                        <div className="space-y-2.5">
                            <div className="flex items-start gap-2.5 text-white/60 text-sm">
                                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <p>{siteConfig.contact.address}</p>
                            </div>
                            <div className="flex items-center gap-2.5 text-white/60 text-sm">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <p>{siteConfig.contact.phone}</p>
                            </div>
                            <div className="flex items-center gap-2.5 text-white/60 text-sm">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <p>{siteConfig.contact.email}</p>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            {[
                                { Icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
                                { Icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com' },
                                { Icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
                            ].map(({ Icon, label, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#00b14f] transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Về ERMS */}
                    <div>
                        <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-white/90">Về ERMS</h3>
                        <ul className="space-y-2.5 text-white/60 text-sm">
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Giới thiệu</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Tuyển dụng</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Liên hệ</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Hỏi đáp</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Chính sách bảo mật</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Điều khoản dịch vụ</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Ứng viên */}
                    <div>
                        <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-white/90">Dành cho ứng viên</h3>
                        <ul className="space-y-2.5 text-white/60 text-sm">
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Việc làm mới nhất</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">CV Hay</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">VietnamSalary</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Cẩm nang nghề nghiệp</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Top Công ty</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Nhà tuyển dụng */}
                    <div>
                        <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-white/90">Nhà tuyển dụng</h3>
                        <ul className="space-y-2.5 text-white/60 text-sm">
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Đăng tin tuyển dụng</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Tìm hồ sơ</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Giải pháp quản lý</Link></li>
                            <li><Link href="#" className="hover:text-[#00b14f] transition-colors">Sản phẩm dịch vụ</Link></li>
                        </ul>
                        <div className="mt-4">
                            <Button className="w-full bg-[#00b14f] hover:bg-[#009643] text-white font-semibold border-0 h-9 rounded-lg text-sm transition-colors shadow-none">
                                Đăng tin ngay
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 text-center text-xs text-white/40">
                    <p>&copy; 2024 ERMS Technology JSC. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
