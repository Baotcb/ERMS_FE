"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { feedbackService } from '@/features/employee/api/feedback-service';
import { FeedbackReplyItem } from './feedback-reply-item';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/core/auth/hooks/use-auth';
import { MessageCircle, X } from 'lucide-react';

interface FeedbackReplySectionProps {
    feedbackId: string | number;
}

export function FeedbackReplySection({ feedbackId }: FeedbackReplySectionProps) {
    const { user } = useAuth();
    const canReply = user != null;

    const [isExpanded, setIsExpanded] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [parentReplyId, setParentReplyId] = useState<number | null>(null);
    const [isMutating, setIsMutating] = useState(false);

    const { toast } = useToast();
    const queryKey = `/api/Feedback/${feedbackId}/replies`;

    const { data: replies = [], isLoading, mutate } = useSWR(
        isExpanded ? queryKey : null,
        () => feedbackService.getFeedbackReplies(feedbackId)
    );

    const onSubmit = async () => {
        if (!replyContent.trim()) return;
        setIsMutating(true);
        try {
            await feedbackService.replyFeedback(feedbackId.toString(), {
                replyContent: replyContent.trim(),
                isAnonymous,
                parentReplyId
            });
            mutate();
            setReplyContent('');
            setParentReplyId(null);
            toast({
                title: 'Thành công',
                description: 'Đã gửi giải đáp/phản hồi',
            });
        } catch (error) {
            const err = error as Error;
            toast({
                title: 'Lỗi',
                description: err.message || 'Không thể gửi phản hồi',
                variant: 'destructive',
            });
        } finally {
            setIsMutating(false);
        }
    };

    const handleUpdate = async (id: number, content: string) => {
        try {
            await feedbackService.updateReply(id, { replyContent: content });
            mutate();
        } catch (error) {
            const err = error as Error;
            toast({ title: 'Lỗi cập nhật', description: err.message, variant: 'destructive' });
            throw err;
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc muốn xóa phản hồi này?')) return;
        try {
            await feedbackService.deleteReply(id);
            mutate();
        } catch (error) {
            const err = error as Error;
            toast({ title: 'Lỗi xóa', description: err.message, variant: 'destructive' });
        }
    };

    const handleReplyTo = (id: number) => {
        setParentReplyId(id);
    };

    return (
        <div className="mt-4 w-full">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
                <MessageCircle className="w-4 h-4 mr-2" />
                {isExpanded ? 'Đóng góc thảo luận' : 'Thảo luận / Phản hồi'}
            </Button>

            {isExpanded && (
                <div className="mt-4 pl-4 border-l-2 border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {isLoading ? (
                        <div className="text-sm text-gray-500 animate-pulse">Đang tải phản hồi...</div>
                    ) : (
                        <div className="space-y-2">
                            {replies.length > 0 ? (
                                replies.map(reply => (
                                    <FeedbackReplyItem
                                        key={reply.id}
                                        reply={reply}
                                        onUpdate={handleUpdate}
                                        onDelete={handleDelete}
                                        onReplyTo={handleReplyTo}
                                    />
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic">Chưa có phản hồi nào.</p>
                            )}
                        </div>
                    )}

                    {canReply && (
                        <div className="bg-white rounded-xl border border-blue-100 p-4 shadow-sm mt-4 relative">
                            {parentReplyId && (
                                <div className="flex items-center justify-between bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg mb-3 text-xs font-medium">
                                    <span>Đang trả lời trực tiếp bình luận nhánh #{parentReplyId}</span>
                                    <button onClick={() => setParentReplyId(null)} className="hover:bg-blue-100 p-1 rounded-full text-blue-800">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <Textarea
                                placeholder="Nhập câu trả lời hoặc giải trình của bạn..."
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="min-h-[80px] bg-gray-50/50 resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-100 mb-3"
                            />
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id={`anonymous-mode-${feedbackId}`}
                                        checked={isAnonymous}
                                        onCheckedChange={setIsAnonymous}
                                    />
                                    <Label htmlFor={`anonymous-mode-${feedbackId}`} className="text-sm text-gray-600 cursor-pointer">
                                        Trả lời dưới danh nghĩa ẩn danh (Anonymous)
                                    </Label>
                                </div>
                                <Button
                                    onClick={onSubmit}
                                    disabled={!replyContent.trim() || isMutating}
                                    className="bg-[#0F4C75] hover:bg-[#0F4C75]/90 text-white w-full sm:w-auto"
                                >
                                    {isMutating ? 'Đang gửi...' : 'Gửi phản hồi'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
