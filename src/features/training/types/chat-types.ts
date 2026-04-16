export interface ChatMessage {
    id: string;
    conversationId: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
}

export interface ChatConversation {
    id: string;
    title: string | null;
    lastMessageAt: string | null;
    createdAt: string;
}

export interface ChatResponse {
    conversationId: string;
    assistantMessage: string;
    suggestions: Array<{
        title: string;
        description?: string;
        courseId?: string;
        courseName?: string;
        skillName?: string;
    }>;
}

export interface ChatSendRequest {
    conversationId: string | null;
    message: string;
}
