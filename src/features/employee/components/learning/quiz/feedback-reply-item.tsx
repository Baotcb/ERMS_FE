"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FeedbackReplyDto } from '@/features/employee/api/feedback-service';
import { useAuth } from '@/features/core/auth/hooks/use-auth';
import { useAsyncAction } from '@/hooks/use-async-action';

interface FeedbackReplyItemProps {
    reply: FeedbackReplyDto;
    onUpdate: (replyId: number, content: string) => Promise<void>;
    onDelete: (replyId: number) => Promise<void>;
    onReplyTo?: (replyId: number) => void;
}

export function FeedbackReplyItem({ reply, onUpdate, onDelete, onReplyTo }: FeedbackReplyItemProps) {
    const { user } = useAuth();
    const isOwner = user?.id === reply.replyBy;
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(reply.replyContent);
    const { execute, isSubmitting: isSaving } = useAsyncAction();

    const handleSave = async () => {
        if (!editContent.trim()) return;
        await execute(
            async () => {
                await onUpdate(reply.id, editContent);
            },
            {
                errorFallback: 'Lỗi khi cập nhật phản hồi.',
                onSuccess: () => setIsEditing(false)
            }
        );
    };

    const initial = reply.isAnonymous ? '?' : (reply.replyByName?.charAt(0) || 'U');
    const authorName = reply.isAnonymous ? 'Người dùng ẩn danh' : (reply.replyByName || 'Người dùng Ẩn');

    return (
        <div className="flex gap-3 mb-4">
            <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={reply.isAnonymous ? '' : (reply.replyByAvatarUrl || '')} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">{initial}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-2xl px-4 py-2.5 inline-block max-w-full">
                    <div className="flex items-baseline justify-between gap-4 mb-1">
                        <span className="font-semibold text-sm text-gray-900">{authorName}</span>
                        {isOwner && !isEditing && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-gray-200">
                                        <MoreVertical className="h-3 w-3 text-gray-500" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-32">
                                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                        <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(reply.id)} className="text-red-600 focus:text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" /> Xóa
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="space-y-2 mt-2">
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[60px] text-sm resize-none bg-white"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Hủy</Button>
                                <Button size="sm" onClick={handleSave} disabled={isSaving || !editContent.trim()}>
                                    {isSaving ? 'Đang lưu...' : 'Lưu'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{reply.replyContent}</p>
                    )}
                </div>
                {!isEditing && (
                    <div className="flex items-center gap-3 mt-1 ml-2">
                        <span className="text-xs text-gray-400">{format(new Date(reply.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                        {onReplyTo && (
                            <button onClick={() => onReplyTo(reply.id)} className="text-xs text-blue-600 font-medium hover:underline">
                                Phản hồi
                            </button>
                        )}
                    </div>
                )}
                
                {/* Render children if any */}
                {reply.children && reply.children.length > 0 && (
                    <div className="mt-3 relative before:absolute before:left-[-15px] before:top-0 before:bottom-0 before:w-px before:bg-gray-200">
                        {reply.children.map(child => (
                            <FeedbackReplyItem 
                                key={child.id} 
                                reply={child} 
                                onUpdate={onUpdate} 
                                onDelete={onDelete} 
                                onReplyTo={onReplyTo} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
