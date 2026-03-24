'use client';

import { Award, BookOpen, Calendar, Mail, User, Building2, Building, ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { CertificateData } from './certificate-types';

/** Editable form for certificate data — learner info editable, course info read-only. */
export function CertificateEditForm({
    data,
    onUpdate,
}: {
    data: CertificateData;
    onUpdate: (field: keyof CertificateData, value: string | number) => void;
}) {
    return (
        <div className="space-y-5 px-6 pb-6">
            {/* Learner Info — editable */}
            <div className="learning-card p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-[#0F4C75]/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-[#0F4C75]" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#0F4C75]">Thông tin học viên</p>
                        <p className="text-[11px] text-gray-400">Có thể chỉnh sửa trước khi in</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField icon={<User className="w-3.5 h-3.5" />} label="Họ và tên" required>
                        <Input value={data.learnerName} onChange={(e) => onUpdate('learnerName', e.target.value)} placeholder="Nhập họ và tên đầy đủ" className="cert-input" />
                    </FormField>
                    <FormField icon={<Mail className="w-3.5 h-3.5" />} label="Email">
                        <Input value={data.learnerEmail} readOnly className="cert-input cert-input--readonly" />
                    </FormField>
                    <FormField icon={<Building2 className="w-3.5 h-3.5" />} label="Bộ phận">
                        <Input value={data.departmentName} onChange={(e) => onUpdate('departmentName', e.target.value)} placeholder="Nhập tên bộ phận" className="cert-input" />
                    </FormField>
                    <FormField icon={<Calendar className="w-3.5 h-3.5" />} label="Ngày hoàn thành">
                        <Input type="date" value={data.completionDate} onChange={(e) => onUpdate('completionDate', e.target.value)} className="cert-input" />
                    </FormField>
                </div>
            </div>

            {/* Course Info — read-only */}
            <div className="learning-card p-5 space-y-4 border-blue-100 bg-gradient-to-br from-blue-50/40 to-white">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-blue-700">Thông tin khóa học</p>
                        <p className="text-[11px] text-gray-400">Tự động từ hệ thống</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField icon={<BookOpen className="w-3.5 h-3.5" />} label="Tên khóa học">
                        <Input value={data.courseName} readOnly className="cert-input cert-input--readonly" />
                    </FormField>
                    <FormField icon={<Award className="w-3.5 h-3.5" />} label="Mã khóa">
                        <Input value={data.courseCode} readOnly className="cert-input cert-input--readonly" />
                    </FormField>
                    <FormField icon={<User className="w-3.5 h-3.5" />} label="Giảng viên">
                        <Input value={data.trainerName || 'Chưa xác định'} readOnly className="cert-input cert-input--readonly" />
                    </FormField>
                    <FormField icon={<Award className="w-3.5 h-3.5" />} label="Điểm đạt">
                        <div className="flex items-center gap-2">
                            <Input value={`${data.score}%`} readOnly className="cert-input cert-input--readonly font-bold" />
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${data.score >= 80 ? 'bg-emerald-100 text-emerald-700' : data.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                {data.score >= 80 ? 'A' : data.score >= 65 ? 'B' : data.score >= 50 ? 'C' : 'D'}
                            </div>
                        </div>
                    </FormField>
                </div>
            </div>

            {/* Company Info — editable */}
            <div className="learning-card p-5 space-y-4 border-purple-100 bg-gradient-to-br from-purple-50/30 to-white">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Building className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-purple-700">Thông tin công ty</p>
                        <p className="text-[11px] text-gray-400">Hiển thị trên chứng chỉ</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField icon={<Building className="w-3.5 h-3.5" />} label="Tên công ty">
                        <Input value={data.companyName} onChange={(e) => onUpdate('companyName', e.target.value)} placeholder="Nhập tên công ty" className="cert-input" />
                    </FormField>
                    <FormField icon={<ImageIcon className="w-3.5 h-3.5" />} label="URL logo công ty">
                        <div className="flex items-center gap-2">
                            <Input value={data.companyLogoUrl} onChange={(e) => onUpdate('companyLogoUrl', e.target.value)} placeholder="https://..." className="cert-input flex-1" />
                            {data.companyLogoUrl && (
                                <div className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 bg-white">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={data.companyLogoUrl} alt="" className="w-6 h-6 object-contain" />
                                </div>
                            )}
                        </div>
                    </FormField>
                </div>
            </div>
        </div>
    );
}

/** Reusable form field with icon and label. */
function FormField({ icon, label, required, children }: { icon: React.ReactNode; label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                {icon} {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}
