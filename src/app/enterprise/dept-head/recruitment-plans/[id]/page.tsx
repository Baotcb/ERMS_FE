interface Props {
    params: Promise<{
        id: string
    }>
}

export default async function RecruitmentPlanDetailPage({ params }: Props) {
    const { id } = await params
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#0F4C75]">Chi tiết kế hoạch tuyển dụng</h1>
                <p className="text-muted-foreground">
                    Mã chiến dịch: {id}
                </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Trang lập kế hoạch đang được phát triển...</p>
            </div>
        </div>
    )
}
