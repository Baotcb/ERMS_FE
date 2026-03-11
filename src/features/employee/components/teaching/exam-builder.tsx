'use client';

import { useState } from 'react';
import { 
    PlusCircle, Trash2, 
    CheckCircle2, Clock, Award, Save, Loader2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
}

interface ExamBuilderProps {
    courseId: string;
}

export function ExamBuilder({ courseId }: ExamBuilderProps) {
    const { toast } = useToast();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [passingScore, setPassingScore] = useState(80);
    const [timeLimit, setTimeLimit] = useState(30);
    const [isSaving, setIsSaving] = useState(false);

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

    const handleSave = async () => {
        if (questions.length === 0) {
            toast({ title: 'Chưa có câu hỏi', description: 'Vui lòng thêm ít nhất một câu hỏi.', variant: 'destructive' });
            return;
        }

        const invalid = questions.find(q =>
            !q.text.trim() || q.options.some(o => !o.trim())
        );
        if (invalid) {
            toast({ title: 'Dữ liệu chưa đầy đủ', description: 'Vui lòng điền nội dung cho tất cả câu hỏi và các lựa chọn.', variant: 'destructive' });
            return;
        }

        if (passingScore < 0 || passingScore > 100) {
            toast({ title: 'Điểm đạt không hợp lệ', description: 'Điểm đạt phải từ 0 đến 100.', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            // TODO: Integrate with exam API endpoint when backend is available
            // await examService.saveExam(courseId, { questions, passingScore, timeLimit });
            toast({ title: 'Đã ghi nhận', description: `Bài thi ${questions.length} câu hỏi, điểm đạt ${passingScore}%. Lưu vĩnh viễn sẽ khả dụng khi backend tích hợp endpoint exam.` });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Tính năng bài thi đang chờ tích hợp backend. Câu hỏi được cấu hình ở đây chưa được lưu vĩnh viễn.</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-[#0F4C75]">Bài thi cuối khóa</h3>
                    <p className="text-sm text-gray-500">Tạo các câu hỏi trắc nghiệm để kiểm tra kiến thức của học viên.</p>
                </div>
                
                <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Award className="w-3 h-3" /> Điểm đạt (%)
                        </Label>
                        <Input 
                            type="number" 
                            value={passingScore} 
                            onChange={(e) => setPassingScore(parseInt(e.target.value))}
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
                            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                            className="w-24 h-9 rounded-xl border-gray-200 bg-white font-bold text-[#0F4C75]"
                        />
                    </div>
                </div>
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
                                            onClick={() => updateQuestion(question.id, { correctAnswer: oIdx })}
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                                question.correctAnswer === oIdx 
                                                ? 'bg-green-500 border-green-500 text-white' 
                                                : 'border-gray-200 bg-white'
                                            }`}
                                        >
                                            {oIdx + 1}
                                        </button>
                                        <Input 
                                            value={option}
                                            onChange={(e) => updateOption(question.id, oIdx, e.target.value)}
                                            placeholder={`Lựa chọn ${oIdx + 1}...`}
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

            <div className="flex justify-end pt-8 gap-4">
                <Button 
                    onClick={handleSave} 
                    className="bg-[#0F4C75] hover:bg-[#1B262C] text-white px-12 py-7 rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 min-w-[200px]"
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <span className="flex items-center gap-2">
                            <Save className="w-5 h-5" />
                            LUU BÀI THI
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}
