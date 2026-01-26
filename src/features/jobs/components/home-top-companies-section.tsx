"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

const TOP_COMPANIES = [
    { name: "CÔNG TY CỔ PHẦN ĐẦU TƯ VÀ CÔNG NGHỆ HVC", logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4ZQ8p-yOrqKGtncPThG4xwW2vnrSpR393EdI2FK25plphAsDhUhY0R3ACuLhPGLmr0dCT_hOgU8EuYi6UV9uN3Pm44gy6NsTaz8y06rtEEQN19xtkNgWpuTLwPUzw6CmpnfFazLOXsm4ZT1tLdm-hC_fIo3f571viEtMRcp5aAYAkOa5CkCHuyAl5iZOQUgNMehp3zNMZKUzEEvHOe-VjdQPNrbgadAzHufcrQfO9AEgf5rf7le-DsPMCfy0JKe1DHDMQZGWomhM", jobs: 19 },
    { name: "CÔNG TY CỔ PHẦN DỆT MAY - ĐẦU TƯ - THƯƠNG MẠI THÀNH CÔNG", logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4Ef5ODNmfm4-42q3pKdKDbTxT1wEmaMUwh85yhi4ugvfjYHuOANMlQlmUlWtLuwTpHWsoQo_hoflx9CdodJjQ_UBqqbuPanIOZMzSls3sxcEDL1Cyhk6-B5kPzxjm3j-LcR5vLWXFjBaIXEQQohForij5vMSmM7IwAcf2YOBoI8lnaetUKJP7YCm9zRUtc1yb3-B6detaqONzTrTOhKCBaLfNfJ43dMO4KgZMJObkEXvmmFA1LTOMOKj6R8beKDO1bYVR5YHdLg0", jobs: 3 },
    { name: "CÔNG TY TNHH TẬP ĐOÀN ĐẦU TƯ HOA SEN", logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWZAavByrJ86WyC3jehuKavagMZISgGK7zorWt12WAeTszlLWTJDztbIMZye-3r2QFlYbmXa-RAScJZu3sah7CHajoqoYO8Qc8sNR40oMQM2P2p7SqNdEspQJre1RoUEaxSqZgukPRyZ4mZgEjjhTqBJrfOjKhy6ogd2fjV-pTaefGFrnQp65Gb__uyzsUpu7d_a3CJ_qPJfyBW_-ygjZfcTqTotmHuyjKzPhWJ4iulUR0G9xrkItdOsyXrpMHGF_3rn1OuWOW1UE", jobs: 3 },
    { name: "CÔNG TY CỔ PHẦN CÔNG NGHỆ - VIỄN THÔNG ELCOM", logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK8N-ZRD3L6u-xUdTFgOnbsqdtVwqY8Az74oHx6lrVR6utQOdtyBcLFtWiKuUB9VmFdzmgdKcutqrXTZ3QQkR3-U7RoGJT0b7wcbnAZ6o_5kofJHbsXn6Q45pPScKEEPFMRXJMLhkxhwPR5z7hl21jjCGK7uWk2k8OLGx6CS8nq-2-5Zb2L7aswdPhLPee8_9YiuDHhgwNeXRljFfX9tsZhxYFD3PMIYbfrYrJ540wpmCBC9Y1Rn4Qou1p7a2p57Lg1dx4MKzeJYY", jobs: 21 },
    { name: "CÔNG TY CỔ PHẦN HHP GLOBAL", logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEHjo8A-6NWp6kgZLiFJ_r0mIZ96pLtDhwlVMltOPj8_PzACJPyd5sO623JdWSudyngfvIMqkLrpPOufY3hWRlXeKTOr8tE23snt2CzlLOfQH_K9Mq9mOp7cawzpVi-o678ystJ7HQVdxQUaZ-Z2U-Q1PPSL3OfZxbNgNkk69WVzyUV94_rVqrSoi5skFkB8WgW2Ju_4sL5De08vEZRLLnoQd9SN38E-Ght37oFh7TQFPdvxBlBqBW9VB9B7Sbhn9JKsELKgg6JMc", jobs: 1 },
    { name: "CÔNG TY CỔ PHẦN TẬP ĐOÀN THIÊN LONG", logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKXWRu651B739tapHsmNmVDKZLrczRRl-DO7mfvR8Yy1vv22Z_uizyFT-LhcoOMpyeHxHq-HUJpRGHidxrfThVIOyp8_XOr8OE-cNoDyjGGRfJ77E9etmQuWAJ8RxdXTbnxnVBWZFq-8EyZH0_z6rorrOeZNDj9ajyW51pApMkEFUHP41j73hWEFhfygTDjUTlvZMpRbzxLYh1lv-pKWEaWM1u0VpGd_wPQT6DsMlGTV_F5tHVt37KwX-xHD-G3cdk5dzKfMcUwx8", jobs: 19 },
]

export function TopCompaniesSection() {
    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-[#0F4C75] uppercase">Thương hiệu lớn tiêu biểu</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200" disabled>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex gap-6 relative">
                    {/* Featured Company Card (Left) */}
                    <div className="w-full md:w-1/3 min-h-[400px] relative rounded-xl overflow-hidden group cursor-pointer shadow-lg">
                        <Image
                            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
                            alt="Featured Company Office"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 mt-10">
                            <div className="w-24 h-24 bg-white rounded-lg p-2 mb-4 shadow-xl">
                                <Image
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4ZQ8p-yOrqKGtncPThG4xwW2vnrSpR393EdI2FK25plphAsDhUhY0R3ACuLhPGLmr0dCT_hOgU8EuYi6UV9uN3Pm44gy6NsTaz8y06rtEEQN19xtkNgWpuTLwPUzw6CmpnfFazLOXsm4ZT1tLdm-hC_fIo3f571viEtMRcp5aAYAkOa5CkCHuyAl5iZOQUgNMehp3zNMZKUzEEvHOe-VjdQPNrbgadAzHufcrQfO9AEgf5rf7le-DsPMCfy0JKe1DHDMQZGWomhM"
                                    alt="Logo"
                                    width={96}
                                    height={96}
                                    className="object-contain"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Công Ty Cổ Phần Bột Thực Phẩm Tài Ký</h3>
                            <p className="text-slate-300 text-sm mb-6">Bán lẻ - Hàng tiêu dùng - FMCG</p>

                            <div className="flex flex-col gap-3 w-full max-w-[200px]">
                                <span className="bg-[#FF9F00] text-[#0F4C75] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                    Pro Company
                                </span>
                                <Button className="bg-white hover:bg-slate-100 text-[#0F4C75] font-bold rounded-full w-full">
                                    <Plus className="w-4 h-4 mr-1" /> Theo dõi
                                </Button>
                            </div>

                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/20">
                                <span className="mr-1">💼</span> 0 việc làm
                            </div>
                        </div>
                    </div>

                    {/* Grid of Companies (Right) */}
                    <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {TOP_COMPANIES.map((company, index) => (
                            <div key={index} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-full hover:border-[#00b14f] hover:shadow-md transition-all cursor-pointer group">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-12 h-12 border border-slate-100 rounded-lg p-1 flex-shrink-0">
                                        <Image
                                            src={company.logo}
                                            alt={company.name}
                                            width={48}
                                            height={48}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                    <h4 className="text-sm font-bold text-[#0F4C75] line-clamp-3 group-hover:text-[#00b14f] transition-colors">
                                        {company.name}
                                    </h4>
                                </div>
                                <div className="mt-auto flex items-center text-slate-500 text-xs gap-1">
                                    <BriefcaseIcon className="w-3 h-3" />
                                    <span>{company.jobs} việc làm</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function BriefcaseIcon(props: React.SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
    )
}
