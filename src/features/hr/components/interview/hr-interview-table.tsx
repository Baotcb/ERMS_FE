'use client'

import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarCheck, Video, Building2, Users } from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

import type { InterviewDto } from '../../types/interview-types'

interface HRInterviewTableProps {
    data: InterviewDto[]
    onSchedule: (item: InterviewDto) => void
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; bg: string; text: string; dot: string }> = {
        PendingSchedule: { label: 'Chờ xếp lịch', bg: 'bg-yellow-100 border-yellow-200/50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
        Scheduled: { label: 'Đã xếp lịch', bg: 'bg-blue-100 border-blue-200/50', text: 'text-blue-700', dot: 'bg-blue-500' },
        Completed: { label: 'Hoàn thành', bg: 'bg-green-100 border-green-200/50', text: 'text-green-700', dot: 'bg-green-500' },
        Cancelled: { label: 'Đã hủy', bg: 'bg-red-100 border-red-200/50', text: 'text-red-700', dot: 'bg-red-500' },
    }
    const c = config[status] ?? { label: status, bg: 'bg-gray-100 border-gray-200/50', text: 'text-gray-600', dot: 'bg-gray-400' }

    return (
        <span className={`inline-flex items-center justify-center min-w-[110px] px-2.5 py-1 rounded-full text-xs font-medium border ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${c.dot}`} />
            {c.label}
        </span>
    )
}

export function HRInterviewTable({ data, onSchedule }: HRInterviewTableProps) {
    if (data.length === 0) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <CalendarCheck className="w-8 h-8 text-[#0EA5E9] mb-4" />
                <h3 className="text-lg font-semibold text-slate-600">Chưa có lịch phỏng vấn nào</h3>
                <p className="text-slate-400 mt-2 max-w-sm">
                    Khi Trưởng bộ phận phân công người phỏng vấn, lịch sẽ hiển thị ở đây.
                </p>
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow className="border-b border-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Ứng viên
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Vị trí
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Vòng / Loại
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Lịch phỏng vấn
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Trạng thái
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                        Người PV
                    </TableHead>
                    <TableHead className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                        Hành động
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-50">
                {data.map((item) => (
                    <TableRow key={item.interviewId} className="hover:bg-sky-50/30 transition-colors group">
                        {/* Candidate */}
                        <TableCell className="px-6 py-4 align-middle">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#BBE1FA]/40 flex items-center justify-center text-[#0F4C75] font-bold text-sm shrink-0">
                                    {item.candidateName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-semibold text-[#0C4A6E] text-sm">{item.candidateName}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{item.candidateEmail}</p>
                                </div>
                            </div>
                        </TableCell>

                        {/* Job Title */}
                        <TableCell className="px-6 py-4 align-middle text-sm text-slate-600 max-w-[200px]">
                            <span className="line-clamp-2">{item.jobTitle}</span>
                        </TableCell>

                        {/* Round / Type */}
                        <TableCell className="px-6 py-4 align-middle">
                            <div className="flex flex-col gap-1 w-[90px]">
                                <Badge variant="outline" className="text-xs bg-slate-50 text-slate-500 border-slate-200 w-full justify-center">
                                    Vòng {item.roundNumber}
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200 w-full justify-center">
                                    {item.interviewType}
                                </Badge>
                            </div>
                        </TableCell>

                        {/* Schedule Info */}
                        <TableCell className="px-6 py-4 align-middle whitespace-nowrap">
                            {item.scheduledAt ? (
                                <div className="flex flex-col gap-0.5 text-sm text-slate-600">
                                    <span>{format(new Date(item.scheduledAt), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        {item.interviewFormat === 'Online'
                                            ? <><Video className="w-3 h-3" /> Online</>
                                            : <><Building2 className="w-3 h-3" /> {item.location || 'Tại VP'}</>
                                        }
                                        {' · '}{item.duration} phút
                                    </span>
                                </div>
                            ) : (
                                <span className="text-slate-400 text-sm">Chưa xếp lịch</span>
                            )}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="px-6 py-4 align-middle text-center">
                            <StatusBadge status={item.status} />
                        </TableCell>

                        {/* Interviewers */}
                        <TableCell className="px-6 py-4 align-middle text-center">
                            {item.participants.length > 0 ? (
                                <div className="flex items-center justify-center gap-1 text-xs text-slate-500">
                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{item.participants.length}</span>
                                </div>
                            ) : (
                                <span className="text-slate-400 text-xs">—</span>
                            )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-6 py-4 align-middle text-right">
                            {item.status === 'PendingSchedule' && (
                                <Button
                                    size="sm"
                                    className="text-xs bg-[#0F4C75] hover:bg-[#3282B8]"
                                    onClick={() => onSchedule(item)}
                                >
                                    <CalendarCheck className="w-3 h-3 mr-1" />
                                    Xác nhận lịch
                                </Button>
                            )}
                            {item.status === 'Scheduled' && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Đã xác nhận
                                </Badge>
                            )}
                            {item.status === 'Completed' && (
                                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                    Hoàn thành
                                </Badge>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
