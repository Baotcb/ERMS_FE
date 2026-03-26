'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Printer, X, Loader2, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';

import type { CertificateData } from './certificate/certificate-types';
import { CertificateTemplate } from './certificate/certificate-template';

export type { CertificateData };

interface CertificateExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: CertificateData;
}

export function CertificateExportDialog({ open, onOpenChange, data: initialData }: CertificateExportDialogProps) {
    const [formData, setFormData] = useState<CertificateData>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.5);

    // Auto-fetch profile data (department, enterprise) when dialog opens
    const fetchProfileData = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await apiClient.get('/api/User/profile');
            if (!res.ok) return;
            const profile = await res.json() as {
                fullName?: string;
                email?: string;
                departmentName?: string;
                enterpriseName?: string;
                enterpriseLogoUrl?: string;
            };
            setFormData(prev => ({
                ...prev,
                learnerName: prev.learnerName || profile.fullName || '',
                learnerEmail: prev.learnerEmail || profile.email || '',
                departmentName: prev.departmentName || profile.departmentName || '',
                companyName: prev.companyName || profile.enterpriseName || '',
                companyLogoUrl: prev.companyLogoUrl || profile.enterpriseLogoUrl || '',
            }));
        } catch { /* ignore */ }
        finally { setIsLoading(false); }
    }, []);

    const handleOpenChange = useCallback((isOpen: boolean) => {
        if (isOpen) {
            setFormData(initialData);
            void fetchProfileData();
        }
        onOpenChange(isOpen);
    }, [initialData, onOpenChange, fetchProfileData]);

    // Calculate responsive scale to fit container
    useEffect(() => {
        if (!open) return;
        const calcScale = () => {
            const container = containerRef.current;
            if (!container) return;
            const containerWidth = container.clientWidth - 32; // padding
            const certWidthPx = 297 * 3.7795; // 297mm in px
            const newScale = Math.min(containerWidth / certWidthPx, 0.65);
            setScale(newScale);
        };
        const timer = setTimeout(calcScale, 100);
        window.addEventListener('resize', calcScale);
        return () => { clearTimeout(timer); window.removeEventListener('resize', calcScale); };
    }, [open]);

    const handlePrint = () => {
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleDownloadPNG = async () => {
        const certElement = document.getElementById('certificate-print-area');
        if (!certElement) return;

        setIsDownloading(true);
        try {
            const html2canvas = (await import('html2canvas-pro')).default;

            // Temporarily remove transform for accurate capture
            const wrapper = certElement.closest('.print-transform-wrapper') as HTMLElement | null;
            const originalTransform = wrapper?.style.transform || '';
            const originalTransformOrigin = wrapper?.style.transformOrigin || '';
            if (wrapper) {
                wrapper.style.transform = 'scale(1)';
                wrapper.style.transformOrigin = 'top left';
            }

            // Wait for font to fully load
            await document.fonts.ready;

            const canvas = await html2canvas(certElement, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                // Ensure the full A4 landscape size is captured
                width: certElement.scrollWidth,
                height: certElement.scrollHeight,
            });

            // Restore transform
            if (wrapper) {
                wrapper.style.transform = originalTransform;
                wrapper.style.transformOrigin = originalTransformOrigin;
            }

            const dataUrl = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `Certificate_${formData.learnerName || 'user'}_${formData.courseCode || 'course'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error('[Cert] PNG download failed:', err);
        } finally {
            setIsDownloading(false);
        }
    };

    const certHeight = 210 * 3.7795 * scale; // scaled height in px

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {open && (
                <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 0;
                        }
                        body * {
                            visibility: hidden;
                        }
                        #certificate-print-area, #certificate-print-area * {
                            visibility: visible;
                        }
                        #certificate-print-area {
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 297mm !important;
                            height: 210mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            transform: scale(1) !important;
                            z-index: 99999 !important;
                        }
                        .print-transform-wrapper {
                            transform: scale(1) !important;
                        }
                        [data-radix-focus-guard], [role="dialog"] button {
                            display: none !important;
                        }
                    }
                `}} />
            )}
            <DialogContent className="max-w-[95vw] w-full lg:max-w-5xl max-h-[90vh] p-0 bg-gray-50 flex flex-col overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-2 shrink-0">
                    <DialogTitle className="text-lg font-black text-[#0F4C75] flex items-center gap-2">
                        🏆 Chứng chỉ hoàn thành
                    </DialogTitle>
                    <DialogDescription>Xem, in hoặc tải chứng chỉ dưới dạng PDF / ảnh PNG</DialogDescription>
                </DialogHeader>

                {/* Certificate Preview */}
                <div ref={containerRef} className="px-4 pb-2 flex-1 overflow-y-auto min-h-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-6 h-6 animate-spin text-[#0F4C75]" />
                            <span className="ml-2 text-sm text-gray-500">Đang tải thông tin...</span>
                        </div>
                    ) : (
                        <div
                            ref={previewRef}
                            className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white"
                            style={{ height: `${certHeight + 16}px` }}
                        >
                            <div className="print-transform-wrapper" style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'top center',
                                width: '297mm',
                                height: '210mm',
                                margin: '0 auto',
                            }}>
                                <CertificateTemplate data={formData} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 bg-white shrink-0">
                    <Button variant="ghost" onClick={() => handleOpenChange(false)} className="text-gray-500">
                        <X className="w-4 h-4 mr-1" /> Đóng
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleDownloadPNG}
                            disabled={isDownloading}
                            variant="outline"
                            className="border-[#0F4C75] text-[#0F4C75] px-5"
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Download className="w-4 h-4 mr-1.5" />}
                            Tải ảnh PNG
                        </Button>
                        <Button onClick={handlePrint} className="bg-[#0F4C75] hover:bg-[#1B262C] text-white px-5">
                            <Printer className="w-4 h-4 mr-1.5" /> In / Lưu PDF
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
