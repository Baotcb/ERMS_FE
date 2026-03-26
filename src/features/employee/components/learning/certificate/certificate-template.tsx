'use client';

import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { CertificateData } from './certificate-types';

/**
 * Print-ready A4 landscape certificate.
 * Uses inline styles exclusively (no Tailwind) so html2canvas captures everything correctly.
 * Font: Noto Serif (Google Fonts) — full Vietnamese diacritics support.
 */
export function CertificateTemplate({ data }: { data: CertificateData }) {
    const displayDate = (() => {
        try { return format(new Date(data.completionDate), "dd 'tháng' MM 'năm' yyyy", { locale: vi }); }
        catch { return data.completionDate; }
    })();

    return (
        <>
            {/* Load Noto Serif Vietnamese from Google Fonts */}
            {/* eslint-disable-next-line @next/next/no-css-tagged-template-in-component */}
            <style dangerouslySetInnerHTML={{ __html: `
                @import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700&display=swap');
            `}} />

            <div
                id="certificate-print-area"
                style={{
                    width: '297mm',
                    minHeight: '210mm',
                    padding: 0,
                    margin: '0 auto',
                    background: '#ffffff',
                    position: 'relative',
                    fontFamily: "'Noto Serif', 'Georgia', serif",
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                }}
            >
                {/* Outer border */}
                <div style={{
                    position: 'absolute', inset: '8mm',
                    border: '3px solid #0F4C75', borderRadius: '4px',
                    pointerEvents: 'none',
                }} />
                {/* Inner border */}
                <div style={{
                    position: 'absolute', inset: '11mm',
                    border: '1px solid #3282B8', borderRadius: '2px',
                    pointerEvents: 'none',
                }} />

                {/* Corner decorations */}
                {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((corner) => {
                    const isTop = corner.includes('top');
                    const isLeft = corner.includes('left');
                    return (
                        <div key={corner} style={{
                            position: 'absolute',
                            [isTop ? 'top' : 'bottom']: '12mm',
                            [isLeft ? 'left' : 'right']: '12mm',
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
                    paddingTop: '20mm', paddingBottom: '18mm',
                    paddingLeft: '30mm', paddingRight: '30mm',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    minHeight: '210mm', boxSizing: 'border-box',
                    textAlign: 'center', position: 'relative', zIndex: 10,
                }}>
                    {/* Logo + Company */}
                    <div style={{ marginBottom: '4mm' }}>
                        {data.companyLogoUrl ? (
                            <img
                                src={data.companyLogoUrl}
                                alt={data.companyName || 'Company Logo'}
                                style={{ width: '20mm', height: '20mm', objectFit: 'contain', display: 'block', margin: '0 auto 3mm auto' }}
                            />
                        ) : (
                            <div style={{
                                width: '18mm', height: '18mm', margin: '0 auto 3mm auto',
                                background: 'linear-gradient(135deg, #0F4C75, #3282B8)',
                                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '24px', fontWeight: 'bold',
                            }}>
                                {(data.companyName || 'E').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <p style={{ fontSize: '12px', letterSpacing: '3px', color: '#0F4C75', textTransform: 'uppercase', fontWeight: 'bold', margin: 0 }}>
                            {data.companyName || 'ERMS'}
                        </p>
                        <p style={{ fontSize: '9px', letterSpacing: '2px', color: '#999', textTransform: 'uppercase', marginTop: '1mm', marginBottom: 0 }}>
                            Certificate of Completion
                        </p>
                    </div>

                    {/* Divider */}
                    <div style={{ width: '60%', height: '1px', background: 'linear-gradient(to right, transparent, #3282B8, transparent)', margin: '5mm 0' }} />

                    {/* Title */}
                    <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0F4C75', letterSpacing: '6px', textTransform: 'uppercase', margin: '0 0 2mm 0' }}>
                        Chứng Nhận
                    </h1>
                    <p style={{ fontSize: '14px', letterSpacing: '4px', color: '#777', textTransform: 'uppercase', margin: '0 0 8mm 0' }}>
                        Hoàn Thành Khóa Đào Tạo
                    </p>

                    <p style={{ fontSize: '13px', color: '#666', margin: '0 0 4mm 0', fontStyle: 'italic' }}>Chứng nhận rằng</p>

                    {/* Learner Name */}
                    <h2 style={{
                        fontSize: '36px', fontWeight: 'bold', color: '#0F4C75',
                        margin: '0 0 2mm 0', borderBottom: '2px solid #BBE1FA',
                        paddingBottom: '3mm', display: 'inline-block', minWidth: '60%',
                    }}>
                        {data.learnerName || 'Họ và Tên'}
                    </h2>

                    {data.departmentName && (
                        <p style={{ fontSize: '12px', color: '#aaa', marginTop: '2mm', marginBottom: 0 }}>Bộ phận: {data.departmentName}</p>
                    )}

                    <p style={{ fontSize: '13px', color: '#666', marginTop: '6mm', marginBottom: '3mm', fontStyle: 'italic' }}>
                        Đã hoàn thành xuất sắc khóa đào tạo
                    </p>

                    {/* Course Name */}
                    <h3 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1B262C', margin: '0 0 2mm 0' }}>
                        &ldquo;{data.courseName}&rdquo;
                    </h3>
                    <p style={{ fontSize: '11px', color: '#aaa', margin: '0 0 5mm 0', letterSpacing: '1px' }}>
                        Mã khóa: {data.courseCode}
                    </p>

                    {/* Score & date */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12mm', margin: '0 0 8mm 0', fontSize: '13px', color: '#555' }}>
                        <span>Điểm đạt: <strong style={{ color: '#0F4C75', fontSize: '16px' }}>{data.score}%</strong></span>
                        <span style={{ color: '#ccc' }}>|</span>
                        <span>Ngày hoàn thành: <strong>{displayDate}</strong></span>
                    </div>

                    {/* Divider bottom */}
                    <div style={{ width: '40%', height: '1px', background: 'linear-gradient(to right, transparent, #ccc, transparent)', margin: '2mm 0 8mm 0' }} />

                    {/* Signatures */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '75%', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ width: '50mm', height: '1px', background: '#999', margin: '0 auto 2mm auto' }} />
                            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#0F4C75', margin: '0 0 1mm 0' }}>{data.trainerName || 'Giảng viên'}</p>
                            <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>Giảng viên</p>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ width: '50mm', height: '1px', background: '#999', margin: '0 auto 2mm auto' }} />
                            <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#0F4C75', margin: '0 0 1mm 0' }}>Phòng Nhân sự</p>
                            <p style={{ fontSize: '10px', color: '#888', margin: 0 }}>Xác nhận</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
