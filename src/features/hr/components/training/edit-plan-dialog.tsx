'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Calendar as CalendarIcon, Save } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import { hrTrainingService } from '../../api/hr-training-service';
import { TrainingPlan } from '../../types/training-plan-types';

const editPlanSchema = z.object({
    planName: z.string().min(5, 'Tên kế hoạch phải có ít nhất 5 ký tự'),
    startDate: z.string().min(1, 'Ngày bắt đầu là bắt buộc'),
    endDate: z.string().min(1, 'Ngày kết thúc là bắt buộc'),
    totalBudget: z.number().min(0, 'Ngân sách không hợp lệ').optional(),
    description: z.string().optional(),
}).refine(data => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
    path: ['endDate']
});

type EditPlanValues = z.infer<typeof editPlanSchema>;

interface EditPlanDialogProps {
    plan: TrainingPlan | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditPlanDialog({ plan, open, onOpenChange, onSuccess }: EditPlanDialogProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingDetail, setIsFetchingDetail] = useState(false);
    const [requestIds, setRequestIds] = useState<string[]>([]);

    const form = useForm<EditPlanValues>({
        resolver: zodResolver(editPlanSchema),
        defaultValues: {
            planName: '',
            startDate: '',
            endDate: '',
            totalBudget: 0,
            description: '',
        },
    });

    useEffect(() => {
        if (open && plan) {
            // Load superficial data first
            form.reset({
                planName: plan.planName,
                startDate: plan.startDate ? format(new Date(plan.startDate), 'yyyy-MM-dd') : '',
                endDate: plan.endDate ? format(new Date(plan.endDate), 'yyyy-MM-dd') : '',
                totalBudget: plan.totalBudget || 0,
                description: plan.description || '',
            });

            // Fetch full details to get the trainingRequestIds
            const fetchDetail = async () => {
                setIsFetchingDetail(true);
                try {
                    const detail = await hrTrainingService.getPlanDetail(plan.id);
                    if (detail && detail.trainingRequests) {
                        const ids = detail.trainingRequests.map((req: { id: string }) => req.id);
                        setRequestIds(ids);
                    }
                } catch {
                    toast({
                        variant: 'destructive',
                        title: 'Lỗi',
                        description: 'Không thể tải danh sách yêu cầu của kế hoạch này',
                    });
                } finally {
                    setIsFetchingDetail(false);
                }
            };
            fetchDetail();
        }
    }, [open, plan, form, toast]);

    const onSubmit = async (values: EditPlanValues) => {
        if (!plan) return;

        setIsLoading(true);
        try {
            const res = await hrTrainingService.updatePlan({
                id: plan.id,
                planCode: plan.planCode, // Preserve planCode
                planName: values.planName,
                description: values.description,
                startDate: new Date(values.startDate).toISOString(),
                endDate: new Date(values.endDate).toISOString(),
                totalBudget: values.totalBudget,
                trainingRequestIds: requestIds, // Inject preserved IDs
            });

            if (res.ok) {
                toast({
                    title: 'Thành công',
                    description: 'Kế hoạch đào tạo đã được cập nhật và gửi lại.',
                });
                onOpenChange(false);
                onSuccess();
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: error instanceof Error ? error.message : 'Lỗi khi cập nhật kế hoạch',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white border-none shadow-2xl flex flex-col max-h-[90vh]">
                <div className="bg-gradient-to-r from-[#0F4C75] to-[#3282B8] px-6 py-6 text-white shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Save className="w-5 h-5" /> Hiệu đính Kế hoạch Đào tạo
                        </DialogTitle>
                        <DialogDescription className="text-blue-100 mt-1.5 line-clamp-2">
                            Mã: <strong className="text-white">{plan?.planCode}</strong>. Cập nhật các thông tin chung của kế hoạch theo yêu cầu của Ban Giám đốc để được duyệt lại.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField control={form.control} name="planName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#0F4C75] font-semibold">Tên Kế Hoạch *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ví dụ: Kế Hoạch Đào Tạo Quý 3/2026" className="border-gray-200" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="startDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Ngày bắt đầu dự kiến</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input type="date" className="pl-9 border-gray-200" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="endDate" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Ngày kết thúc dự kiến</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                <Input type="date" className="pl-9 border-gray-200" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={form.control} name="totalBudget" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#0F4C75] font-semibold">Tổng ngân sách dự kiến (VNĐ)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            className="border-gray-200 font-mono text-sm"
                                            {...field}
                                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[#0F4C75] font-semibold">Ghi chú bổ sung</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Điều chỉnh lại dự toán chi phí hoặc lý do..." className="min-h-[100px] border-gray-200" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            
                            <DialogFooter className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                                    Hủy bỏ
                                </Button>
                                <Button type="submit" className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white min-w-[120px]" disabled={isLoading || isFetchingDetail}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                    Cập nhật
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
