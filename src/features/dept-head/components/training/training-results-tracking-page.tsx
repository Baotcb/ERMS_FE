'use client';

import { useMemo, useState } from 'react';
import { BarChart3, BookOpenCheck, ChevronDown, ChevronUp, Filter, GraduationCap, Search, Trophy, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { DepartmentTrainingResultItem } from '../../api/dept-head-service';

// ─── Label Maps ───

const EVAL_LABELS: Record<string, string> = { Passed: 'Đạt', Failed: 'Không đạt', Pending: 'Chờ đánh giá' };
const LEARN_LABELS: Record<string, string> = { Completed: 'Hoàn thành', InProgress: 'Đang học', NotStarted: 'Chưa bắt đầu' };

function evalBadgeClass(s: string) {
    return s === 'Passed' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : s === 'Failed' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200';
}
function learnBadgeClass(s: string) {
    return s === 'Completed' ? 'bg-blue-100 text-blue-700 border-blue-200' : s === 'InProgress' ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-slate-100 text-slate-600 border-slate-200';
}

// ─── Course Summary Card ───

interface CourseSummary {
    courseName: string;
    courseCode: string;
    total: number;
    passed: number;
    failed: number;
    pending: number;
    avgScore: number;
    avgProgress: number;
}

// ─── Component ───

export function TrainingResultsTrackingPage({
    initialData,
    initialError,
}: {
    initialData: DepartmentTrainingResultItem[];
    sourceEndpoint?: string | null;
    initialError?: string;
}) {
    const [search, setSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [evalFilter, setEvalFilter] = useState('all');
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

    const courseOptions = useMemo(() => Array.from(new Set(initialData.map((i) => i.courseName))), [initialData]);

    const filteredItems = useMemo(() => {
        const q = search.trim().toLowerCase();
        return initialData.filter((item) => {
            if (q && ![item.employeeName, item.employeeEmail, item.courseName].some((v) => v.toLowerCase().includes(q))) return false;
            if (courseFilter !== 'all' && item.courseName !== courseFilter) return false;
            if (evalFilter !== 'all' && item.evaluationStatus !== evalFilter) return false;
            return true;
        });
    }, [courseFilter, evalFilter, initialData, search]);

    // Summary stats
    const stats = useMemo(() => {
        const total = filteredItems.length;
        const passed = filteredItems.filter((i) => i.evaluationStatus === 'Passed').length;
        const failed = filteredItems.filter((i) => i.evaluationStatus === 'Failed').length;
        const inProgress = filteredItems.filter((i) => i.learningStatus === 'InProgress').length;
        const avgScore = total > 0 ? Math.round(filteredItems.reduce((s, i) => s + (i.quizScore ?? 0), 0) / Math.max(filteredItems.filter((i) => i.quizScore !== null).length, 1)) : 0;
        const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
        return { total, passed, failed, inProgress, avgScore, passRate };
    }, [filteredItems]);

    // Course summaries for accordion
    const courseSummaries = useMemo<CourseSummary[]>(() => {
        const map = new Map<string, DepartmentTrainingResultItem[]>();
        filteredItems.forEach((i) => { const arr = map.get(i.courseName) || []; arr.push(i); map.set(i.courseName, arr); });
        return Array.from(map.entries()).map(([name, items]) => {
            const withScores = items.filter((i) => i.quizScore !== null);
            return {
                courseName: name,
                courseCode: items[0]?.courseCode || '',
                total: items.length,
                passed: items.filter((i) => i.evaluationStatus === 'Passed').length,
                failed: items.filter((i) => i.evaluationStatus === 'Failed').length,
                pending: items.filter((i) => i.evaluationStatus === 'Pending').length,
                avgScore: withScores.length > 0 ? Math.round(withScores.reduce((s, i) => s + (i.quizScore ?? 0), 0) / withScores.length) : 0,
                avgProgress: items.length > 0 ? Math.round(items.reduce((s, i) => s + i.progressPercentage, 0) / items.length) : 0,
            };
        });
    }, [filteredItems]);

    return (
        <div className="space-y-6">
            {/* Hero Header */}
            <div className="learning-hero">
                <div className="learning-hero__orb-1" />
                <div className="learning-hero__orb-2" />
                <div className="relative z-10 space-y-2">
                    <div className="learning-breadcrumb">
                        <span>Quản lý</span><span>›</span><span style={{ color: 'rgba(187,225,250,0.9)' }}>Đánh giá đào tạo</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Theo dõi kết quả đào tạo</h1>
                    <p className="text-sm text-white/60 max-w-xl">Theo dõi chi tiết tiến độ học tập, kết quả thi và trạng thái đánh giá của từng thành viên phòng ban tại mỗi khóa học.</p>
                </div>
            </div>

            {initialError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">⚠️ {initialError}</div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                <KpiCard icon={<Users className="w-5 h-5" />} label="Tổng lượt cử đi học" value={stats.total} color="blue" />
                <KpiCard icon={<Trophy className="w-5 h-5" />} label="Đạt quiz" value={stats.passed} subtext={stats.total > 0 ? `${stats.passRate}%` : undefined} color="emerald" />
                <KpiCard icon={<BarChart3 className="w-5 h-5" />} label="Chưa đạt" value={stats.failed} color="red" />
                <KpiCard icon={<BookOpenCheck className="w-5 h-5" />} label="Đang học" value={stats.inProgress} color="violet" />
                <KpiCard icon={<GraduationCap className="w-5 h-5" />} label="Điểm TB quiz" value={`${stats.avgScore}%`} color="amber" />
            </div>

            {/* Filter Bar */}
            <div className="learning-card p-5 space-y-4">
                <div className="flex items-center gap-2 text-[#0F4C75] font-semibold text-sm"><Filter className="w-4 h-4" /> Bộ lọc</div>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm nhân viên, email, khóa học..." className="pl-9" />
                    </div>
                    <Select value={courseFilter} onValueChange={setCourseFilter}>
                        <SelectTrigger><SelectValue placeholder="Khóa học" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả khóa học</SelectItem>
                            {courseOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={evalFilter} onValueChange={setEvalFilter}>
                        <SelectTrigger><SelectValue placeholder="Kết quả" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            <SelectItem value="Passed">Đạt</SelectItem>
                            <SelectItem value="Failed">Không đạt</SelectItem>
                            <SelectItem value="Pending">Chờ đánh giá</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={() => { setSearch(''); setCourseFilter('all'); setEvalFilter('all'); }}>Xóa lọc</Button>
                </div>
            </div>

            {/* Course Summary Accordion */}
            <div className="space-y-3">
                <h2 className="text-lg font-black text-[#0F4C75]">Tổng quan theo khóa học</h2>
                {courseSummaries.length === 0 ? (
                    <p className="text-sm text-gray-500">Không có dữ liệu phù hợp.</p>
                ) : courseSummaries.map((cs) => {
                    const isOpen = expandedCourse === cs.courseName;
                    const courseItems = filteredItems.filter((i) => i.courseName === cs.courseName);
                    return (
                        <div key={cs.courseName} className="learning-card overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setExpandedCourse(isOpen ? null : cs.courseName)}
                                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition"
                            >
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-[#0F4C75]/10 flex items-center justify-center shrink-0">
                                        <GraduationCap className="w-5 h-5 text-[#0F4C75]" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-[#0F4C75] truncate">{cs.courseName}</h3>
                                            {cs.courseCode && <Badge variant="outline" className="text-xs">{cs.courseCode}</Badge>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {cs.total} thành viên • TB điểm: {cs.avgScore}% • TB tiến độ: {cs.avgProgress}%
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="hidden md:flex items-center gap-2">
                                        <Badge className="bg-emerald-100 text-emerald-700 border-0">{cs.passed} đạt</Badge>
                                        <Badge className="bg-red-100 text-red-700 border-0">{cs.failed} trượt</Badge>
                                        <Badge className="bg-amber-100 text-amber-700 border-0">{cs.pending} chờ</Badge>
                                    </div>
                                    {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </div>
                            </button>
                            {isOpen && (
                                <div className="border-t border-gray-100 overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead>Nhân viên</TableHead>
                                                <TableHead>Tiến độ</TableHead>
                                                <TableHead>Quiz</TableHead>
                                                <TableHead>Lượt thi</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead>Kết quả</TableHead>
                                                <TableHead>Ngày cử đi</TableHead>
                                                <TableHead>Ngày hoàn thành</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {courseItems.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className="font-semibold text-gray-800 text-sm">{item.employeeName}</div>
                                                        <div className="text-xs text-gray-400">{item.employeeEmail}</div>
                                                    </TableCell>
                                                    <TableCell className="min-w-[160px]">
                                                        <div className="space-y-1.5">
                                                            <div className="flex justify-between text-xs text-gray-500">
                                                                <span>{item.completedLessons}/{item.totalLessons} bài</span>
                                                                <span className="font-semibold">{item.progressPercentage}%</span>
                                                            </div>
                                                            <Progress value={item.progressPercentage} className="h-2" />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.quizScore !== null ? (
                                                            <span className={`font-bold text-base ${item.quizScore >= 70 ? 'text-emerald-600' : item.quizScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{item.quizScore}%</span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400">—</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600">{item.attemptCount > 0 ? `${item.attemptCount} lượt` : '—'}</TableCell>
                                                    <TableCell><Badge variant="outline" className={learnBadgeClass(item.learningStatus)}>{LEARN_LABELS[item.learningStatus] || item.learningStatus}</Badge></TableCell>
                                                    <TableCell><Badge variant="outline" className={evalBadgeClass(item.evaluationStatus)}>{EVAL_LABELS[item.evaluationStatus] || item.evaluationStatus}</Badge></TableCell>
                                                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(item.assignedAt), 'dd/MM/yyyy')}</span>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">
                                                        {item.completedAt ? format(new Date(item.completedAt), 'dd/MM/yyyy') : '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Full Table (all items) */}
            <div className="learning-card overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-[#F8FBFF] to-white">
                    <h2 className="font-black tracking-tight text-[#0F4C75]">Chi tiết toàn bộ kết quả</h2>
                    <p className="text-[11px] text-gray-400 mt-1">{filteredItems.length} bản ghi</p>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Nhân viên</TableHead>
                                <TableHead>Khóa học</TableHead>
                                <TableHead>Tiến độ</TableHead>
                                <TableHead>Quiz</TableHead>
                                <TableHead>Lượt thi</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Kết quả</TableHead>
                                <TableHead>Ngày cử đi</TableHead>
                                <TableHead>Hoàn thành</TableHead>
                                <TableHead>Ghi chú</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="py-12 text-center text-sm text-gray-500">Không có dữ liệu phù hợp với bộ lọc hiện tại.</TableCell>
                                </TableRow>
                            ) : filteredItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-semibold text-gray-800 text-sm">{item.employeeName}</div>
                                        <div className="text-xs text-gray-400">{item.employeeEmail}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-gray-800 text-sm">{item.courseName}</div>
                                        {item.courseCode && <div className="text-xs text-gray-400">{item.courseCode}</div>}
                                    </TableCell>
                                    <TableCell className="min-w-[150px]">
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{item.completedLessons}/{item.totalLessons}</span>
                                                <span className="font-semibold">{item.progressPercentage}%</span>
                                            </div>
                                            <Progress value={item.progressPercentage} className="h-1.5" />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {item.quizScore !== null ? (
                                            <span className={`font-bold ${item.quizScore >= 70 ? 'text-emerald-600' : item.quizScore >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{item.quizScore}%</span>
                                        ) : <span className="text-gray-400">—</span>}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600">{item.attemptCount || '—'}</TableCell>
                                    <TableCell><Badge variant="outline" className={learnBadgeClass(item.learningStatus)}>{LEARN_LABELS[item.learningStatus] || item.learningStatus}</Badge></TableCell>
                                    <TableCell><Badge variant="outline" className={evalBadgeClass(item.evaluationStatus)}>{EVAL_LABELS[item.evaluationStatus] || item.evaluationStatus}</Badge></TableCell>
                                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{format(new Date(item.assignedAt), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-sm text-gray-600 whitespace-nowrap">{item.completedAt ? format(new Date(item.completedAt), 'dd/MM/yyyy') : '—'}</TableCell>
                                    <TableCell className="text-sm text-gray-500 max-w-[200px] truncate">{item.note || '—'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}

// ─── KPI Card ───

const KPI_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50 border-blue-100', text: 'text-[#0F4C75]', icon: 'bg-[#0F4C75]/10 text-[#0F4C75]' },
    emerald: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-700', icon: 'bg-emerald-100 text-emerald-600' },
    red: { bg: 'bg-red-50 border-red-100', text: 'text-red-700', icon: 'bg-red-100 text-red-600' },
    violet: { bg: 'bg-violet-50 border-violet-100', text: 'text-violet-700', icon: 'bg-violet-100 text-violet-600' },
    amber: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-700', icon: 'bg-amber-100 text-amber-600' },
};

function KpiCard({ icon, label, value, subtext, color }: { icon: React.ReactNode; label: string; value: string | number; subtext?: string; color: string }) {
    const c = KPI_COLORS[color] || KPI_COLORS.blue;
    return (
        <div className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${c.bg}`}>
            <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center mb-3`}>{icon}</div>
            <p className={`text-3xl font-black ${c.text}`}>{value}</p>
            {subtext && <p className="text-xs font-semibold text-gray-500 mt-0.5">{subtext} tỷ lệ đạt</p>}
            <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
        </div>
    );
}