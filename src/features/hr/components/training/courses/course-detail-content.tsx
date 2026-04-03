import { BookOpen, MessageSquare } from 'lucide-react';
import type { Course } from '@/features/hr/types/course-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STATUS_COLORS: Record<string, string> = {
    Published: 'bg-green-100 text-green-800',
    Draft: 'bg-gray-100 text-gray-800',
    Archived: 'bg-slate-100 text-slate-700',
};

export function getDeploymentLabel(course: Course): string {
    const hasTrainer = Boolean(course.trainerEmail?.trim());
    const hasTrainees = (course.enrollmentCount || 0) > 0;
    const hasSchedule = Boolean(course.description?.includes('Lịch trình:'));
    if ((course.status === 'Public' || course.status === 'Published')) return 'Đã xuất bản';
    if (hasTrainer && hasTrainees && hasSchedule) return 'Sẵn sàng triển khai';
    if (hasTrainer && hasSchedule) return 'Đã có lịch';
    if (hasTrainer) return 'Đã phân công';
    return 'Khóa học nháp';
}

function parseCourseDescription(raw: string | undefined) {
    if (!raw) return { description: '', schedule: null, location: null };
    const lines = raw.split('\n');
    let description = '';
    let schedule = null as { start: string; end: string } | null;
    let location = null as string | null;

    for (const line of lines) {
        const scheduleMatch = line.match(/(?:\[DRAFT\] )?Lịch trình:\s*(.+?)\s*đến\s*(.+?)\.\s*Địa điểm:\s*(.+)/i);
        if (scheduleMatch) {
            schedule = { start: scheduleMatch[1], end: scheduleMatch[2] };
            location = scheduleMatch[3].trim();
            continue;
        }
        if (line.match(/Thông báo:\s*giangvien_khi_phancong/i)) continue;
        if (line.trim()) description += (description ? '\n' : '') + line.trim();
    }
    return { description, schedule, location };
}

export function CourseDetailContent({ 
    course, 
    onViewFeedback,
    hideHeader 
}: { 
    course: Course; 
    onViewFeedback?: (courseName: string) => void;
    hideHeader?: boolean;
}) {
    const { description, schedule, location } = parseCourseDescription(course.description);
    const isOnline = course.isOnline !== false;

    return (
        <div className="space-y-5">
            {/* Course name header */}
            {!hideHeader && (
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F4C75] to-[#3282B8] flex items-center justify-center text-white shrink-0">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-[#0F4C75] leading-tight">{course.courseName}</h3>
                        <p className="text-sm text-gray-500">{course.courseCode}</p>
                    </div>
                    <Badge variant="outline" className={`border-0 font-semibold px-2.5 py-0.5 shrink-0 ${STATUS_COLORS[course.status] || 'bg-gray-100 text-gray-700'}`}>
                        {getDeploymentLabel(course)}
                    </Badge>
                </div>
            )}

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Giảng viên', value: course.trainerName || course.trainerEmail || 'Chưa gán', icon: '👨‍🏫' },
                    { label: 'Thời lượng', value: `${course.durationMinutes || 0} phút`, icon: '⏱️' },
                    { label: 'Bài học', value: String(course.lessonCount || 0), icon: '📚' },
                    { label: 'Học viên', value: String(course.enrollmentCount || 0), icon: '👥' },
                ].map(({ label, value, icon }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-lg mb-0.5">{icon}</div>
                        <p className="text-sm font-bold text-gray-800">{value}</p>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
                    </div>
                ))}
            </div>

            {/* Schedule & Location — only if present */}
            {(schedule || location) && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        {isOnline ? '📹 Online' : '🏢 Offline'} • Lịch trình
                    </p>
                    {schedule && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="font-medium">🗓️</span>
                            <span>{schedule.start} → {schedule.end}</span>
                        </div>
                    )}
                    {location && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="font-medium">📍</span>
                            <span>{location}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Description */}
            {description && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Mô tả</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{description}</p>
                </div>
            )}

            {/* View Feedback button */}
            {onViewFeedback && (course.status === 'Public' || course.status === 'Published') && (
                <Button
                    variant="outline"
                    className="w-full border-[#0F4C75] text-[#0F4C75] hover:bg-blue-50"
                    onClick={() => onViewFeedback(course.courseName)}
                >
                    <MessageSquare className="w-4 h-4 mr-2" /> Xem phản hồi của khóa học này
                </Button>
            )}
        </div>
    );
}
