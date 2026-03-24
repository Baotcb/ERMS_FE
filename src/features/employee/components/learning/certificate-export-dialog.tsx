'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Printer, X, Loader2 } from 'lucide-react';

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
                departmentName?: string;
                enterpriseName?: string;
                enterpriseLogoUrl?: string;
            };
            setFormData(prev => ({
                ...prev,
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
        // Delay to ensure dialog is rendered
        const timer = setTimeout(calcScale, 100);
        window.addEventListener('resize', calcScale);
        return () => { clearTimeout(timer); window.removeEventListener('resize', calcScale); };
    }, [open]);

    const handlePrint = () => {
        const printContent = document.getElementById('certificate-print-area');
        if (!printContent) return;

        const iframe = document.createElement('iframe');
        Object.assign(iframe.style, { position: 'fixed', top: '-10000px', left: '-10000px', width: '297mm', height: '210mm' });
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) { document.body.removeChild(iframe); return; }

        doc.open();
        doc.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Chứng nhận - ${formData.learnerName}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;500;700&display=swap&subset=vietnamese" rel="stylesheet"/>
<style>@page{size:A4 landscape;margin:0}*{margin:0;padding:0;box-sizing:border-box}body{margin:0;padding:0;font-family:'Noto Serif','Roboto',serif}</style>
</head><body>${printContent.outerHTML}</body></html>`);
        doc.close();

        iframe.onload = () => {
            setTimeout(() => { iframe.contentWindow?.print(); setTimeout(() => { document.body.removeChild(iframe); }, 1000); }, 500);
        };
        setTimeout(() => {
            try { iframe.contentWindow?.print(); } catch { /* ignore */ }
            setTimeout(() => { try { document.body.removeChild(iframe); } catch { /* ignore */ } }, 1000);
        }, 2000);
    };

    const certHeight = 210 * 3.7795 * scale; // scaled height in px

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[95vw] w-full lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-gray-50">
                <DialogHeader className="px-5 pt-5 pb-2">
                    <DialogTitle className="text-lg font-black text-[#0F4C75] flex items-center gap-2">
                        🏆 Chứng chỉ hoàn thành
                    </DialogTitle>
                    <DialogDescription>Xem và in chứng chỉ dưới dạng PDF</DialogDescription>
                </DialogHeader>

                {/* Certificate Preview — fills dialog width */}
                <div ref={containerRef} className="px-4 pb-2">
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
                            <div style={{
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
                <div className="flex items-center justify-between px-5 pb-5 pt-1">
                    <Button variant="ghost" onClick={() => handleOpenChange(false)} className="text-gray-500">
                        <X className="w-4 h-4 mr-1" /> Đóng
                    </Button>
                    <div className="flex gap-2">
                        <Button onClick={handlePrint} className="bg-[#0F4C75] hover:bg-[#1B262C] text-white px-5">
                            <Printer className="w-4 h-4 mr-1.5" /> In / Lưu PDF
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
