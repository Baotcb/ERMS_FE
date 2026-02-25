'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,

} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api-client'
import type { RecruitmentPlan, PlanDetail as PlanDetailData } from '@/features/dept-head/types/recruitment-plan-types'

interface PlanDetailProps {
    planId: string
    headerActions?: React.ReactNode
}

const STATUS_COLORS: Record<string, string> = {
    Draft: 'bg-gray-100 text-gray-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
}

// PlanDetailData type is imported from types file

export function PlanDetail({ planId, headerActions }: PlanDetailProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isAddOpen, setIsAddOpen] = useState(false)

    // Form state for adding detail - matching backend CreatePlanDetailCommand
    const [newDetail, setNewDetail] = useState({
        positionTitle: '', // Required: Job title/position name
        quantity: 1,
        priority: 'Normal', // Normal, High, Urgent
        justification: '', // Reason for hiring
        requiredSkills: '',
        minExperience: 0,
        maxExperience: 5,
        educationLevel: '',
        salaryRangeMin: 0,
        salaryRangeMax: 0, // Required by backend
        expectedStartDate: ''
    })

    // Fetch Plan data
    const { data: plan, error, isLoading, mutate: mutatePlan } = useSWR<RecruitmentPlan>(
        `/api/RecruitmentPlans/${planId}`,
        () => apiClient.get(`/api/RecruitmentPlans/${planId}`).then(res => res.json())
    )

    // Fetch Plan Details separately since backend doesn't include them in GetRecruitmentPlanById
    const { data: planDetailsResponse, mutate: mutateDetails } = useSWR<PlanDetailData[]>(
        plan ? `/api/plan-details?recruitmentPlanId=${planId}` : null,
        () => apiClient.get(`/api/plan-details?recruitmentPlanId=${planId}`).then(res => res.json())
    )

    const planDetails = Array.isArray(planDetailsResponse) ? planDetailsResponse : []

    const handleMutate = () => {
        mutatePlan()
        mutateDetails()
    }

    const handleDeleteDetail = async (detailId: string) => {
        if (!confirm('Xóa đề xuất này?')) return
        try {
            const res = await apiClient.delete('/api/plan-details', { id: detailId })
            if (res.ok) {
                mutateDetails()
                toast({ description: 'Đã xóa vị trí' })
            } else {
                const err = await res.json().catch(() => ({ message: '' }))
                throw new Error((err as { message?: string }).message || 'Không thể xóa đề xuất')
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Không thể xóa đề xuất',
            })
        }
    }

    const handleAddDetail = async () => {
        try {
            // Validate required fields
            if (!newDetail.positionTitle.trim()) {
                toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng nhập tên vị trí' })
                return
            }
            if (!newDetail.salaryRangeMax || newDetail.salaryRangeMax <= 0) {
                toast({ variant: 'destructive', title: 'Lỗi', description: 'Vui lòng nhập mức lương tối đa' })
                return
            }

            // Payload matching backend CreatePlanDetailCommand
            const payload = {
                RecruitmentPlanId: planId,
                PositionTitle: newDetail.positionTitle,
                Quantity: parseInt(newDetail.quantity.toString(), 10),
                Priority: newDetail.priority,
                Justification: newDetail.justification || null,
                RequiredSkills: newDetail.requiredSkills || null,
                MinExperience: newDetail.minExperience || null,
                MaxExperience: newDetail.maxExperience || null,
                EducationLevel: newDetail.educationLevel || null,
                SalaryRangeMin: newDetail.salaryRangeMin || null,
                SalaryRangeMax: Number(newDetail.salaryRangeMax),
                ExpectedStartDate: newDetail.expectedStartDate ? new Date(newDetail.expectedStartDate).toISOString() : null,
            }

            const res = await apiClient.post('/api/plan-details', payload)

            if (res.ok) {
                const responseData = await res.json()

                toast({
                    title: 'Thêm đề xuất thành công',
                    description: 'Đề xuất mới đã được thêm vào kế hoạch.',
                })

                setIsAddOpen(false)

                // Optimistic update
                const newItem: PlanDetailData = {
                    id: responseData.planDetailId || Date.now().toString(), // Fallback ID if not returned
                    recruitmentPlanId: planId,
                    positionTitle: newDetail.positionTitle,
                    quantity: parseInt(newDetail.quantity.toString(), 10),
                    priority: newDetail.priority as PlanDetailData['priority'],
                    justification: newDetail.justification,
                    requiredSkills: newDetail.requiredSkills,
                    minExperience: newDetail.minExperience,
                    maxExperience: newDetail.maxExperience,
                    educationLevel: newDetail.educationLevel,
                    salaryRangeMin: newDetail.salaryRangeMin,
                    salaryRangeMax: Number(newDetail.salaryRangeMax),
                    expectedStartDate: newDetail.expectedStartDate ? new Date(newDetail.expectedStartDate).toISOString() : undefined,
                    status: 'Pending'
                }

                mutateDetails((currentData) => {
                    if (!currentData) return [newItem]
                    return [...currentData, newItem]
                }, false) // Update cache immediately without revalidation

                // Reset form
                setNewDetail({
                    positionTitle: '',
                    quantity: 1,
                    priority: 'Normal',
                    justification: '',
                    requiredSkills: '',
                    minExperience: 0,
                    maxExperience: 5,
                    educationLevel: '',
                    salaryRangeMin: 0,
                    salaryRangeMax: 0,
                    expectedStartDate: ''
                })

                // Revalidate to ensure consistency
                handleMutate()
            } else {
                const errorData = await res.json()
                throw new Error(errorData.message || 'Lỗi khi thêm đề xuất')
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Lỗi khi thêm đề xuất'
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: errorMessage,
            })
        }
    }

    if (isLoading) return <div>Đang tải thông tin kế hoạch...</div>
    if (error || !plan) return <div>Không tìm thấy kế hoạch hoặc có lỗi xảy ra.</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#0F4C75]">{plan.planName}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-mono">{plan.planCode}</span>
                            <span>•</span>
                            <Badge variant="outline" className={`border-0 ${STATUS_COLORS[plan.status]}`}>
                                {plan.status}
                            </Badge>
                        </div>
                    </div>
                </div>
                {headerActions && (
                    <div className="flex gap-2">
                        {headerActions}
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin chung</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Thời gian:</span>
                            <span>{format(new Date(plan.startDate), 'dd/MM/yyyy')} - {format(new Date(plan.endDate), 'dd/MM/yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Ngân sách:</span>
                            <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(plan.totalBudget)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Người tạo:</span>
                            <span>{plan.createdByName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Ngày tạo:</span>
                            <span>{format(new Date(plan.createdAt), 'dd/MM/yyyy')}</span>
                        </div>
                        <div className="mt-4">
                            <span className="text-gray-500 block mb-1">Mô tả:</span>
                            <p className="bg-gray-50 p-2 rounded text-gray-700">{plan.description || 'Không có mô tả'}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Danh sách đề xuất tuyển dụng</CardTitle>
                        {plan.status === 'Draft' && (
                            <Button size="sm" variant="outline" onClick={() => setIsAddOpen(true)}>
                                <Plus className="w-4 h-4 mr-1" /> Thêm đề xuất
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Đề xuất tuyển dụng</TableHead>
                                    <TableHead>Số lượng</TableHead>
                                    <TableHead>Ưu tiên</TableHead>
                                    <TableHead>Lương tối đa</TableHead>
                                    {plan.status === 'Draft' && <TableHead className="w-[50px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {planDetails.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                            Chưa có đề xuất nào. Bấm &quot;Thêm đề xuất&quot; để bắt đầu.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    planDetails.map((detail: PlanDetailData) => (
                                        <TableRow key={detail.id}>
                                            <TableCell className="font-medium">{detail.positionTitle || '-'}</TableCell>
                                            <TableCell>{detail.quantity}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    detail.priority === 'Urgent' ? 'border-red-500 text-red-600' :
                                                        detail.priority === 'High' ? 'border-yellow-500 text-yellow-600' :
                                                            'border-gray-300 text-gray-600'
                                                }>
                                                    {detail.priority === 'Urgent' ? 'Khẩn cấp' :
                                                        detail.priority === 'High' ? 'Cao' : 'Bình thường'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
                                                    .format(detail.salaryRangeMax || 0)}
                                            </TableCell>
                                            {plan.status === 'Draft' && (
                                                <TableCell>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteDetail(detail.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Thêm đề xuất tuyển dụng</DialogTitle>
                        <DialogDescription>Nhập thông tin vị trí và số lượng cần tuyển.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label>Tên vị trí (Job Title) <span className="text-red-500">*</span></Label>
                                <Input
                                    value={newDetail.positionTitle}
                                    onChange={(e) => setNewDetail({ ...newDetail, positionTitle: e.target.value })}
                                    placeholder="VD: Senior Frontend Developer"
                                />
                            </div>
                            <div>
                                <Label>Số lượng <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={newDetail.quantity}
                                    onChange={(e) => setNewDetail({ ...newDetail, quantity: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Độ ưu tiên</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newDetail.priority}
                                    onChange={(e) => setNewDetail({ ...newDetail, priority: e.target.value })}
                                >
                                    <option value="Normal">Bình thường</option>
                                    <option value="High">Cao</option>
                                    <option value="Urgent">Khẩn cấp</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Kinh nghiệm tối thiểu (năm)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={newDetail.minExperience}
                                    onChange={(e) => setNewDetail({ ...newDetail, minExperience: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Kinh nghiệm tối đa (năm)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={newDetail.maxExperience}
                                    onChange={(e) => setNewDetail({ ...newDetail, maxExperience: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Lương tối thiểu (VNĐ)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={newDetail.salaryRangeMin}
                                    onChange={(e) => setNewDetail({ ...newDetail, salaryRangeMin: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <Label>Lương tối đa (VNĐ) <span className="text-red-500">*</span></Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={newDetail.salaryRangeMax}
                                    onChange={(e) => setNewDetail({ ...newDetail, salaryRangeMax: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Trình độ học vấn</Label>
                                <Input
                                    value={newDetail.educationLevel}
                                    onChange={(e) => setNewDetail({ ...newDetail, educationLevel: e.target.value })}
                                    placeholder="VD: Đại học, Cao đẳng..."
                                />
                            </div>

                            <div>
                                <Label>Kỹ năng yêu cầu</Label>
                                <Input
                                    value={newDetail.requiredSkills}
                                    onChange={(e) => setNewDetail({ ...newDetail, requiredSkills: e.target.value })}
                                    placeholder="VD: React, TypeScript, Node.js"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Ngày bắt đầu làm việc (dự kiến)</Label>
                            <Input
                                type="date"
                                value={newDetail.expectedStartDate}
                                onChange={(e) => setNewDetail({ ...newDetail, expectedStartDate: e.target.value })}
                            />
                        </div>

                        <div>
                            <Label>Lý do tuyển dụng</Label>
                            <Input
                                value={newDetail.justification}
                                onChange={(e) => setNewDetail({ ...newDetail, justification: e.target.value })}
                                placeholder="Mở rộng, thay thế, dự án mới..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Hủy</Button>
                        <Button onClick={handleAddDetail}>Thêm đề xuất</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
