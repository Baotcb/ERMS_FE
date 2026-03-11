'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, DollarSign, Users, Info, Send } from 'lucide-react';

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
import { apiClient } from '@/lib/api-client';
import { getCookie } from '@/features/core/auth/utils/auth-cookies';
import { useAuth } from '@/features/core/auth/hooks/use-auth';
import { STORAGE_KEYS } from '@/utils/constants';

import { trainingService } from '../../api/training-service';
import { 
    trainingRequestSchema, 
    type TrainingRequestValues, 
    type TrainingRequestFormProps, 
    TRAINING_REQUEST_DEFAULTS 
} from './training-request-types';

export function TrainingRequestForm({ open, onOpenChange, onSuccess }: TrainingRequestFormProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [detectedEmp, setDetectedEmp] = useState<{ id: string; departmentName: string } | null>(null);
    const [detectError, setDetectError] = useState<string | null>(null);

    const form = useForm<TrainingRequestValues>({
        resolver: zodResolver(trainingRequestSchema),
        defaultValues: TRAINING_REQUEST_DEFAULTS,
    });

    const detectEmployeeFromItems = (
        items: Array<{ id?: string; email?: string; fullName?: string; departmentName?: string }>,
        email?: string,
        fullName?: string
    ) => {
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedName = fullName?.trim().toLowerCase();

        return items.find((item) =>
            normalizedEmail && item.email?.trim().toLowerCase() === normalizedEmail
        ) || items.find((item) =>
            normalizedName && item.fullName?.trim().toLowerCase() === normalizedName
        ) || null;
    };

    // Detect Employee & Department
    useEffect(() => {
        if (!open) return;
        
        const detectUser = async () => {
            try {
                setDetectError(null);
                setDetectedEmp(null);
                const userNameEncoded = getCookie(STORAGE_KEYS.USER_NAME);
                const cookieFullName = userNameEncoded ? decodeURIComponent(userNameEncoded) : '';
                const emailCandidates = [user?.email].filter(Boolean) as string[];
                const nameCandidates = [user?.fullName, cookieFullName].filter(Boolean) as string[];

                for (const email of emailCandidates) {
                    const res = await apiClient.get(`/api/Employees?search=${encodeURIComponent(email)}&pageSize=20`);
                    if (!res.ok) {
                        continue;
                    }

                    const data = await res.json();
                    const employee = detectEmployeeFromItems(data.items || [], email, user?.fullName || cookieFullName);
                    if (employee?.id) {
                        setDetectedEmp({
                            id: employee.id,
                            departmentName: employee.departmentName || '',
                        });
                        form.setValue('requestedById', employee.id);
                        return;
                    }
                }

                for (const fullName of nameCandidates) {
                    const res = await apiClient.get(`/api/Employees?search=${encodeURIComponent(fullName)}&pageSize=20`);
                    if (!res.ok) {
                        continue;
                    }

                    const data = await res.json();
                    const employee = detectEmployeeFromItems(data.items || [], user?.email, fullName);
                    if (employee?.id) {
                        setDetectedEmp({
                            id: employee.id,
                            departmentName: employee.departmentName || '',
                        });
                        form.setValue('requestedById', employee.id);
                        return;
                    }
                }

                setDetectError('Không thể xác định thông tin nhân viên hiện tại. Vui lòng đăng nhập lại.');
            } catch (e) {
                void e;
                setDetectError('Không thể xác định thông tin nhân viên hiện tại. Vui lòng thử lại.');
            }
        };

        detectUser();
        form.reset(TRAINING_REQUEST_DEFAULTS);
    }, [open, form, user?.email, user?.fullName]);

    const onSubmit: SubmitHandler<TrainingRequestValues> = async (values) => {
        if (!detectedEmp?.id) {
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: detectError || 'Không thể xác định người gửi yêu cầu.',
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await trainingService.createRequest({
                ...values,
                requestedById: detectedEmp.id,
            });

            if (res.ok) {
                toast({
                    title: 'Thành công',
                    description: 'Yêu cầu đào tạo đã được gửi đi.',
                });
                onOpenChange(false);
                if (onSuccess) onSuccess();
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Lỗi',
                    description: 'Không thể gửi yêu cầu.',
                });
            }
        } catch (error) {
            void error;
            toast({
                variant: 'destructive',
                title: 'Lỗi',
                description: 'Không thể gửi yêu cầu đào tạo. Vui lòng thử lại.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden bg-white border-none shadow-2xl">
                <div className="bg-gradient-to-r from-[#0F4C75] to-[#3282B8] px-6 py-8 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <Send className="w-6 h-6" /> Gửi Yêu Cầu Đào Tạo
                        </DialogTitle>
                        <DialogDescription className="text-blue-100">
                            Điền các thông tin cần thiết để gửi yêu cầu đào tạo cho phòng ban của bạn.
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

                                <FormField control={form.control} name="estimatedBudget" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#0F4C75] font-semibold">Ngân sách dự kiến (VNĐ)</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
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
                        </form>
                    </Form>
                </div>

                <DialogFooter className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500 gap-1 italic">
                        <Info className="w-3 h-3" /> Yêu cầu của bạn sẽ được gửi tới HR Manager để xem xét.
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="border-gray-300">
                            Hủy
                        </Button>
                        <Button className="bg-[#0F4C75] hover:bg-[#1A5F8C] text-white min-w-[120px]" disabled={isLoading || !detectedEmp?.id} onClick={form.handleSubmit(onSubmit)}>
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Gửi yêu cầu
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
