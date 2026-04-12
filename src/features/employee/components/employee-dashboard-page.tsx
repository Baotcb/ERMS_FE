'use client'

import { BookOpenCheck, CalendarDays } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function EmployeeDashboardPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75]">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">Chào mừng bạn quay lại.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/enterprise/employee/interviews" className="block h-full">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 h-full flex flex-col gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#BBE1FA]/30 flex items-center shrink-0 justify-center">
                            <CalendarDays className="w-6 h-6 text-[#0F4C75]" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Lịch phỏng vấn</h3>
                        <p className="text-sm text-slate-500 flex-1">
                            Xem và quản lý các buổi phỏng vấn bạn được phân công tham gia.
                        </p>
                        <div>
                            <Button variant="outline" size="sm" className="text-xs">
                                Xem lịch →
                            </Button>
                        </div>
                    </div>
                </Link>

                <Link href="/enterprise/employee/learning" className="block h-full">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 h-full flex flex-col gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#BBE1FA]/30 flex items-center shrink-0 justify-center">
                            <BookOpenCheck className="w-6 h-6 text-[#0F4C75]" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Khóa học của tôi</h3>
                        <p className="text-sm text-slate-500 flex-1">
                            Vào học, làm quiz cuối khóa và xem kết quả đạt/chưa đạt.
                        </p>
                        <div>
                            <Button variant="outline" size="sm" className="text-xs">
                                Vào học →
                            </Button>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}
