'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Video, Building2, ChevronLeft, Send, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function SetupTrainingSchedulePage() {
    const [locationType, setLocationType] = useState<'online' | 'offline'>('online');

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75] mb-1">Thiết lập Lịch trình Đào tạo</h1>
                <p className="text-gray-500">Bước 2: Cấu hình thời gian, địa điểm và gửi thông báo</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
                
                {/* Stepper */}
                <div className="flex items-center w-full px-4 pt-2">
                    <div className="flex flex-col flex-1 relative">
                        <div className="flex items-center justify-between w-full mb-2 z-10">
                            <div className="flex items-center gap-3 bg-white pr-4">
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="font-semibold text-sm text-gray-700">Bước 1: Phân công</span>
                            </div>
                            <div className="flex items-center gap-3 bg-white pl-4">
                                <div className="w-6 h-6 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-semibold">
                                    2
                                </div>
                                <span className="font-semibold text-sm text-[#0F4C75]">Bước 2: Thiết lập</span>
                            </div>
                        </div>
                        <div className="absolute top-3 left-0 w-full h-1 bg-gray-100 rounded-full -z-0">
                            <div className="h-full bg-[#0F4C75] rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                    {/* Left side form */}
                    <div className="md:col-span-8 space-y-10">
                        {/* Section 1 */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-[#0F4C75]" />
                                <h2 className="text-[15px] font-bold text-[#0F4C75] tracking-wide">1. Thông tin thời gian</h2>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Ngày bắt đầu</label>
                                    <div className="relative">
                                        <Input placeholder="mm/dd/yyyy" className="bg-white border-gray-200" />
                                        <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Ngày kết thúc</label>
                                    <div className="relative">
                                        <Input placeholder="mm/dd/yyyy" className="bg-white border-gray-200" />
                                        <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Giờ bắt đầu buổi học</label>
                                    <div className="relative">
                                        <Input placeholder="--:-- --" className="bg-white border-gray-200" />
                                        <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-600">Giờ kết thúc buổi học</label>
                                    <div className="relative">
                                        <Input placeholder="--:-- --" className="bg-white border-gray-200" />
                                        <Clock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-[#0F4C75]" />
                                <h2 className="text-[15px] font-bold text-[#0F4C75] tracking-wide">2. Địa điểm & Hình thức</h2>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setLocationType('online')}
                                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${locationType === 'online' ? 'border-[#0F4C75] bg-blue-50/20' : 'border-gray-100 hover:border-blue-100 bg-white'}`}
                                >
                                    <div className={`p-3 rounded-full ${locationType === 'online' ? 'bg-[#0F4C75] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Video className="w-6 h-6" />
                                    </div>
                                    <span className={`font-semibold ${locationType === 'online' ? 'text-[#0F4C75]' : 'text-gray-600'}`}>Trực tuyến</span>
                                </button>
                                
                                <button 
                                    onClick={() => setLocationType('offline')}
                                    className={`flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${locationType === 'offline' ? 'border-[#0F4C75] bg-blue-50/20' : 'border-gray-100 hover:border-blue-100 bg-white'}`}
                                >
                                    <div className={`p-3 rounded-full ${locationType === 'offline' ? 'bg-[#0F4C75] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <span className={`font-semibold ${locationType === 'offline' ? 'text-[#0F4C75]' : 'text-gray-600'}`}>Tại văn phòng</span>
                                </button>
                            </div>

                            {locationType === 'online' && (
                                <div className="space-y-2 mt-4">
                                    <label className="text-sm font-semibold text-gray-600">Link cuộc họp (Zoom/Meet/Teams)</label>
                                    <Input defaultValue="https://meet.google.com/abc-xyz" className="bg-gray-50/50 border-gray-200 text-[#0F4C75] font-medium" />
                                </div>
                            )}
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2">
                                <Send className="w-5 h-5 text-[#0F4C75]" />
                                <h2 className="text-[15px] font-bold text-[#0F4C75] tracking-wide">3. Cấu hình thông báo</h2>
                            </div>
                            
                            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <span className="font-semibold text-gray-700">Gửi email cho giảng viên</span>
                                    </div>
                                    <Switch defaultChecked className="data-[state=checked]:bg-[#0F4C75]" />
                                </div>
                                <Separator className="bg-gray-200" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <span className="font-semibold text-gray-700">Gửi email cho học viên</span>
                                    </div>
                                    <Switch defaultChecked className="data-[state=checked]:bg-[#0F4C75]" />
                                </div>
                                <Separator className="bg-gray-200" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-100 text-gray-500 flex items-center justify-center">
                                            <Clock className="w-4 h-4" />
                                        </div>
                                        <span className="font-semibold text-gray-700">Nhắc nhở trước 15 phút</span>
                                    </div>
                                    <Switch className="data-[state=checked]:bg-[#0F4C75]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side summary */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-[#0F4C75] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                            <h3 className="font-bold text-sm tracking-wider uppercase mb-6 text-blue-100">TÓM TẮT PHÂN CÔNG</h3>
                            
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-200 mb-1">Giảng viên phụ trách</p>
                                        <p className="font-bold text-lg mb-1">Nguyễn Văn A</p>
                                        <Badge variant="secondary" className="bg-white/20 text-blue-50 border-none font-normal">Senior Lead</Badge>
                                    </div>
                                </div>
                                
                                <Separator className="bg-white/20" />

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-blue-200 mb-1">Số lượng học viên</p>
                                        <p className="font-bold text-lg mb-1">24 Học viên</p>
                                        <Badge variant="secondary" className="bg-blue-400/30 text-blue-100 border-none font-medium">Danh sách đã duyệt</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-orange-50/50 border border-orange-100/50 p-5 rounded-xl border-dashed">
                            <div className="flex items-start gap-3 text-orange-800">
                                <svg className="w-5 h-5 mt-0.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Ghi chú thiết lập</h4>
                                    <p className="text-sm italic opacity-80 leading-relaxed">
                                        &quot;Vui lòng kiểm tra kỹ thời gian biểu để tránh trùng lặp với các khóa học khác trong cùng bộ phận.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-6 mt-8 border-t border-gray-100 flex items-center justify-between">
                    <Button variant="ghost" className="text-gray-600 font-medium">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" className="px-6 rounded-full border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700">
                            Lưu nháp
                        </Button>
                        <Button className="px-6 rounded-full bg-[#0F4C75] hover:bg-[#1A5F8C] text-white">
                            Hoàn tất & Gửi thông báo <Send className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
