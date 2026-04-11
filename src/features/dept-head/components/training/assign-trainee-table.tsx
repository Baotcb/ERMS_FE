import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import type { Employee } from '@/features/hr/api/employee-service';

import { Button } from '@/components/ui/button';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function AssignTraineeTable({
    assignableTrainees,
    potentialTrainees,
    enrolledEmployeeIds,
    selectedTraineeIds,
    setSelectedTraineeIds,
    totalCount,
    totalPages,
    currentPage,
    handlePageChange,
    handleSelectAllAcrossPages,
    isSelectingAll,
}: {
    assignableTrainees: Employee[];
    potentialTrainees: Employee[];
    enrolledEmployeeIds: string[];
    selectedTraineeIds: string[];
    setSelectedTraineeIds: (ids: string[]) => void;
    totalCount: number;
    totalPages: number;
    currentPage: number;
    handlePageChange: (page: number) => void;
    handleSelectAllAcrossPages: () => void;
    isSelectingAll: boolean;
}) {
    return (
        <>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[400px]">
                {/* "Select All Across Pages" Banner */}
                {assignableTrainees.length > 0 && 
                 assignableTrainees.every((t: Employee) => selectedTraineeIds.includes(t.id)) && 
                 totalCount > assignableTrainees.length && (
                    <div className="bg-blue-50/80 border-b border-blue-100 px-4 py-2.5 text-sm flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <span className="text-gray-600">
                            Đã chọn tất cả <strong>{assignableTrainees.length}</strong> học viên trên trang này.
                        </span>
                        <Button 
                            variant="link" 
                            onClick={handleSelectAllAcrossPages}
                            disabled={isSelectingAll}
                            className="h-auto p-0 font-bold text-[#0F4C75] hover:text-[#1A5F8C]"
                        >
                            {isSelectingAll ? (
                                <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Đang chọn tất cả...</>
                            ) : (
                                `Chọn tất cả nhân viên phù hợp`
                            )}
                        </Button>
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                            <TableHead className="w-[50px]">
                                <Checkbox 
                                    checked={assignableTrainees.length > 0 && assignableTrainees.every((t: Employee) => selectedTraineeIds.includes(t.id))}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            const newIds = new Set([...selectedTraineeIds, ...assignableTrainees.map((p: Employee) => p.id)]);
                                            setSelectedTraineeIds(Array.from(newIds));
                                        } else {
                                            const pageIds = new Set(assignableTrainees.map((p: Employee) => p.id));
                                            setSelectedTraineeIds(selectedTraineeIds.filter(id => !pageIds.has(id)));
                                        }
                                    }}
                                />
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500">HỌ VÀ TÊN</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500">PHÒNG BAN</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500">VỊ TRÍ</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-500 text-center">TRẠNG THÁI</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {potentialTrainees.map((trainee: Employee) => {
                            const isEnrolled = enrolledEmployeeIds.includes(trainee.id);
                            return (
                                <TableRow key={trainee.id} className={isEnrolled ? "bg-gray-50/50 grayscale-[0.3]" : ""}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedTraineeIds.includes(trainee.id) || isEnrolled}
                                            disabled={isEnrolled}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedTraineeIds([...selectedTraineeIds, trainee.id]);
                                                else setSelectedTraineeIds(selectedTraineeIds.filter(id => id !== trainee.id));
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className={`w-8 h-8 border-2 border-white shadow-sm ring-1 ring-gray-100 ${isEnrolled ? "opacity-60" : ""}`}>
                                                <AvatarFallback className="bg-[#0F4C75] text-white text-[10px] font-bold">
                                                    {trainee.fullName?.split(' ').pop()?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium ${isEnrolled ? "text-gray-500" : "text-gray-900"}`}>{trainee.fullName}</span>
                                                    {isEnrolled && (
                                                        <Badge variant="secondary" className="bg-gray-200 hover:bg-gray-200 text-gray-500 text-[10px] px-2 py-0 h-4">
                                                            Đã tham gia
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5">{trainee.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">{trainee.departmentName}</TableCell>
                                    <TableCell className="text-sm text-gray-500">{trainee.position}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className="font-normal text-gray-500">{{ Active: 'Đang làm việc', Inactive: 'Ngừng hoạt động', OnLeave: 'Đang nghỉ phép' }[trainee.status] || trainee.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {potentialTrainees.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="text-center py-20 text-gray-400 italic">Không tìm thấy nhân viên</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="pt-2 flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">
                    Đã chọn {selectedTraineeIds.length} nhân viên · Hiển thị {potentialTrainees.length}/{totalCount}
                </span>
                {totalPages > 1 && (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 text-gray-400 border-gray-200"
                            disabled={currentPage <= 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? 'default' : 'outline'}
                                    size="icon"
                                    className={`w-8 h-8 ${
                                        currentPage === pageNum
                                            ? 'bg-[#0F4C75] text-white hover:bg-[#155A8A]'
                                            : 'text-gray-400 border-gray-200'
                                    }`}
                                    onClick={() => handlePageChange(pageNum)}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8 text-gray-400 border-gray-200"
                            disabled={currentPage >= totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}
