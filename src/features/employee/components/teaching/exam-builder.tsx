'use client';

import { useEffect, useState } from 'react';
import { 
    PlusCircle, Trash2, 
    CheckCircle2, Clock, Award, Save, Loader2, AlertCircle, FileSpreadsheet, UploadCloud
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { quizService } from '@/features/hr/api/quiz-service';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

interface ExamBuilderProps {
    courseId: string;
    initialQuizId?: string;
    onQuizLinked?: (quizId: string) => void;
}

const ANSWER_LABELS = ['A', 'B', 'C', 'D'] as const;

function parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const ch = line[i];

        if (ch === '"') {
            const next = line[i + 1];
            if (inQuotes && next === '"') {
                current += '"';
                i++;
                continue;
            }
            inQuotes = !inQuotes;
            continue;
        }

        if (ch === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
            continue;
        }

        current += ch;
    }

    values.push(current.trim());
    return values;
}

export function ExamBuilder({ courseId, initialQuizId = '', onQuizLinked }: ExamBuilderProps) {
    const { toast } = useToast();
    const courseLabel = courseId.slice(0, 8).toUpperCase();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [quizTitle, setQuizTitle] = useState(`Bài thi cuối khóa ${courseLabel}`);
    const [description, setDescription] = useState('Đánh giá cuối khóa để xác định học viên đạt hay không đạt.');
    const [passingScore, setPassingScore] = useState(80);
    const [timeLimit, setTimeLimit] = useState(30);
    const [maxAttempts, setMaxAttempts] = useState(1);
    const [shuffleQuestions, setShuffleQuestions] = useState(true);
    const [shuffleAnswers, setShuffleAnswers] = useState(true);
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
    const [quizFile, setQuizFile] = useState<File | null>(null);
    const [csvPreviewCount, setCsvPreviewCount] = useState<number | null>(null);
    const [csvPreviewFirst, setCsvPreviewFirst] = useState<string>('');
    const [savedQuizId, setSavedQuizId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const parseQuestionsFromCsv = async (file: File): Promise<Array<{
        questionText: string;
        options: string;
        correctAnswer: string;
        points: number;
        orderIndex: number;
    }>> => {
        const csvText = (await file.text()).replace(/^\uFEFF/, '');
        const lines = csvText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length < 2) {
            throw new Error('File CSV không có dữ liệu câu hỏi.');
        }

        const header = parseCsvLine(lines[0]);
        const headerIndex = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());

        const questionTextIdx = headerIndex('QuestionText');
        const optionAIdx = headerIndex('OptionA');
        const optionBIdx = headerIndex('OptionB');
        const optionCIdx = headerIndex('OptionC');
        const optionDIdx = headerIndex('OptionD');
        const correctAnswerIdx = headerIndex('CorrectAnswer');
        const pointsIdx = headerIndex('Points');
        const orderIndexIdx = headerIndex('OrderIndex');

        if ([questionTextIdx, optionAIdx, optionBIdx, optionCIdx, optionDIdx, correctAnswerIdx].some((idx) => idx < 0)) {
            throw new Error('Template CSV không đúng định dạng cột yêu cầu. Vui lòng tải lại template mới nhất.');
        }

        const preparedQuestions: Array<{
            questionText: string;
            options: string;
            correctAnswer: string;
            points: number;
            orderIndex: number;
        }> = [];

        for (let row = 1; row < lines.length; row++) {
            const values = parseCsvLine(lines[row]);

            const questionText = (values[questionTextIdx] || '').trim();
            const optionA = (values[optionAIdx] || '').trim();
            const optionB = (values[optionBIdx] || '').trim();
            const optionC = (values[optionCIdx] || '').trim();
            const optionD = (values[optionDIdx] || '').trim();
            const correctAnswer = (values[correctAnswerIdx] || '').trim().toUpperCase();

            if (!questionText && !optionA && !optionB && !optionC && !optionD) {
                continue;
            }

            if (!questionText || !optionA || !optionB || !optionC || !optionD) {
                throw new Error(`Dòng ${row + 1}: thiếu dữ liệu câu hỏi hoặc lựa chọn đáp án.`);
            }

            if (!ANSWER_LABELS.includes(correctAnswer as (typeof ANSWER_LABELS)[number])) {
                throw new Error(`Dòng ${row + 1}: CorrectAnswer phải là A/B/C/D.`);
            }

            const pointsRaw = values[pointsIdx] || '';
            const parsedPoints = Number(pointsRaw);
            const points = Number.isFinite(parsedPoints) && parsedPoints > 0 ? parsedPoints : 1;

            const orderRaw = values[orderIndexIdx] || '';
            const parsedOrder = Number(orderRaw);
            const orderIndex = Number.isFinite(parsedOrder) && parsedOrder > 0 ? parsedOrder : preparedQuestions.length + 1;

            preparedQuestions.push({
                questionText,
                options: JSON.stringify([optionA, optionB, optionC, optionD]),
                correctAnswer,
                points,
                orderIndex,
            });
        }

        if (preparedQuestions.length === 0) {
            throw new Error('File CSV không có câu hỏi hợp lệ để import.');
        }

        return preparedQuestions;
    };

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

    const addQuestion = () => {
        const newQuestion: Question = {
            id: Math.random().toString(36).substr(2, 9),
            text: '',
            options: ['', '', '', ''],
            correctAnswer: 0
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const updateOption = (qId: string, oIdx: number, value: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                const newOptions = [...q.options];
                newOptions[oIdx] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

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

    const handleSave = async () => {
        if (savedQuizId) {
            toast({ title: 'Quiz đã được tạo', description: 'Khóa học này đã có quiz trong phiên làm việc hiện tại. Tránh bấm lưu lặp để không tạo quiz trùng.', variant: 'destructive' });
            return;
        }

        if (!quizTitle.trim()) {
            toast({ title: 'Thiếu tiêu đề', description: 'Vui lòng nhập tiêu đề bài thi.', variant: 'destructive' });
            return;
        }

        if (!quizFile && questions.length === 0) {
            toast({ title: 'Chưa có dữ liệu quiz', description: 'Vui lòng upload file CSV hoặc thêm ít nhất một câu hỏi.', variant: 'destructive' });
            return;
        }

        if (!quizFile) {
            const invalid = questions.find(q =>
                !q.text.trim() || q.options.some(o => !o.trim())
            );
            if (invalid) {
                toast({ title: 'Dữ liệu chưa đầy đủ', description: 'Vui lòng điền nội dung cho tất cả câu hỏi và các lựa chọn.', variant: 'destructive' });
                return;
            }
        }

        if (Number.isNaN(passingScore) || passingScore < 0 || passingScore > 100) {
            toast({ title: 'Điểm đạt không hợp lệ', description: 'Điểm đạt phải từ 0 đến 100.', variant: 'destructive' });
            return;
        }

        if (Number.isNaN(timeLimit) || timeLimit <= 0) {
            toast({ title: 'Thời lượng không hợp lệ', description: 'Thời gian làm bài phải lớn hơn 0 phút.', variant: 'destructive' });
            return;
        }

        if (Number.isNaN(maxAttempts) || maxAttempts <= 0) {
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

        if (quizFile) {
            const extension = quizFile.name.split('.').pop()?.toLowerCase();
            if (extension !== 'csv') {
                toast({
                    title: 'Định dạng chưa hỗ trợ',
                    description: 'Để tránh tạo ghost quiz, hiện chỉ cho phép import CSV (có thể mở/sửa bằng Excel rồi lưu lại .csv).',
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
        }

        setIsSaving(true);
        let createdQuizId = '';
        try {
            const { quizId } = await quizService.createQuiz(courseId, {
                quizTitle: quizTitle.trim(),
                description: description.trim() || undefined,
                timeLimitMinutes: timeLimit,
                passingScore,
                maxAttempts,
                shuffleQuestions,
                shuffleAnswers,
                showCorrectAnswers,
            });
            createdQuizId = quizId;
            setSavedQuizId(quizId);
            onQuizLinked?.(quizId);

            if (preparedCsvQuestions) {
                for (const question of preparedCsvQuestions) {
                    await quizService.createQuestion(quizId, question);
                }

                toast({
                    title: 'Đã tạo quiz cuối khóa',
                    description: `Đã import ${preparedCsvQuestions.length} câu hỏi cho khóa ${courseLabel}. Học viên sẽ được đánh giá đạt/không đạt dựa trên quiz này.`,
                });
            } else {
                for (const [index, question] of questions.entries()) {
                    await quizService.createQuestion(quizId, {
                        questionText: question.text.trim(),
                        options: JSON.stringify(question.options.map((option) => option.trim())),
                        correctAnswer: ANSWER_LABELS[question.correctAnswer],
                        orderIndex: index + 1,
                        points: 1,
                    });
                }

                toast({
                    title: 'Đã tạo quiz cuối khóa',
                    description: `Đã lưu ${questions.length} câu hỏi cho khóa ${courseLabel}. Học viên sẽ được đánh giá đạt/không đạt dựa trên quiz này.`,
                });
            }

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Không thể tạo bài thi cuối khóa.';
            const duplicateHint = message.toLowerCase().includes('mỗi khóa chỉ có 1 quiz') || message.toLowerCase().includes('đã có quiz');
            const partialCreationHint = createdQuizId
                ? ' Quiz đã được tạo trên hệ thống. Hãy mở lại tab Bài thi cuối khóa để kiểm tra danh sách câu hỏi.'
                : '';

            toast({
                title: 'Không thể tạo quiz',
                description: duplicateHint
                    ? 'Khóa học có thể đã có quiz trên hệ thống (mỗi khóa chỉ 1 quiz). Vui lòng dùng quiz đã gắn với khóa học này.'
                    : `${message}${partialCreationHint}`,
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
                <span>Quiz cuối khóa đã nối BE. Để tránh tạo ghost quiz, hệ thống chỉ nhận import CSV đã kiểm tra hợp lệ trước khi tạo quiz.</span>
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
                            onChange={(e) => setPassingScore(parseInt(e.target.value, 10) || 0)}
                            className="w-24 h-9 rounded-xl border-gray-200 bg-white font-bold text-[#0F4C75]"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3 h-3" /> Thời gian (phút)
                        </Label>
                        <Input 
                            type="number" 
                            value={timeLimit} 
                            onChange={(e) => setTimeLimit(parseInt(e.target.value, 10) || 0)}
                            className="w-24 h-9 rounded-xl border-gray-200 bg-white font-bold text-[#0F4C75]"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Số lượt làm</Label>
                        <Input 
                            type="number" 
                            value={maxAttempts} 
                            onChange={(e) => setMaxAttempts(parseInt(e.target.value, 10))}
                            className="w-24 h-9 rounded-xl border-gray-200 bg-white font-bold text-[#0F4C75]"
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
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                            <Label className="text-sm font-semibold text-gray-700">Trộn câu hỏi</Label>
                            <Switch checked={shuffleQuestions} onCheckedChange={setShuffleQuestions} />
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                            <Label className="text-sm font-semibold text-gray-700">Trộn đáp án</Label>
                            <Switch checked={shuffleAnswers} onCheckedChange={setShuffleAnswers} />
                        </div>
                        <div className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3">
                            <Label className="text-sm font-semibold text-gray-700">Hiện đáp án đúng</Label>
                            <Switch checked={showCorrectAnswers} onCheckedChange={setShowCorrectAnswers} />
                        </div>
                    </div>
                </Card>

                <Card className="rounded-3xl border-dashed border-[#3282B8]/30 bg-blue-50/30 p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-[#0F4C75] font-bold">
                        <FileSpreadsheet className="w-5 h-5" />
                        Upload bộ câu hỏi
                    </div>
                    <p className="text-sm text-gray-500">Chỉ hỗ trợ `.csv` để kiểm tra dữ liệu trước khi tạo quiz (tránh tạo ghost quiz).</p>
                    <Button type="button" variant="outline" onClick={handleDownloadTemplate} className="justify-start border-[#3282B8]/30 text-[#0F4C75] hover:bg-white">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Tải template import quiz
                    </Button>
                    <Input
                        type="file"
                        accept=".csv"
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
                            <span>Chưa chọn file. Bạn vẫn có thể nhập câu hỏi thủ công ở phần bên dưới.</span>
                        )}
                    </div>
                    <div className="flex items-start gap-2 text-xs text-gray-500">
                        <UploadCloud className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>BE đang parse các cột theo thứ tự: QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectAnswer, Explanation, Points, OrderIndex. Với nhập tay, đáp án đúng cũng sẽ được lưu theo mã A/B/C/D để khớp với file import.</span>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                {questions.map((question, qIdx) => (
                    <Card key={question.id} className="p-6 rounded-3xl border-gray-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3282B8]" />
                        <div className="flex justify-between items-start mb-6">
                            <Badge variant="secondary" className="bg-blue-50 text-[#3282B8] border-0 font-bold px-3 py-1">
                                Câu hỏi {qIdx + 1}
                            </Badge>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeQuestion(question.id)}
                                className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-gray-700">Nội dung câu hỏi</Label>
                                <Input 
                                    placeholder="Nhập câu hỏi của bạn..." 
                                    value={question.text}
                                    onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                                    className="rounded-2xl border-gray-100 h-12 text-lg font-medium shadow-sm focus:ring-[#3282B8]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {question.options.map((option, oIdx) => (
                                    <div 
                                        key={oIdx} 
                                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                                            question.correctAnswer === oIdx 
                                            ? 'border-green-200 bg-green-50/30 ring-1 ring-green-100' 
                                            : 'border-gray-50 bg-gray-50/30'
                                        }`}
                                    >
                                        <button 
                                            type="button"
                                            onClick={() => updateQuestion(question.id, { correctAnswer: oIdx })}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                question.correctAnswer === oIdx 
                                                ? 'bg-green-500 border-green-500 text-white' 
                                                : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            {ANSWER_LABELS[oIdx]}
                                        </button>
                                        <Input 
                                            value={option}
                                            onChange={(e) => updateOption(question.id, oIdx, e.target.value)}
                                            placeholder={`Lựa chọn ${ANSWER_LABELS[oIdx]}...`}
                                            className="border-0 bg-transparent h-auto p-0 focus:ring-0 font-medium placeholder:text-gray-300"
                                        />
                                        {question.correctAnswer === oIdx && (
                                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto shrink-0" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                ))}

                <Button 
                    variant="outline" 
                    onClick={addQuestion}
                    className="w-full border-dashed border-2 py-12 rounded-3xl hover:bg-blue-50/50 hover:border-[#3282B8]/30 transition-all text-gray-400 font-bold group"
                >
                    <PlusCircle className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform text-[#3282B8]" />
                    THÊM CÂU HỎI MỚI
                </Button>
            </div>

            {savedQuizId && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 space-y-3">
                    <p>
                        Quiz cuối khóa đã được gắn với khóa học này trên hệ thống. Học viên sẽ tự vào quiz theo khóa học mà không cần nhập mã.
                    </p>
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
