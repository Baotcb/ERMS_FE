'use client';

import React, { useState } from 'react';
import { Search, CheckCircle2, PlusCircle, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock Data
const TRAINERS = [
    {
        id: '1',
        name: 'Nguyễn Minh Tuấn',
        role: 'Giám đốc Vận hành (COO)',
        skills: ['Lãnh đạo', 'Chiến lược'],
        avatar: 'https://i.pravatar.cc/150?u=tuan',
        selected: true,
    },
    {
        id: '2',
        name: 'Phạm Thu Hà',
        role: 'Quản lý nhân sự cấp cao',
        skills: ['Soft skills', 'EQ'],
        avatar: 'https://i.pravatar.cc/150?u=ha',
        selected: false,
    },
    {
        id: '3',
        name: 'Lê Văn Hùng',
        role: 'Chuyên gia đào tạo nội bộ',
        skills: ['Management'],
        avatar: 'https://i.pravatar.cc/150?u=hung',
        selected: false,
    },
];

const TRAINEES = [
    { id: '1', name: 'Trần Thế Anh', dept: 'Kinh doanh', pos: 'Team Lead', score: 72, selected: true, avatar: 'https://i.pravatar.cc/150?u=anh' },
    { id: '2', name: 'Lê Công Vinh', dept: 'Kỹ thuật', pos: 'Senior Engineer', score: 85, selected: true, avatar: 'https://i.pravatar.cc/150?u=vinh' },
    { id: '3', name: 'Vũ Thị Lan', dept: 'Marketing', pos: 'Manager', score: 64, selected: false, avatar: 'https://i.pravatar.cc/150?u=lan' },
    { id: '4', name: 'Hoàng Nam', dept: 'Kinh doanh', pos: 'Account Executive', score: 70, selected: false, avatar: 'https://i.pravatar.cc/150?u=nam' },
    { id: '5', name: 'Mai Thu Phương', dept: 'HR', pos: 'Senior Staff', score: 82, selected: false, avatar: 'https://i.pravatar.cc/150?u=phuong' },
];

export function AssignTrainingPage() {
    const [trainers, setTrainers] = useState(TRAINERS);
    const [trainees, setTrainees] = useState(TRAINEES);

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50 px-2 py-1 rounded font-medium';
        if (score >= 70) return 'text-orange-600 bg-orange-50 px-2 py-1 rounded font-medium';
        return 'text-red-600 bg-red-50 px-2 py-1 rounded font-medium';
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#0F4C75] mb-1">Phân công Đào tạo</h1>
                <p className="text-gray-500">Thiết lập danh sách người đào tạo và học viên cho khóa học.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
                {/* Step 1 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-semibold">1</div>
                        <h2 className="text-[13px] font-bold text-gray-700 tracking-wider">BƯỚC 1: CHỌN KHÓA HỌC</h2>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Chọn khóa học đào tạo cần phân công</p>
                        <Select defaultValue="ld001">
                            <SelectTrigger className="w-full md:w-[600px] border-gray-300">
                                <SelectValue placeholder="Chọn khóa học" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ld001">Kỹ năng lãnh đạo cấp trung (Mã: LD001)</SelectItem>
                                <SelectItem value="cs001">Chăm sóc khách hàng cơ bản (Mã: CS001)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Step 2 wrapper */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-gray-100">
                    
                    {/* Step 2.1 */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-semibold">2.1</div>
                            <h2 className="text-[13px] font-bold text-gray-700 tracking-wider uppercase">Phân công người đào tạo</h2>
                        </div>
                        
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input placeholder="Tìm giảng viên/chuyên gia..." className="pl-9 border-gray-200 bg-gray-50/50" />
                        </div>

                        <div className="space-y-3 mt-4">
                            {trainers.map(trainer => (
                                <div 
                                    key={trainer.id} 
                                    className={`relative p-4 rounded-xl border transition-all ${
                                        trainer.selected 
                                            ? 'border-[#0F4C75] bg-blue-50/30' 
                                            : 'border-gray-200 hover:border-blue-200 bg-white'
                                    }`}
                                    onClick={() => {
                                        setTrainers(trainers.map(t => ({...t, selected: t.id === trainer.id})));
                                    }}
                                >
                                    {trainer.selected && (
                                        <Badge variant="secondary" className="absolute -top-3 right-4 bg-[#0F4C75] text-white hover:bg-[#155A8A] text-[10px] px-2 py-0">ĐÃ CHỌN</Badge>
                                    )}
                                    <div className="flex items-start gap-4">
                                        <Avatar className="w-12 h-12 border">
                                            <AvatarImage src={trainer.avatar} />
                                            <AvatarFallback>{trainer.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-semibold text-gray-900 truncate">{trainer.name}</h3>
                                                {trainer.selected ? (
                                                    <CheckCircle2 className="w-5 h-5 text-[#0F4C75] shrink-0" />
                                                ) : (
                                                    <PlusCircle className="w-5 h-5 text-gray-300 shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2 truncate">{trainer.role}</p>
                                            <div className="flex flex-wrap gap-1">
                                                {trainer.skills.map(s => (
                                                    <Badge key={s} variant="outline" className="text-[10px] text-gray-500 font-normal bg-gray-50">{s}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Step 2.2 */}
                    <div className="lg:col-span-8 bg-gray-50/30 rounded-xl border border-gray-100 p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-[#0F4C75] text-white flex items-center justify-center text-sm font-semibold">2.2</div>
                                <h2 className="text-[13px] font-bold text-gray-700 tracking-wider uppercase">Phân công học viên</h2>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                    <Input placeholder="Tìm theo tên, phòng ban" className="pl-9 w-[220px] bg-white border-gray-200" />
                                </div>
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[160px] bg-white border-gray-200">
                                        <SelectValue placeholder="Tất cả phòng ban" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả phòng ban</SelectItem>
                                        <SelectItem value="it">Kỹ thuật</SelectItem>
                                        <SelectItem value="sales">Kinh doanh</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                        <TableHead className="w-[50px]"><Checkbox /></TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-500">HỌ VÀ TÊN</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-500">PHÒNG BAN</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-500">VỊ TRÍ</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-500 text-center">NĂNG LỰC<br/><span className="text-[10px] font-normal">(SCORE)</span></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {trainees.map(trainee => (
                                        <TableRow key={trainee.id}>
                                            <TableCell>
                                                <Checkbox 
                                                    checked={trainee.selected}
                                                    onCheckedChange={(checked) => {
                                                        setTrainees(trainees.map(t => t.id === trainee.id ? {...t, selected: !!checked} : t))
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={trainee.avatar} />
                                                        <AvatarFallback>{trainee.name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-gray-900">{trainee.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">{trainee.dept}</TableCell>
                                            <TableCell className="text-sm text-gray-500">{trainee.pos}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={getScoreColor(trainee.score)}>{trainee.score}/100</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">Đã chọn 12/45 nhân viên</span>
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="w-8 h-8 text-gray-400 border-gray-200">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="default" size="icon" className="w-8 h-8 bg-[#0F4C75] text-white hover:bg-[#155A8A]">
                                    1
                                </Button>
                                <Button variant="outline" size="icon" className="w-8 h-8 border-gray-200">
                                    2
                                </Button>
                                <Button variant="outline" size="icon" className="w-8 h-8 text-gray-400 border-gray-200">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <Button variant="outline" className="px-6 rounded-full border-gray-300">
                        Hủy bỏ
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" className="px-6 rounded-full border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700">
                            Lưu nháp
                        </Button>
                        <Button className="px-6 rounded-full bg-[#0F4C75] hover:bg-[#1A5F8C] text-white">
                            Tiếp tục: Thiết lập lịch trình →
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
