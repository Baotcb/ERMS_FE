'use client';

import { useState, useEffect } from 'react';
import { 
    PlusCircle, GripVertical, FileText, Video, 
    Trash2, Edit3, Loader2, MoreVertical, Clock, Layers, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CourseSection, Lesson } from '@/features/hr/types/course-content-types';
import { courseContentService } from '@/features/hr/api/course-content-service';
import { useToast } from '@/hooks/use-toast';

interface CurriculumManagerProps {
    courseId: string;
}

import { FileUpload } from '@/components/common/file-upload';

export function CurriculumManager({ courseId }: CurriculumManagerProps) {
    const { toast } = useToast();
    const [sections, setSections] = useState<CourseSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');

    // Lesson addition state
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
    const [lessonTitle, setLessonTitle] = useState('');
    const [lessonDuration, setLessonDuration] = useState(15);
    const [isAddingLesson, setIsAddingLesson] = useState(false);

    useEffect(() => {
        loadCurriculum();
    }, [courseId]);

    const loadCurriculum = async () => {
        setIsLoading(true);
        try {
            const data = await courseContentService.getCourseCurriculum(courseId);
            setSections(data || []);
        } catch (error) {
            console.error('Error loading curriculum:', error);
            // Fallback for demo
            setSections([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;
        setIsAddingSection(true);
        try {
            const newSection: CourseSection = {
                id: Math.random().toString(36).substr(2, 9),
                courseId,
                title: newSectionTitle,
                orderIndex: sections.length + 1,
                lessons: []
            };
            setSections([...sections, newSection]);
            setNewSectionTitle('');
            toast({ title: 'Thành công', description: 'Đã thêm học phần mới.' });
        } catch {
            toast({ title: 'Lỗi', description: 'Không thể thêm học phần.', variant: 'destructive' });
        } finally {
            setIsAddingSection(false);
        }
    };

    const handleAddLesson = async () => {
        if (!lessonTitle.trim() || !activeSectionId) return;
        setIsAddingLesson(true);
        try {
            const newLesson: Lesson = {
                id: Math.random().toString(36).substr(2, 9),
                courseId,
                sectionId: activeSectionId,
                title: lessonTitle,
                durationMinutes: lessonDuration,
                orderIndex: (sections.find(s => s.id === activeSectionId)?.lessons.length || 0) + 1,
            };

            setSections(prev => prev.map(s => 
                s.id === activeSectionId 
                    ? { ...s, lessons: [...s.lessons, newLesson] }
                    : s
            ));

            setLessonTitle('');
            setActiveSectionId(null);
            toast({ title: 'Thành công', description: 'Đã thêm bài giảng mới.' });
        } catch {
            toast({ title: 'Lỗi', description: 'Không thể thêm bài giảng.', variant: 'destructive' });
        } finally {
            setIsAddingLesson(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F4C75]" />
                <p className="text-gray-400 font-medium">Đang tải chương trình học...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0F4C75]">Chương trình học ({sections.length} học phần)</h3>
                <div className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="rounded-xl border-gray-200 gap-2">
                                <PlusCircle className="w-4 h-4" />
                                Thêm học phần
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-[#0F4C75] font-bold">Thêm học phần mới</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="section-title" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề học phần</Label>
                                    <Input 
                                        id="section-title" 
                                        placeholder="VD: Chương 1: Giới thiệu..." 
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                        className="rounded-xl border-gray-200 h-11"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddSection} className="w-full bg-[#0F4C75] text-white rounded-xl py-6 font-bold">Thêm học phần</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-6">
                {sections.length === 0 ? (
                    <div className="p-20 border-2 border-dashed border-gray-100 rounded-3xl text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-50 text-blue-300 rounded-full flex items-center justify-center mx-auto">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-[#0F4C75]">Chương trình học trống</p>
                            <p className="text-sm text-gray-400">Hãy bắt đầu bằng cách thêm học phần đầu tiên.</p>
                        </div>
                    </div>
                ) : (
                    sections.map((section, sIdx) => (
                        <div key={section.id} className="bg-gray-50/50 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="p-5 flex items-center justify-between bg-white border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Học phần {sIdx + 1}</span>
                                        <h4 className="font-bold text-[#0F4C75] text-lg">{section.title}</h4>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 hover:bg-blue-50 hover:text-[#3282B8]">
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" className="rounded-xl h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-5 space-y-3">
                                {section.lessons.map((lesson, lIdx) => (
                                    <div key={lesson.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-[#3282B8]/30 hover:shadow-md transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-blue-50 text-[#3282B8] rounded-xl flex items-center justify-center text-sm font-bold">
                                                {lIdx + 1}
                                            </div>
                                            <div>
                                                <h5 className="font-bold text-gray-800 group-hover:text-[#3282B8] transition-colors">{lesson.title}</h5>
                                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    {lesson.videoUrl ? (
                                                        <span className="flex items-center gap-1 text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                                            <Video className="w-3 h-3" /> Video
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                                                            <FileText className="w-3 h-3" /> Văn bản
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
                                                        <Clock className="w-3 h-3" /> {lesson.durationMinutes} phút
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl min-w-[160px]">
                                                <DropdownMenuItem className="gap-2 font-medium">
                                                    <Edit3 className="w-4 h-4" /> Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 font-medium">
                                                    <Upload className="w-4 h-4" /> Tải lên tài liệu
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 font-medium text-red-600 focus:text-red-600 focus:bg-red-50">
                                                    <Trash2 className="w-4 h-4" /> Xóa bài giảng
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))}

                                <Dialog open={activeSectionId === section.id} onOpenChange={(open) => !open && setActiveSectionId(null)}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => setActiveSectionId(section.id)}
                                            className="w-full border border-dashed border-gray-200 rounded-2xl py-8 hover:bg-blue-50 hover:border-blue-200 hover:text-[#0F4C75] text-gray-400 gap-2 transition-all font-bold group"
                                        >
                                            <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            Thêm bài giảng mới
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-3xl max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-[#0F4C75] font-bold text-xl">Thêm bài giảng mới</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-6 grid grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tiêu đề bài giảng</Label>
                                                    <Input 
                                                        placeholder="VD: Tổng quan về React..." 
                                                        value={lessonTitle}
                                                        onChange={(e) => setLessonTitle(e.target.value)}
                                                        className="rounded-xl border-gray-200 h-11"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Thời lượng dự kiến (phút)</Label>
                                                    <Input 
                                                        type="number"
                                                        value={lessonDuration}
                                                        onChange={(e) => setLessonDuration(parseInt(e.target.value))}
                                                        className="rounded-xl border-gray-200 h-11"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tài liệu đính kèm</Label>
                                                <FileUpload onUploadComplete={(url) => console.log(url)} />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button 
                                                onClick={handleAddLesson} 
                                                className="w-full bg-[#0F4C75] text-white rounded-2xl py-7 font-bold text-lg shadow-lg shadow-blue-100"
                                                disabled={isAddingLesson}
                                            >
                                                {isAddingLesson ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lưu bài giảng'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

