'use client';

import { useEffect, useState } from 'react';
import { 
    Clock, Award, Save, Loader2, AlertCircle, FileSpreadsheet, UploadCloud, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { quizService } from '@/features/hr/api/quiz-service';
import { parseQuestionsFromCsv } from '@/features/employee/utils/csv-parser';

interface ExamBuilderProps {
    courseId: string;
    initialQuizId?: string;
    onQuizLinked?: (quizId: string) => void;
}

export function ExamBuilder({ courseId, initialQuizId = '', onQuizLinked }: ExamBuilderProps) {
    const { toast } = useToast();
    const courseLabel = courseId.slice(0, 8).toUpperCase();
    const [quizTitle, setQuizTitle] = useState(`Bài thi cuối khóa ${courseLabel}`);
    const [description, setDescription] = useState('Đánh giá cuối khóa để xác định học viên đạt hay không đạt.');
    const [passingScore, setPassingScore] = useState<number | string>(80);
    const [timeLimit, setTimeLimit] = useState<number | string>(30);
    const [maxAttempts, setMaxAttempts] = useState<number | string>(1);
    const [shuffleQuestions, setShuffleQuestions] = useState(true);
    const [shuffleAnswers, setShuffleAnswers] = useState(true);
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
    const [quizFile, setQuizFile] = useState<File | null>(null);
    const [csvPreviewCount, setCsvPreviewCount] = useState<number | null>(null);
    const [csvPreviewFirst, setCsvPreviewFirst] = useState<string>('');
    const [savedQuizId, setSavedQuizId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (initialQuizId) {
            setSavedQuizId(initialQuizId);
            return;
        }

        let isMounted = true;
        void quizService.getCourseQuiz(courseId)
            .then((quiz) => {
                if (isMounted) {
                    setSavedQuizId(quiz.quizId || '');
                }
            })
            .catch(() => {
                if (isMounted) {
                    setSavedQuizId('');
                }
            });

        return () => {
            isMounted = false;
        };
    }, [courseId, initialQuizId]);

    const handleDownloadTemplate = () => {
        const rows = [
            ['QuestionText', 'OptionA', 'OptionB', 'OptionC', 'OptionD', 'CorrectAnswer', 'Explanation', 'Points', 'OrderIndex'],
            [
                'Nội dung câu hỏi mẫu',
                'Đáp án A',
                'Đáp án B',
                'Đáp án C',
                'Đáp án D',
                'A',
                'Giải thích ngắn cho đáp án đúng',
                '1',
                '1',
            ],
            [
                'Khóa học cuối kỳ cần tối thiểu bao nhiêu điểm để đạt?',
                '50',
                '60',
                '80',
                '100',
                'C',
                'Ví dụ nếu passing score của quiz là 80 thì học viên cần đạt từ 80 điểm trở lên.',
                '1',
                '2',
            ],
        ];

        const csvContent = rows
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\r\n');

        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quiz-template-${courseLabel.toLowerCase()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: 'Đã tải template',
            description: 'Template CSV đã được tải xuống. Bạn có thể mở bằng Excel rồi điền câu hỏi theo đúng cột yêu cầu.',
        });
    };

    const handleDeleteQuiz = async () => {
        if (!savedQuizId) return;
        
        if (!window.confirm('Bạn có chắc chắn muốn xóa bài thi này và tạo lại không? Toàn bộ câu hỏi cũ sẽ bị xóa.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await quizService.deleteQuiz(savedQuizId);
            setSavedQuizId('');
            setQuizFile(null);
            setCsvPreviewCount(null);
            setCsvPreviewFirst('');
            onQuizLinked?.('');
            toast({
                title: 'Đã xóa bài thi',
                description: 'Bạn có thể upload lại file CSV để tạo bài thi mới.',
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Lỗi không xác định khi xóa.';
            toast({
                title: 'Lỗi xóa bài thi',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSave = async () => {
        if (savedQuizId) {
            toast({ title: 'Quiz đã tồn tại', description: 'Khóa học này đã có bài thi cuối khóa, không cần tạo lại.', variant: 'destructive' });
            return;
        }

        if (!quizTitle.trim()) {
            toast({ title: 'Thiếu tiêu đề', description: 'Vui lòng nhập tiêu đề bài thi.', variant: 'destructive' });
            return;
        }

        if (!quizFile) {
            toast({ title: 'Chưa chọn file CSV', description: 'Vui lòng upload file CSV chứa bộ câu hỏi.', variant: 'destructive' });
            return;
        }

        const parsedPassingScore = Number(passingScore);
        if (Number.isNaN(parsedPassingScore) || parsedPassingScore < 0 || parsedPassingScore > 100) {
            toast({ title: 'Điểm đạt không hợp lệ', description: 'Điểm đạt phải từ 0 đến 100.', variant: 'destructive' });
            return;
        }

        const parsedTimeLimit = Number(timeLimit);
        if (Number.isNaN(parsedTimeLimit) || parsedTimeLimit <= 0) {
            toast({ title: 'Thời lượng không hợp lệ', description: 'Thời gian làm bài phải lớn hơn 0 phút.', variant: 'destructive' });
            return;
        }

        const parsedMaxAttempts = Number(maxAttempts);
        if (Number.isNaN(parsedMaxAttempts) || parsedMaxAttempts <= 0) {
            toast({ title: 'Số lượt làm không hợp lệ', description: 'Số lượt làm tối đa phải lớn hơn 0.', variant: 'destructive' });
            return;
        }

        let preparedCsvQuestions: Array<{
            questionText: string;
            options: string;
            correctAnswer: string;
            points: number;
            orderIndex: number;
        }> | null = null;

        const extension = quizFile.name.split('.').pop()?.toLowerCase();
        if (extension !== 'csv') {
            toast({
                title: 'Định dạng chưa hỗ trợ',
                description: 'Để tránh tạo ghost quiz, hiện chỉ cho phép import CSV.',
                variant: 'destructive'
            });
            return;
        }

        try {
            preparedCsvQuestions = await parseQuestionsFromCsv(quizFile);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể đọc file CSV.';
            toast({ title: 'CSV không hợp lệ', description: message, variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            const { quizId } = await quizService.createQuiz(courseId, {
                quizTitle: quizTitle.trim(),
                description: description.trim() || undefined,
                timeLimitMinutes: parsedTimeLimit,
                passingScore: parsedPassingScore,
                maxAttempts: parsedMaxAttempts,
                shuffleQuestions,
                shuffleAnswers,
                showCorrectAnswers,
            });
            setSavedQuizId(quizId);
            onQuizLinked?.(quizId);

            if (preparedCsvQuestions && preparedCsvQuestions.length > 0) {
                for (const question of preparedCsvQuestions) {
                    await quizService.createQuestion(quizId, question);
                }

                toast({
                    title: 'Đã tạo quiz cuối khóa',
                    description: `Đã import ${preparedCsvQuestions.length} câu hỏi cho khóa ${courseLabel}.`,
                });
            } else {
                toast({
                    title: 'Đã tạo quiz',
                    description: `Vui lòng cập nhật câu hỏi sau.`,
                });
            }

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể tạo bài thi cuối khóa.';
            toast({
                title: 'Không thể tạo quiz',
                description: message,
                variant: 'destructive'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#0F4C75]">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Hệ thống kiểm tra nội dung file trước khi tạo bài thi để đảm bảo dữ liệu hợp lệ. Chỉ hỗ trợ định dạng CSV.</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-[#0F4C75]">Bài thi cuối khóa</h3>
                    <p className="text-sm text-gray-500">Tạo quiz để đánh giá học viên đạt hay không đạt sau khi hoàn thành khóa học.</p>
                </div>
                
                <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Award className="w-3 h-3" /> Điểm đạt (%)
                        </Label>
                        <Input 
                            type="number" 
                            value={passingScore} 
                            onChange={(e) => setPassingScore(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            className="w-24 h-9 rounded-xl border-gray-200 bg-white font-bold text-[#0F4C75]"
                            disabled={Boolean(savedQuizId)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Thời gian (phút)
                        </Label>
                        <Input 
                            type="number" 
                            value={timeLimit} 
                            onChange={(e) => setTimeLimit(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            className="w-24 h-9 rounded-xl border-gray-200 bg-white font-bold text-[#0F4C75]"
                            disabled={Boolean(savedQuizId)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số lượt làm</Label>
                        <Input 
                            type="number" 
                            value={maxAttempts} 
                            onChange={(e) => setMaxAttempts(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            className="w-24 h-9 rounded-xl border-gray-200 bg-white font-bold text-[#0F4C75]"
                            disabled={Boolean(savedQuizId)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <Card className="rounded-3xl border-gray-100 p-6 shadow-sm space-y-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-gray-700">Tiêu đề quiz</Label>
                        <Input
                            value={quizTitle}
                            onChange={(e) => setQuizTitle(e.target.value)}
                            placeholder="Nhập tiêu đề bài thi cuối khóa"
                            className="rounded-2xl border-gray-200"
                            disabled={Boolean(savedQuizId)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="font-bold text-gray-700">Mô tả</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả mục tiêu đánh giá cuối khóa"
                            rows={4}
                            className="rounded-2xl border-gray-200"
                            disabled={Boolean(savedQuizId)}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                            <Label className="text-sm font-semibold text-gray-700">Trộn câu hỏi</Label>
                            <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} disabled={Boolean(savedQuizId)} />
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                            <Label className="text-sm font-semibold text-gray-700">Trộn đáp án</Label>
                            <Switch checked={shuffleAnswers} onCheckedChange={setShuffleAnswers} disabled={Boolean(savedQuizId)} />
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                            <Label className="text-sm font-semibold text-gray-700">Hiện đáp án đúng</Label>
                            <Switch checked={showCorrectAnswers} onCheckedChange={setShowCorrectAnswers} disabled={Boolean(savedQuizId)} />
                        </div>
                    </div>
                </Card>

                <Card className="rounded-3xl border-dashed border-[#3282B8]/30 bg-blue-50/30 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-[#0F4C75] font-bold">
                        <FileSpreadsheet className="w-5 h-5" />
                        Upload bộ câu hỏi
                    </div>
                    <p className="text-sm text-gray-500">Chỉ hỗ trợ `.csv` để kiểm tra dữ liệu trước khi tạo quiz (tránh tạo ghost quiz).</p>
                    <Button type="button" variant="outline" onClick={handleDownloadTemplate} className="justify-start border-[#3282B8]/30 text-[#0F4C75] hover:bg-white" disabled={Boolean(savedQuizId)}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Tải template import quiz
                    </Button>
                    <Input
                        type="file"
                        accept=".csv"
                        disabled={Boolean(savedQuizId)}
                        onChange={async (e) => {
                            const file = e.target.files?.[0] ?? null;
                            setQuizFile(file);
                            setCsvPreviewCount(null);
                            setCsvPreviewFirst('');
                            if (file && file.name.endsWith('.csv')) {
                                try {
                                    const parsed = await parseQuestionsFromCsv(file);
                                    setCsvPreviewCount(parsed.length);
                                    setCsvPreviewFirst(parsed[0]?.questionText || '');
                                } catch {
                                    setCsvPreviewCount(null);
                                    setCsvPreviewFirst('');
                                }
                            }
                        }}
                        className="rounded-2xl border-gray-200 bg-white"
                    />
                    <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-600 border border-gray-100 min-h-[60px] flex items-center">
                        {quizFile ? (
                            <div className="space-y-1">
                                <span className="font-medium text-[#0F4C75]">Đã chọn file: {quizFile.name}</span>
                                {csvPreviewCount !== null && (
                                    <div className="text-xs text-green-700">
                                        ✅ {csvPreviewCount} câu hỏi hợp lệ
                                        {csvPreviewFirst && <span className="text-gray-500"> — Câu 1: &quot;{csvPreviewFirst.slice(0, 60)}{csvPreviewFirst.length > 60 ? '...' : ''}&quot;</span>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span>Chưa chọn file CSV (hỗ trợ tối đa 100 câu).</span>
                        )}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-500">
                        <UploadCloud className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>Các cột theo thứ tự: QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Explanation, Points, OrderIndex. Đáp án đúng lưu mã A/B/C/D.</span>
                    </div>
                </Card>
            </div>

            {savedQuizId && (
                <div className="flex items-center justify-between rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
                    <div className="space-y-1 text-sm text-green-800">
                        <p className="font-bold flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Quiz cuối khóa đã được ghi nhận trên hệ thống
                        </p>
                        <p className="opacity-90">
                            Học viên sẽ tự động tham gia bài kiểm tra này theo chương trình học. Không cần cung cấp mã thủ công.
                        </p>
                    </div>
                    <Button 
                        variant="destructive" 
                        onClick={handleDeleteQuiz}
                        disabled={isDeleting}
                        className="rounded-xl px-5 gap-2"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        Xác nhận xóa bài làm lại
                    </Button>
                </div>
            )}

            <div className="flex justify-end pt-8 gap-4">
                <Button 
                    onClick={handleSave} 
                    className="bg-[#0F4C75] hover:bg-[#1B262C] text-white px-12 py-7 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 min-w-[200px]"
                    disabled={isSaving || Boolean(savedQuizId)}
                >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                            <Save className="w-5 h-5" />
                            LƯU BÀI THI
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}
