import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
        <section className="py-10 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-[#212f3f]">
                            Top Công ty hàng đầu
                        </h2>
                        <p className="text-[#6f7882] text-sm mt-1">
                            Những thương hiệu tuyển dụng uy tín đã xác thực
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg border-[#e8e8e8] text-[#6f7882] hover:border-[#00b14f] hover:text-[#00b14f]"
                            disabled
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-lg border-[#e8e8e8] text-[#6f7882] hover:border-[#00b14f] hover:text-[#00b14f]"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Companies Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {TOP_COMPANIES.map((company) => (
                        <div
                            key={company.name}
                            className="bg-white border border-[#e8e8e8] rounded-lg p-4 flex flex-col items-center text-center hover:border-[#00b14f] hover:shadow-[0_4px_16px_rgba(0,177,79,0.1)] transition-all cursor-pointer group"
                        >
                            {/* Logo */}
                            <div className="w-16 h-16 border border-[#e8e8e8] rounded-lg p-1.5 mb-3 group-hover:border-[#00b14f]/30 transition-colors">
                                <Image
                                    src={company.logo}
                                    alt={company.name}
                                    width={56}
                                    height={56}
                                    loading="lazy"
                                    className="object-contain w-full h-full"
                                />
                            </div>

                            {/* Company Name */}
                            <h4 className="text-xs font-semibold text-[#212f3f] line-clamp-2 min-h-[32px] group-hover:text-[#00b14f] transition-colors leading-tight">
                                {company.name}
                            </h4>

                            {/* Job Count */}
                            <div className="mt-auto pt-2">
                                <span className="text-[11px] text-[#00b14f] font-medium bg-[#f0faf4] rounded px-2 py-0.5">
                                    {company.jobs} việc làm
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
