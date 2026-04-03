'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Users, Info, Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAsyncAction } from '@/hooks/use-async-action';
import { apiClient } from '@/lib/api-client';


import { trainingService } from '../../api/training-service';
import { 
    trainingRequestSchema, 
    type TrainingRequestValues, 
    type TrainingRequestFormProps, 
    TRAINING_REQUEST_DEFAULTS 
} from '../../schema/training-request-schema';

export function TrainingRequestForm({ open, onOpenChange, onSuccess, initialData }: TrainingRequestFormProps) {
    const { execute, isSubmitting: isLoading } = useAsyncAction();
    const { toast } = useToast();
    const [detectedEmp, setDetectedEmp] = useState<{ id: string; departmentName: string } | null>(null);
    const [detectError, setDetectError] = useState<string | null>(null);

    const form = useForm<TrainingRequestValues>({
        resolver: zodResolver(trainingRequestSchema),
        defaultValues: TRAINING_REQUEST_DEFAULTS,
    });

    // Detect Employee & Department via User Profile API
    useEffect(() => {
        if (!open) return;

        const detectUser = async () => {
            try {
                setDetectError(null);
                setDetectedEmp(null);

                // Lấy profile user hiện tại (departmentName)
                const profileRes = await apiClient.get('/api/User/profile');
                if (!profileRes.ok) {
                    setDetectError('Không thể lấy thông tin profile. Vui lòng đăng nhập lại.');
                    return;
                }
                const profile = await profileRes.json();
                const departmentName = profile?.departmentName || '';

                // Cần employeeId cho training request - search bằng email từ profile
                const email = profile?.email;
                if (!email) {
                    setDetectError('Không thể xác định email người dùng.');
                    return;
                }

                const empRes = await apiClient.get(`/api/Employees?search=${encodeURIComponent(email)}&pageSize=5`);
                if (empRes.ok) {
                    const data = await empRes.json();
                    const items = data.items || [];
                    const employee = items.find(
                        (item: { email?: string }) => item.email?.trim().toLowerCase() === email.trim().toLowerCase()
                    );
                    if (employee?.id) {
                        const empDeptName = departmentName || employee.departmentName || '';
                        setDetectedEmp({ id: employee.id, departmentName: empDeptName });
                        form.setValue('requestedById', employee.id);
                        return;
                    }
                }

                setDetectError('Không thể xác định thông tin nhân viên hiện tại. Vui lòng đăng nhập lại.');
            } catch (e) {
                const msg = e instanceof Error ? e.message : 'Lỗi không xác định';
                setDetectError(`Không thể xác định thông tin nhân viên hiện tại: ${msg}`);
            }
        };

        detectUser();
        if (initialData) {
            form.reset({
                requestedById: initialData.requestedById,
                subject: initialData.subject,
                urgency: initialData.urgency as 'Normal' | 'High' | 'Urgent',
                description: initialData.description || '',
                targetAudience: initialData.targetAudience || '',
                estimatedParticipants: initialData.estimatedParticipants || 1,
            });
        } else {
            form.reset(TRAINING_REQUEST_DEFAULTS);
        }
    }, [open, form, initialData]);

    const onSubmit: SubmitHandler<TrainingRequestValues> = async (values) => {
        if (!detectedEmp?.id && !initialData) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: detectError || 'Không thể xác định người gửi yêu cầu.',
            });
            return;
        }

        await execute(
            async () => {
                if (initialData) {
                    const res = await trainingService.updateRequest({
                        trainingRequestId: initialData.id,
                        ...values,
                    });
                    if (!res.ok) throw new Error('Cập nhật thất bại.');
                    return res;
                } else {
                    const res = await trainingService.createRequest({
                        ...values,
                        requestedById: detectedEmp!.id,
                    });
                    if (!res.ok) throw new Error('Tạo yêu cầu thất bại.');
                    return res;
                }
            },
            {
                successMessage: { 
                    title: 'Thành công', 
                    description: initialData ? 'Cập nhật yêu cầu đào tạo thành công.' : 'Yêu cầu đào tạo đã được gửi đi.' 
                },
                errorFallback: 'Không thể xử lý yêu cầu đào tạo. Vui lòng thử lại.',
                onSuccess: () => {
                    onOpenChange(false);
                    if (onSuccess) onSuccess();
                }
            }
        );
    };

    const isEditMode = !!initialData;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0F4C75] to-[#3282B8] px-6 py-8 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Send className="w-6 h-6" /> {isEditMode ? 'Cập Nhật Yêu Cầu' : 'Gửi Yêu Cầu Đào Tạo'}
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            {isEditMode 
                                ? 'Chỉnh sửa và nộp lại yêu cầu đào tạo theo phản hồi.'
                                : 'Điền các thông tin cần thiết để gửi yêu cầu đào tạo cho phòng ban của bạn.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="subject" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-[#0F4C75] font-semibold">Chủ đề đào tạo <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="Vd: Kỹ năng giao tiếp chuyên nghiệp" className="border-gray-200 focus:border-[#3282B8]" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="urgency" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Mức độ ưu tiên</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="border-gray-200">
                                                    <SelectValue placeholder="Chọn mức độ" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Normal">Bình thường</SelectItem>
                                                <SelectItem value="High">Cao</SelectItem>
                                                <SelectItem value="Urgent">Khẩn cấp</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormItem>
                                    <FormLabel className="text-[#0F4C75] font-semibold">Phòng ban</FormLabel>
                                    <div className="h-10 px-3 py-2 border border-gray-100 rounded-md bg-gray-50 text-sm text-gray-600 flex items-center font-medium">
                                        {detectedEmp?.departmentName || detectError || 'Đang xác định...'}
                                    </div>
                                </FormItem>

                                <FormField control={form.control} name="estimatedParticipants" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Số lượng học viên dự kiến</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    className="pl-9 border-gray-200"
                                                    placeholder="0"
                                                    {...field}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="targetAudience" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-[#0F4C75] font-semibold">Đối tượng học viên</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Vd: Toàn bộ nhân viên phòng Sales" className="border-gray-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel className="text-[#0F4C75] font-semibold">Mô tả/Mục tiêu đào tạo</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Nêu rõ lý do và mục tiêu cần đạt được sau khóa học..." className="min-h-[100px] border-gray-200" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <DialogFooter className="px-0 py-4 bg-transparent border-t flex items-center justify-between">
                                <div className="flex items-center text-xs text-gray-500 gap-1 italic">
                                    <Info className="w-3 h-3" /> Yêu cầu của bạn sẽ được gửi tới HR Manager để xem xét.
                                </div>
                                <div className="flex gap-3">
                                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="border-gray-300">
                                        Hủy
                                    </Button>
                                    <Button type="submit" className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white min-w-[120px]" disabled={isLoading || (!detectedEmp?.id && !isEditMode)}>
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                        {isEditMode ? 'Cập nhật' : 'Gửi yêu cầu'}
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
