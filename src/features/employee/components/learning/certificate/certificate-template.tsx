'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { CertificateData } from './certificate-types';

/** Print-ready A4 landscape certificate with borders, logo, signatures. */
export function CertificateTemplate({ data }: { data: CertificateData }) {
    const displayDate = (() => {
        try { return format(new Date(data.completionDate), "dd 'tháng' MM 'năm' yyyy", { locale: vi }); }
        catch { return data.completionDate; }
    })();

    return (
        <div
            id="certificate-print-area"
            className="certificate-page"
            style={{
                width: '297mm', minHeight: '210mm', padding: 0, margin: '0 auto',
                background: '#fff', position: 'relative',
                fontFamily: "'Noto Serif', 'Roboto', serif",
                overflow: 'hidden', boxSizing: 'border-box',
            }}
        >
            {/* Outer border */}
            <div style={{ position: 'absolute', inset: '8mm', border: '3px solid #0F4C75', borderRadius: '4px', pointerEvents: 'none' }} />
            {/* Inner border */}
            <div style={{ position: 'absolute', inset: '11mm', border: '1px solid #3282B8', borderRadius: '2px', pointerEvents: 'none' }} />

            {/* Corner decorations */}
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((corner) => {
                const isTop = corner.includes('top');
                const isLeft = corner.includes('left');
                return (
                    <div key={corner} style={{
                        position: 'absolute',
                        [isTop ? 'top' : 'bottom']: '12mm', [isLeft ? 'left' : 'right']: '12mm',
                        width: '25mm', height: '25mm',
                        borderTop: isTop ? '2px solid #BBE1FA' : 'none',
                        borderBottom: !isTop ? '2px solid #BBE1FA' : 'none',
                        borderLeft: isLeft ? '2px solid #BBE1FA' : 'none',
                        borderRight: !isLeft ? '2px solid #BBE1FA' : 'none',
                        pointerEvents: 'none',
                    }} />
                );
            })}

            {/* Content */}
            <div style={{
                padding: '20mm 30mm 18mm', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', minHeight: '210mm',
                boxSizing: 'border-box', textAlign: 'center',
            }}>
                {/* Logo + Company Name */}
                <div style={{ marginBottom: '4mm' }}>
                    {data.companyLogoUrl ? (
                        <img
                            src={data.companyLogoUrl}
                            alt={data.companyName || 'Company Logo'}
                            style={{ width: '20mm', height: '20mm', objectFit: 'contain', margin: '0 auto 3mm', display: 'block' }}
                        />
                    ) : (
                        <div style={{
                            width: '18mm', height: '18mm', margin: '0 auto 3mm',
                            background: 'linear-gradient(135deg, #0F4C75, #3282B8)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '24px', fontWeight: 'bold',
                        }}>{(data.companyName || 'E').charAt(0).toUpperCase()}</div>
                    )}
                    <p style={{ fontSize: '12px', letterSpacing: '3px', color: '#0F4C75', textTransform: 'uppercase', fontWeight: 700, margin: 0 }}>
                        {data.companyName || 'ERMS'}
                    </p>
                    <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#999', textTransform: 'uppercase', margin: '1mm 0 0' }}>
                        Certificate of Completion
                    </p>
                </div>

                <div style={{ width: '60%', height: '1px', background: 'linear-gradient(90deg, transparent, #3282B8, transparent)', margin: '5mm 0' }} />

                <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#0F4C75', letterSpacing: '6px', textTransform: 'uppercase', margin: '0 0 2mm' }}>
                    Chứng Nhận
                </h1>
                <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#666', textTransform: 'uppercase', margin: '0 0 8mm' }}>
                    Hoàn Thành Khóa Đào Tạo
                </p>

                <p style={{ fontSize: '13px', color: '#555', margin: '0 0 4mm', fontStyle: 'italic' }}>Chứng nhận rằng</p>

                <h2 style={{
                    fontSize: '36px', fontWeight: 700, color: '#0F4C75', margin: '0 0 2mm',
                    borderBottom: '2px solid #BBE1FA', paddingBottom: '3mm', display: 'inline-block', minWidth: '60%',
                }}>{data.learnerName || 'Họ và Tên'}</h2>

                {data.departmentName && (
                    <p style={{ fontSize: '12px', color: '#888', margin: '2mm 0 0' }}>Bộ phận: {data.departmentName}</p>
                )}

                <p style={{ fontSize: '13px', color: '#555', margin: '6mm 0 3mm', fontStyle: 'italic' }}>Đã hoàn thành xuất sắc khóa đào tạo</p>

                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1B262C', margin: '0 0 2mm' }}>
                    &ldquo;{data.courseName}&rdquo;
                </h3>
                <p style={{ fontSize: '11px', color: '#999', margin: '0 0 5mm', letterSpacing: '1px' }}>Mã khóa: {data.courseCode}</p>

                {/* Score & date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12mm', margin: '0 0 8mm', fontSize: '13px', color: '#333' }}>
                    <span>Điểm đạt: <strong style={{ color: '#0F4C75', fontSize: '16px' }}>{data.score}%</strong></span>
                    <span style={{ color: '#ccc' }}>|</span>
                    <span>Ngày hoàn thành: <strong>{displayDate}</strong></span>
                </div>

                <div style={{ width: '40%', height: '1px', background: 'linear-gradient(90deg, transparent, #ddd, transparent)', margin: '2mm 0 8mm' }} />

                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '75%', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ width: '50mm', height: '0.5px', background: '#999', margin: '0 auto 2mm' }} />
                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#0F4C75', margin: '0 0 1mm' }}>{data.trainerName || 'Giảng viên'}</p>
                        <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>Giảng viên</p>
                    </div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ width: '50mm', height: '0.5px', background: '#999', margin: '0 auto 2mm' }} />
                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#0F4C75', margin: '0 0 1mm' }}>Phòng Nhân sự</p>
                        <p style={{ fontSize: '10px', color: '#999', margin: 0 }}>Xác nhận</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
