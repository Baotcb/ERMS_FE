'use client'

import { useState, useCallback } from 'react'
import { Search, Check } from 'lucide-react'
import useSWR from 'swr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import { useAssignInterviewer } from '../../hooks/use-interview'


export interface AssignedInterviewer {
    id: string
    fullName: string
    email?: string
}

interface AssignInterviewerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    applicationId: string
    candidateName: string
    onSuccess?: () => void
    onAssignSuccess?: (interviewers: AssignedInterviewer[]) => void
}

interface EmployeeOption {
    id: string
    fullName: string
    position: string | null
    departmentName: string
    departmentId: number
}

export function AssignInterviewerDialog({
    open, onOpenChange, applicationId, candidateName, onSuccess, onAssignSuccess,
}: AssignInterviewerDialogProps) {
    const { toast } = useToast()
    const { trigger, isMutating } = useAssignInterviewer()

    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [note, setNote] = useState('')
    const [employeeSearch, setEmployeeSearch] = useState('')

    // Reset state when dialog opens (React docs: adjusting state when prop changes)
    const [prevOpen, setPrevOpen] = useState(open)
    if (open && !prevOpen) {
        setSelectedIds([])
        setNote('')
        setEmployeeSearch('')
    }
    if (open !== prevOpen) {
        setPrevOpen(open)
    }

    // Fetch employees and filter by department on client-side
    // Backend returns departmentName per employee — we find the DeptHead's dept
    // by detecting which department appears most (DeptHead is in that dept)
    const { data: employeesData } = useSWR<{ items: EmployeeOption[] }>(
        open ? ['/api/Employees', employeeSearch] : null,
        () => apiClient.get(`/api/Employees?pageSize=100&search=${employeeSearch}`).then(r => r.json())
    )

    // Auto-detect DeptHead's department: find the most common departmentName
    const allEmployees = employeesData?.items ?? []
    const deptCounts = allEmployees.reduce<Record<string, number>>((acc, emp) => {
        acc[emp.departmentName] = (acc[emp.departmentName] || 0) + 1
        return acc
    }, {})
    const mainDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

    // Only show employees from the same department
    const employees = mainDept
        ? allEmployees.filter(e => e.departmentName === mainDept)
        : allEmployees

    const toggleEmployee = useCallback((id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }, [])

    const handleSubmit = async () => {
        if (selectedIds.length === 0) return

        try {
            await trigger({
                applicationId,
                interviewType: 'Technical',
                interviewerIds: selectedIds,
                note: note || undefined,
            })
            toast({
                title: 'Phân công thành công',
                description: `Đã phân công ${selectedIds.length} người phỏng vấn.`,
            })

            // Build assigned interviewer list for the schedule dialog
            const assignedInterviewers: AssignedInterviewer[] = selectedIds
                .map(id => {
                    const emp = employees.find(e => e.id === id)
                    if (!emp) return null
                    const interviewer: AssignedInterviewer = { id: emp.id, fullName: emp.fullName }
                    return interviewer
                })
                .filter((x): x is AssignedInterviewer => x !== null)

            onOpenChange(false)

            // Pass interviewers to parent so it can open ConfirmScheduleDialog
            if (onAssignSuccess) {
                onAssignSuccess(assignedInterviewers)
            } else {
                onSuccess?.()
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Không thể phân công',
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle className="text-[#0F4C75]">Phân công người phỏng vấn</DialogTitle>
                    <DialogDescription>
                        Ứng viên: <strong>{candidateName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-2 max-h-[60vh] overflow-y-auto">

                    {/* Employee Search & Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Chọn người phỏng vấn</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm kiếm theo tên, vị trí..."
                                className="pl-9 bg-slate-50"
                                value={employeeSearch}
                                onChange={e => setEmployeeSearch(e.target.value)}
                            />
                        </div>

                        <div className="border rounded-lg max-h-[200px] overflow-y-auto divide-y">
                            {employees.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-400">Không tìm thấy nhân viên</div>
                            ) : (
                                employees.map(emp => {
                                    const selected = selectedIds.includes(emp.id)
                                    return (
                                        <button
                                            key={emp.id}
                                            type="button"
                                            onClick={() => toggleEmployee(emp.id)}
                                            className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${selected ? 'bg-[#BBE1FA]/20' : 'hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                                                {emp.fullName.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-800 truncate">{emp.fullName}</p>
                                                <p className="text-xs text-slate-400 truncate">{emp.position || emp.departmentName}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected
                                                ? 'bg-[#0F4C75] border-[#0F4C75]'
                                                : 'border-slate-300'
                                                }`}>
                                                {selected && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label className="text-sm font-medium">Ghi chú</Label>
                            <span className="text-xs text-slate-400">{note.length}/500</span>
                        </div>
                        <Textarea
                            placeholder="Nhập ghi chú cho người phỏng vấn..."
                            value={note}
                            onChange={e => setNote(e.target.value.slice(0, 500))}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* Selection summary */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-[#BBE1FA]/10 rounded-lg border border-[#BBE1FA]/30">
                            <div className="flex -space-x-2">
                                {selectedIds.slice(0, 3).map(id => {
                                    const emp = employees.find(e => e.id === id)
                                    return (
                                        <div key={id} className="w-7 h-7 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-xs font-bold border-2 border-white">
                                            {emp?.fullName.charAt(0) ?? '?'}
                                        </div>
                                    )
                                })}
                            </div>
                            <span className="text-sm text-[#0F4C75] font-medium">
                                Đã chọn: {selectedIds.length} người phỏng vấn
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isMutating}>Hủy</Button>
                    <Button
                        className="bg-[#0F4C75] hover:bg-[#3282B8]"
                        disabled={selectedIds.length === 0 || isMutating}
                        onClick={handleSubmit}
                    >
                        {isMutating ? 'Đang xử lý...' : `Phân công (${selectedIds.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
