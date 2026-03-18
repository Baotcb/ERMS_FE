'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Camera, CheckCircle2, ImagePlus, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { workshopService } from '@/features/hr/api/workshop-service';
import { CLOUDINARY_CONFIG } from '@/lib/cloudinary/cloudinary-config';

interface WorkshopConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseName: string;
    onConfirmed?: () => void;
}

export function WorkshopConfirmationDialog({
    open, onOpenChange, courseId, courseName, onConfirmed,
}: WorkshopConfirmationDialogProps) {
    const { toast } = useToast();
    const [photos, setPhotos] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const uploadToCloudinary = async (file: File): Promise<string> => {
        if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
            throw new Error('Thiếu cấu hình Cloudinary.');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
            { method: 'POST', body: formData }
        );

        if (!res.ok) throw new Error('Upload ảnh thất bại.');
        const data = await res.json() as { secure_url?: string };
        if (!data.secure_url) throw new Error('Không nhận được URL ảnh.');
        return data.secure_url;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setIsUploading(true);
        try {
            const uploaded = await Promise.all(files.map(uploadToCloudinary));
            setPhotos(prev => [...prev, ...uploaded]);
            toast({ description: `Đã upload ${uploaded.length} ảnh.` });
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Không thể upload ảnh.';
            toast({ title: 'Lỗi upload', description: msg, variant: 'destructive' });
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (photos.length === 0) {
            toast({
                title: 'Thiếu ảnh minh chứng',
                description: 'Vui lòng upload ít nhất 1 ảnh workshop trước khi xác nhận.',
                variant: 'destructive',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await workshopService.confirmWorkshopCompletion(courseId, {
                evidencePhotoUrls: photos,
                notes: notes || undefined,
            });
            toast({
                title: 'Xác nhận thành công!',
                description: 'Workshop đã được xác nhận hoàn thành. Các trainee giờ có thể làm bài kiểm tra.',
            });
            onOpenChange(false);
            onConfirmed?.();
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Không thể xác nhận workshop.';
            toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#0F4C75] flex items-center gap-2">
                        <Camera className="w-6 h-6" />
                        Xác nhận hoàn thành Workshop
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Xác nhận rằng workshop <strong className="text-gray-700">{courseName}</strong> đã diễn ra thành công.
                        Upload ảnh minh chứng để trainee có thể làm bài kiểm tra.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Photo upload area */}
                    <div className="space-y-3">
                        <Label className="text-sm font-bold text-gray-700">
                            Ảnh minh chứng workshop <span className="text-red-500">*</span>
                        </Label>

                        {photos.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                                {photos.map((url, i) => (
                                    <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video">
                                        <Image src={url} alt={`Workshop ${i + 1}`} fill className="object-cover" unoptimized />
                                        <button
                                            onClick={() => handleRemovePhoto(i)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <label
                            htmlFor="workshop-photos"
                            className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/40 hover:bg-blue-50 hover:border-blue-300 transition-all cursor-pointer"
                        >
                            {isUploading ? (
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            ) : (
                                <ImagePlus className="w-8 h-8 text-blue-400" />
                            )}
                            <div className="text-center">
                                <p className="font-bold text-[#0F4C75]">
                                    {isUploading ? 'Đang upload...' : 'Kéo thả hoặc nhấn để chọn ảnh'}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG tối đa 10MB mỗi ảnh</p>
                            </div>
                        </label>
                        <input
                            id="workshop-photos"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Ghi chú (tùy chọn)</Label>
                        <Textarea
                            placeholder="VD: Workshop diễn ra tốt đẹp, 25/30 trainee tham dự..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[80px] rounded-xl border-gray-200"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-3">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploading || photos.length === 0}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 font-bold gap-2 shadow-lg shadow-green-200"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4" />
                        )}
                        Xác nhận hoàn thành
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
