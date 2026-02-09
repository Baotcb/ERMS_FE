import { Badge } from '@/components/ui/badge'
import { ApplicationStage } from '../../types/application-types'

const STAGE_CONFIG: Record<ApplicationStage, { label: string; className: string }> = {
    Applied: { label: 'Đã ứng tuyển', className: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
    Reviewing: { label: 'Đang xem xét', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    Shortlisted: { label: 'Đã chọn', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
    InterviewScheduled: { label: 'Lịch phỏng vấn', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
    Interviewed: { label: 'Đã phỏng vấn', className: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' },
    Offered: { label: 'Đề nghị', className: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
    Hired: { label: 'Đã tuyển', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
    Rejected: { label: 'Từ chối', className: 'bg-red-100 text-red-700 hover:bg-red-200' },
    Withdrawn: { label: 'Rút lui', className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
}

export function StageBadge({ stage }: { stage: ApplicationStage }) {
    const config = STAGE_CONFIG[stage] || STAGE_CONFIG.Applied
    return <Badge className={config.className} variant="outline">{config.label}</Badge>
}
