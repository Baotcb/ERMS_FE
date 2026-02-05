'use client'

import Link from 'next/link'
import useSWR from 'swr'
import { CheckSquare, FileText, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/lib/api-client'
import { Skeleton } from '@/components/ui/skeleton'

export default function DirectorDashboard() {
    // Fetch pending count
    const { data, isLoading } = useSWR('/RecruitmentPlans/pending-count', async () => {
        const res = await apiClient.get('/RecruitmentPlans?Status=Pending&Page=1&PageSize=1')
        const json = await res.json()
        return json.totalCount
    })

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[#0F4C75]">Tổng quan</h1>
                <p className="text-muted-foreground mt-2">
                    Chào mừng trở lại! Đây là tổng quan về hoạt động tuyển dụng.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/enterprise/director/recruitment-plans">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-yellow-500 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Kế hoạch chờ duyệt
                            </CardTitle>
                            <CheckSquare className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {isLoading ? <Skeleton className="h-8 w-16" /> : data ?? 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Cần xem xét và phê duyệt
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/enterprise/director/recruitment-report">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Báo cáo tuyển dụng
                            </CardTitle>
                            <FileText className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground">
                                Hiệu quả tuyển dụng
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/enterprise/director/training-report">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Báo cáo đào tạo
                            </CardTitle>
                            <FileText className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground">
                                Tình hình đào tạo
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/enterprise/director/subscription">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500 h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Gói dịch vụ
                            </CardTitle>
                            <CheckSquare className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">--</div>
                            <p className="text-xs text-muted-foreground">
                                Quản lý đăng ký
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
