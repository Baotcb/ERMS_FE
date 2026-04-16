import { apiClient } from '@/lib/api-client'
import { ChatConversation, ChatMessage, ChatResponse, ChatSendRequest } from '../types/chat-types'

export const chatService = {
    async sendMessage(request: ChatSendRequest): Promise<ChatResponse> {
        const response = await apiClient.post('/api/chat/send', request)
        if (!response.ok) {
            throw new Error('Failed to send message')
        }
        return response.json()
    },

    async getConversations(page = 1, pageSize = 10): Promise<ChatConversation[]> {
        const response = await apiClient.get(`/api/chat/conversations?page=${page}&pageSize=${pageSize}`)
        if (!response.ok) return []
        
        const data = await response.json()
        return data.items || []
    },

    async getHistory(conversationId: string, page = 1, pageSize = 50): Promise<ChatMessage[]> {
        const response = await apiClient.get(`/api/chat/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`)
        if (!response.ok) return []
        
        const data = await response.json()
        const items = data.items || []
        return items.map((item: { id: string; role: 'user' | 'assistant'; content: string; createdAt: string }) => ({
            ...item,
            conversationId,
        }))
    },

    async deleteConversation(conversationId: string): Promise<void> {
        const response = await apiClient.delete(`/api/chat/conversations/${conversationId}`)
        if (!response.ok) {
            throw new Error('Failed to delete conversation')
        }
    }
}
