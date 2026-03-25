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
            className="w-[297mm] min-h-[210mm] p-0 mx-auto bg-white relative font-serif overflow-hidden box-border"
        >
            {/* Outer border */}
            <div className="absolute inset-[8mm] border-[3px] border-[#0F4C75] rounded pointer-events-none" />
            {/* Inner border */}
            <div className="absolute inset-[11mm] border border-[#3282B8] rounded-sm pointer-events-none" />

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

            {/* Content box */}
            <div className="pt-[20mm] px-[30mm] pb-[18mm] flex flex-col items-center justify-center min-h-[210mm] box-border text-center relative z-10">
                
                {/* Logo + Company Name */}
                <div className="mb-[4mm]">
                    {data.companyLogoUrl ? (
                        <img
                            src={data.companyLogoUrl}
                            alt={data.companyName || 'Company Logo'}
                            className="w-[20mm] h-[20mm] object-contain mx-auto mb-[3mm] block"
                        />
                    ) : (
                        <div className="w-[18mm] h-[18mm] mx-auto mb-[3mm] bg-gradient-to-br from-[#0F4C75] to-[#3282B8] rounded-full flex items-center justify-center text-white text-[24px] font-bold">
                            {(data.companyName || 'E').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <p className="text-[12px] tracking-[3px] text-[#0F4C75] uppercase font-bold m-0">
                        {data.companyName || 'ERMS'}
                    </p>
                    <p className="text-[9px] tracking-[2px] text-gray-400 uppercase mt-[1mm] mb-0">
                        Certificate of Completion
                    </p>
                </div>

                {/* Divider */}
                <div className="w-[60%] h-[1px] bg-gradient-to-r from-transparent via-[#3282B8] to-transparent my-[5mm]" />

                {/* Title */}
                <h1 className="text-[32px] font-bold text-[#0F4C75] tracking-[6px] uppercase m-0 mb-[2mm]">
                    Chứng Nhận
                </h1>
                <p className="text-[14px] tracking-[4px] text-gray-500 uppercase m-0 mb-[8mm]">
                    Hoàn Thành Khóa Đào Tạo
                </p>

                <p className="text-[13px] text-gray-600 m-0 mb-[4mm] italic">Chứng nhận rằng</p>

                {/* Learner Name */}
                <h2 className="text-[36px] font-bold text-[#0F4C75] m-0 mb-[2mm] border-b-2 border-[#BBE1FA] pb-[3mm] inline-block min-w-[60%]">
                    {data.learnerName || 'Họ và Tên'}
                </h2>

                {data.departmentName && (
                    <p className="text-[12px] text-gray-400 mt-[2mm] mb-0">Bộ phận: {data.departmentName}</p>
                )}

                <p className="text-[13px] text-gray-600 mt-[6mm] mb-[3mm] italic">Đã hoàn thành xuất sắc khóa đào tạo</p>

                {/* Course Name */}
                <h3 className="text-[22px] font-bold text-[#1B262C] m-0 mb-[2mm]">
                    &ldquo;{data.courseName}&rdquo;
                </h3>
                <p className="text-[11px] text-gray-400 m-0 mb-[5mm] tracking-[1px]">Mã khóa: {data.courseCode}</p>

                {/* Score & date */}
                <div className="flex items-center justify-center gap-[12mm] m-0 mb-[8mm] text-[13px] text-gray-700">
                    <span>Điểm đạt: <strong className="text-[#0F4C75] text-[16px]">{data.score}%</strong></span>
                    <span className="text-gray-300">|</span>
                    <span>Ngày hoàn thành: <strong>{displayDate}</strong></span>
                </div>

                {/* Divider bottom */}
                <div className="w-[40%] h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-[8mm] mt-[2mm]" />

                {/* Signatures */}
                <div className="flex justify-between w-[75%] mx-auto">
                    <div className="text-center flex-1">
                        <div className="w-[50mm] h-[1px] bg-gray-400 mx-auto mb-[2mm]" />
                        <p className="text-[12px] font-bold text-[#0F4C75] m-0 mb-[1mm]">{data.trainerName || 'Giảng viên'}</p>
                        <p className="text-[10px] text-gray-500 m-0">Giảng viên</p>
                    </div>
                    <div className="text-center flex-1">
                        <div className="w-[50mm] h-[1px] bg-gray-400 mx-auto mb-[2mm]" />
                        <p className="text-[12px] font-bold text-[#0F4C75] m-0 mb-[1mm]">Phòng Nhân sự</p>
                        <p className="text-[10px] text-gray-500 m-0">Xác nhận</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
