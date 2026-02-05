'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarRange, ChevronRight, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { RecruitmentCampaign } from '@/features/hr/types/recruitment-campaign-types'

interface DeptHeadCampaignListProps {
    campaigns: RecruitmentCampaign[]
    isLoading?: boolean
}

export function DeptHeadCampaignList({ campaigns, isLoading }: DeptHeadCampaignListProps) {
    const router = useRouter()

    const handleSelect = (id: string) => {
        router.push(`/enterprise/dept-head/recruitment-plans/campaign/${id}`)
    }

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
    }

    if (campaigns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed text-center">
                <div className="p-4 rounded-full bg-blue-50 mb-4">
                    <CalendarRange className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Không có chiến dịch nào đang mở</h3>
                Hiện tại chưa có chiến dịch tuyển dụng nào ở trạng thái &apos;Open&apos;.
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {campaigns.map((campaign) => (
                    <Card
                        key={campaign.id}
                        className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-[#0F4C75] group"
                        onClick={() => handleSelect(campaign.id)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="font-mono bg-blue-50 text-blue-700 border-blue-100">
                                    {campaign.campaignCode}
                                </Badge>
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                                    {campaign.status}
                                </Badge>
                            </div>
                            <CardTitle className="text-lg font-bold text-[#0F4C75] group-hover:text-[#3282B8] transition-colors mt-2">
                                {campaign.campaignName}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                                {campaign.description || 'Chưa có mô tả'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Thời gian:</span>
                                    <span className="font-medium">
                                        Năm {campaign.fiscalYear} {campaign.fiscalQuarter ? `- Q${campaign.fiscalQuarter}` : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Hạn nộp:</span>
                                    <span>{format(new Date(campaign.submissionEndDate), 'dd/MM/yyyy')}</span>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <Button variant="ghost" size="sm" className="text-[#0F4C75] p-0 hover:bg-transparent hover:text-[#3282B8]">
                                        Lập kế hoạch <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
