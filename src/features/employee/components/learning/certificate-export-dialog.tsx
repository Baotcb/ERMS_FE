'use client';

import { useState, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Printer, Eye, Edit3, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

/* ─────────────────────────── Types ─────────────────────────── */

export interface CertificateData {
    learnerName: string;
    learnerEmail: string;
    departmentName: string;
    courseName: string;
    courseCode: string;
    trainerName: string;
    score: number;
    completionDate: string; // yyyy-MM-dd
}

interface CertificateExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: CertificateData;
}

/* ──────────────────── Certificate Template ──────────────────── */

function CertificateTemplate({ data }: { data: CertificateData }) {
    const displayDate = (() => {
        try {
            return format(new Date(data.completionDate), "dd 'tháng' MM 'năm' yyyy", { locale: vi });
        } catch {
            return data.completionDate;
        }
    })();

    return (
        <div
            id="certificate-print-area"
            className="certificate-page"
            style={{
                width: '297mm',
                minHeight: '210mm',
                padding: '0',
                margin: '0 auto',
                background: '#fff',
                position: 'relative',
                fontFamily: "'Noto Serif', 'Roboto', serif",
                overflow: 'hidden',
                boxSizing: 'border-box',
            }}
        >
            {/* Outer border */}
            <div style={{
                position: 'absolute', inset: '8mm',
                border: '3px solid #0F4C75',
                borderRadius: '4px',
                pointerEvents: 'none',
            }} />

            {/* Inner border */}
            <div style={{
                position: 'absolute', inset: '11mm',
                border: '1px solid #3282B8',
                borderRadius: '2px',
                pointerEvents: 'none',
            }} />

            {/* Corner decorations */}
            {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((corner) => {
                const isTop = corner.includes('top');
                const isLeft = corner.includes('left');
                return (
                    <div
                        key={corner}
                        style={{
                            position: 'absolute',
                            [isTop ? 'top' : 'bottom']: '12mm',
                            [isLeft ? 'left' : 'right']: '12mm',
                            width: '25mm',
                            height: '25mm',
                            borderTop: isTop ? '2px solid #BBE1FA' : 'none',
                            borderBottom: !isTop ? '2px solid #BBE1FA' : 'none',
                            borderLeft: isLeft ? '2px solid #BBE1FA' : 'none',
                            borderRight: !isLeft ? '2px solid #BBE1FA' : 'none',
                            pointerEvents: 'none',
                        }}
                    />
                );
            })}

            {/* Content */}
            <div style={{
                padding: '20mm 30mm 18mm',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '210mm',
                boxSizing: 'border-box',
                textAlign: 'center',
            }}>
                {/* Company header */}
                <div style={{ marginBottom: '4mm' }}>
                    <div style={{
                        width: '18mm', height: '18mm',
                        margin: '0 auto 3mm',
                        background: 'linear-gradient(135deg, #0F4C75, #3282B8)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '24px', fontWeight: 'bold',
                    }}>
                        E
                    </div>
                    <p style={{ fontSize: '10px', letterSpacing: '3px', color: '#3282B8', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>
                        ERMS • Enterprise Resource Management System
                    </p>
                </div>

                {/* Divider */}
                <div style={{
                    width: '60%', height: '1px',
                    background: 'linear-gradient(90deg, transparent, #3282B8, transparent)',
                    margin: '5mm 0',
                }} />

                {/* Title */}
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#0F4C75',
                    letterSpacing: '6px',
                    textTransform: 'uppercase',
                    margin: '0 0 2mm',
                }}>
                    Chứng Nhận
                </h1>
                <p style={{
                    fontSize: '14px',
                    letterSpacing: '4px',
                    color: '#666',
                    textTransform: 'uppercase',
                    margin: '0 0 8mm',
                }}>
                    Hoàn Thành Khóa Đào Tạo
                </p>

                {/* Certification text */}
                <p style={{ fontSize: '13px', color: '#555', margin: '0 0 4mm', fontStyle: 'italic' }}>
                    Chứng nhận rằng
                </p>

                {/* Learner name */}
                <h2 style={{
                    fontSize: '36px',
                    fontWeight: 700,
                    color: '#0F4C75',
                    margin: '0 0 2mm',
                    borderBottom: '2px solid #BBE1FA',
                    paddingBottom: '3mm',
                    display: 'inline-block',
                    minWidth: '60%',
                }}>
                    {data.learnerName || 'Họ và Tên'}
                </h2>

                {data.departmentName && (
                    <p style={{ fontSize: '12px', color: '#888', margin: '2mm 0 0' }}>
                        Bộ phận: {data.departmentName}
                    </p>
                )}

                {/* Course info */}
                <p style={{ fontSize: '13px', color: '#555', margin: '6mm 0 3mm', fontStyle: 'italic' }}>
                    Đã hoàn thành xuất sắc khóa đào tạo
                </p>

                <h3 style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#1B262C',
                    margin: '0 0 2mm',
                }}>
                    &ldquo;{data.courseName}&rdquo;
                </h3>

                <p style={{ fontSize: '11px', color: '#999', margin: '0 0 5mm', letterSpacing: '1px' }}>
                    Mã khóa: {data.courseCode}
                </p>

                {/* Score and date */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12mm',
                    margin: '0 0 8mm',
                    fontSize: '13px',
                    color: '#333',
                }}>
                    <span>Điểm đạt: <strong style={{ color: '#0F4C75', fontSize: '16px' }}>{data.score}%</strong></span>
                    <span style={{ color: '#ccc' }}>|</span>
                    <span>Ngày hoàn thành: <strong>{displayDate}</strong></span>
                </div>

                {/* Divider */}
                <div style={{
                    width: '40%', height: '1px',
                    background: 'linear-gradient(90deg, transparent, #ddd, transparent)',
                    margin: '2mm 0 8mm',
                }} />

                {/* Signatures */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '75%',
                    margin: '0 auto',
                }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{
                            width: '50mm', height: '0.5px',
                            background: '#999',
                            margin: '0 auto 2mm',
                        }} />
                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#0F4C75', margin: '0 0 1mm' }}>
                            {data.trainerName || 'Giảng viên'}
                        </p>
                        <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>Giảng viên</p>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{
                            width: '50mm', height: '0.5px',
                            background: '#999',
                            margin: '0 auto 2mm',
                        }} />
                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#0F4C75', margin: '0 0 1mm' }}>
                            Phòng Nhân sự
                        </p>
                        <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>Xác nhận</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ──────────────────── Main Dialog Component ──────────────────── */

