'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { Send, UserCircle2, Loader2, MessageSquare } from 'lucide-react';

import { feedbackService, type FeedbackReplyDto } from '@/features/employee/api/feedback-service';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface FeedbackReplyThreadProps {
    feedbackId: number | string;
    currentUserRole?: 'trainee' | 'trainer' | 'hr'; 
}

export function FeedbackReplyThread({ feedbackId }: FeedbackReplyThreadProps) {
    const [replies, setReplies] = useState<FeedbackReplyDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchReplies = useCallback(async () => {
        try {
            setLoading(true);
            const data = await feedbackService.getFeedbackReplies(feedbackId);
            setReplies(data || []);
        } catch (err) {
            console.error('Lỗi khi tải phản hồi:', err);
        } finally {
            setLoading(false);
        }
    }, [feedbackId]);

    useEffect(() => {
        fetchReplies();
    }, [fetchReplies]);

    const handleReplySubmit = async () => {
        if (!replyContent.trim()) return;

        try {
            setSubmitting(true);
            setError('');
            await feedbackService.replyFeedback(feedbackId.toString(), {
                replyContent: replyContent.trim(),
                isAnonymous
            });
            setReplyContent('');
            await fetchReplies();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể gửi phản hồi lúc này.';
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-4 pt-2">
            {/* List of existing replies */}
            <div className="space-y-4">
                {replies.length > 0 ? (
                    replies.map(reply => (
                        <div key={reply.id} className="flex space-x-3">
                            <div className="flex-shrink-0 mt-1">
                                {reply.replyByAvatarUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={reply.replyByAvatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200" />
                                ) : (
                                    <UserCircle2 className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-800 border border-gray-100">
                                <div className="flex items-baseline justify-between mb-1">
                                    <span className="font-semibold text-[#0F4C75]">
                                        {reply.isAnonymous ? 'Người dùng Ẩn danh' : reply.replyByName || 'Người quản lý'}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                        {format(new Date(reply.createdAt), 'dd/MM/yyyy HH:mm')}
                                    </span>
                                </div>
                                <p className="whitespace-pre-wrap">{reply.replyContent}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-gray-400 flex items-center gap-2 italic">
                        <MessageSquare className="w-4 h-4" /> Chưa có thảo luận nào
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="flex space-x-3 mt-4 border-t border-gray-100 pt-4">
                <div className="flex-shrink-0 mt-1">
                    <UserCircle2 className="w-8 h-8 text-[#0F4C75]/60" />
                </div>
                <div className="flex-1 space-y-2">
                    <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Viết câu trả lời..."
                        className="min-h-[60px] resize-none text-sm bg-white border-gray-200 focus-visible:ring-[#3282B8]"
                        disabled={submitting}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleReplySubmit();
                            }
                        }}
                    />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Checkbox 
                                id={`anonymous-${feedbackId}`} 
                                checked={isAnonymous}
                                onCheckedChange={(c) => setIsAnonymous(!!c)}
                            />
                            <label htmlFor={`anonymous-${feedbackId}`} className="text-xs text-gray-500 cursor-pointer select-none">
                                Gửi ẩn danh
                            </label>
                        </div>
                        <Button 
                            size="sm" 
                            onClick={handleReplySubmit}
                            disabled={!replyContent.trim() || submitting}
                            className="bg-[#0F4C75] hover:bg-[#1B4F72] h-8 px-3"
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Send className="w-3.5 h-3.5 mr-1" />}
                            Gửi
                        </Button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                </div>
            </div>
        </div>
    );
}