export function CertificateExportDialog({ open, onOpenChange, data: initialData }: CertificateExportDialogProps) {
    const [formData, setFormData] = useState<CertificateData>(initialData);
    const [mode, setMode] = useState<'form' | 'preview'>('form');
    const printFrameRef = useRef<HTMLIFrameElement | null>(null);

    // Sync when dialog opens with new data
    const handleOpenChange = useCallback((isOpen: boolean) => {
        if (isOpen) {
            setFormData(initialData);
            setMode('form');
        }
        onOpenChange(isOpen);
    }, [initialData, onOpenChange]);

    const updateField = (field: keyof CertificateData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePrint = () => {
        const printContent = document.getElementById('certificate-print-area');
        if (!printContent) return;

        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-10000px';
        iframe.style.left = '-10000px';
        iframe.style.width = '297mm';
        iframe.style.height = '210mm';
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) { document.body.removeChild(iframe); return; }

        doc.open();
        doc.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Chứng nhận - ${formData.learnerName}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Roboto:wght@400;500;700&display=swap&subset=vietnamese" rel="stylesheet" />
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { margin: 0; padding: 0; font-family: 'Noto Serif', 'Roboto', serif; }
    </style>
</head>
<body>${printContent.outerHTML}</body>
</html>`);
        doc.close();

        iframe.onload = () => {
            setTimeout(() => {
                iframe.contentWindow?.print();
                setTimeout(() => { document.body.removeChild(iframe); }, 1000);
            }, 500);
        };

        // Fallback if onload doesn't fire
        setTimeout(() => {
            try { iframe.contentWindow?.print(); } catch { /* ignore */ }
            setTimeout(() => {
                try { document.body.removeChild(iframe); } catch { /* ignore */ }
            }, 1000);
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-white">
                <DialogHeader className="px-6 pt-6 pb-0">
                    <DialogTitle className="text-xl font-bold text-[#0F4C75] flex items-center gap-2">
                        📜 Xuất chứng chỉ hoàn thành
                    </DialogTitle>
                    <DialogDescription>
                        Kiểm tra thông tin và xuất chứng chỉ dưới dạng PDF
                    </DialogDescription>
                </DialogHeader>

                {/* Tab switcher */}
                <div className="px-6 pt-3">
                    <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
                        <button
                            onClick={() => setMode('form')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                                mode === 'form' ? 'bg-white text-[#0F4C75] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                        </button>
                        <button
                            onClick={() => setMode('preview')}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                                mode === 'preview' ? 'bg-white text-[#0F4C75] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Eye className="w-3.5 h-3.5" /> Xem trước
                        </button>
                    </div>
                </div>

                {/* Form mode */}
                {mode === 'form' && (
                    <div className="px-6 pb-6 space-y-5">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 space-y-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Thông tin học viên — có thể chỉnh sửa</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-[#0F4C75]">Họ và tên <span className="text-red-400">*</span></label>
                                    <Input
                                        value={formData.learnerName}
                                        onChange={(e) => updateField('learnerName', e.target.value)}
                                        placeholder="Nhập họ và tên đầy đủ"
                                        className="border-gray-200 focus:border-[#3282B8]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-[#0F4C75]">Email</label>
                                    <Input
                                        value={formData.learnerEmail}
                                        readOnly
                                        className="border-gray-200 bg-gray-50 text-gray-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-[#0F4C75]">Bộ phận</label>
                                    <Input
                                        value={formData.departmentName}
                                        onChange={(e) => updateField('departmentName', e.target.value)}
                                        placeholder="Nhập tên bộ phận"
                                        className="border-gray-200 focus:border-[#3282B8]"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-[#0F4C75]">Ngày hoàn thành</label>
                                    <Input
                                        type="date"
                                        value={formData.completionDate}
                                        onChange={(e) => updateField('completionDate', e.target.value)}
                                        className="border-gray-200 focus:border-[#3282B8]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5 space-y-4">
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-400">Thông tin khóa học — tự động điền</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-[#0F4C75]">Tên khóa học</label>
                                    <Input value={formData.courseName} readOnly className="border-gray-200 bg-gray-50 text-gray-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-[#0F4C75]">Mã khóa</label>
                                    <Input value={formData.courseCode} readOnly className="border-gray-200 bg-gray-50 text-gray-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-[#0F4C75]">Giảng viên</label>
                                    <Input value={formData.trainerName} readOnly className="border-gray-200 bg-gray-50 text-gray-500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-[#0F4C75]">Điểm đạt</label>
                                    <Input value={`${formData.score}%`} readOnly className="border-gray-200 bg-gray-50 text-gray-500 font-bold" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <Button variant="ghost" onClick={() => handleOpenChange(false)} className="text-gray-500">
                                <X className="w-4 h-4 mr-1" /> Đóng
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setMode('preview')}
                                    className="border-[#0F4C75] text-[#0F4C75]"
                                >
                                    <Eye className="w-4 h-4 mr-1" /> Xem trước
                                </Button>
                                <Button
                                    onClick={() => { setMode('preview'); setTimeout(handlePrint, 300); }}
                                    className="bg-[#0F4C75] hover:bg-[#1B262C] text-white"
                                >
                                    <Printer className="w-4 h-4 mr-1" /> In chứng chỉ
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Preview mode */}
                {mode === 'preview' && (
                    <div className="px-6 pb-6 space-y-4">
                        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-inner bg-gray-100 p-4">
                            <div className="overflow-x-auto">
                                <div style={{ transform: 'scale(0.55)', transformOrigin: 'top left', width: '297mm', height: '210mm' }}>
                                    <CertificateTemplate data={formData} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Button variant="ghost" onClick={() => setMode('form')} className="text-gray-500">
                                <Edit3 className="w-4 h-4 mr-1" /> Quay lại chỉnh sửa
                            </Button>
                            <Button
                                onClick={handlePrint}
                                className="bg-[#0F4C75] hover:bg-[#1B262C] text-white px-6"
                            >
                                <Printer className="w-4 h-4 mr-1" /> In / Lưu PDF
                            </Button>
                        </div>
                    </div>
                )}

                {/* Hidden iframe for print */}
                <iframe ref={printFrameRef} style={{ display: 'none' }} title="print-frame" />
            </DialogContent>
        </Dialog>
    );
}
