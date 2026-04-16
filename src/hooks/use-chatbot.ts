import { useState, useEffect, useCallback } from 'react'
import { chatService } from '../features/training/api/chat-service'
import { ChatMessage } from '../features/training/types/chat-types'
import { useChatbotStore } from '../stores/chatbot-store'
import { useAuthStore } from '../stores/auth-store'

export function useChatbot() {
    const { 
        currentConversationId, 
        isExpanded, 
        toggleExpanded, 
        setExpanded,
        conversations,
        loadConversations,
        deleteConversation,
        isSending,
        setIsSending,
        selectConversation
    } = useChatbotStore()

    const { user } = useAuthStore()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isLoadingMessages, setIsLoadingMessages] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load messages when conversation changes
    useEffect(() => {
        let isMounted = true
        
        async function fetchMessages() {
            if (!currentConversationId) {
                setMessages([])
                return
            }
            
            try {
                setIsLoadingMessages(true)
                setError(null)
                const data = await chatService.getHistory(currentConversationId)
                if (isMounted) {
                    // Assuming messages are ordered oldest first or need to be sorted
                    // We'll just set them as returned from API for now
                    setMessages(data)
                }
            } catch (err: unknown) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Lỗi tải tin nhắn')
                    setMessages([])
                }
            } finally {
                if (isMounted) {
                    setIsLoadingMessages(false)
                }
            }
        }

        if (isExpanded) {
            fetchMessages()
        }
        
        return () => { isMounted = false }
    }, [currentConversationId, isExpanded])

    const sendMessage = useCallback(async (content: string) => {
        if (!user || user.role !== 'DepartmentHead') {
            setError('Bạn không có quyền thực hiện hành động này.')
            return
        }

        if (!content.trim()) return

        setError(null)
        setIsSending(true)

        // Optimistic UI update for user message
        const optimisticId = `temp-${Date.now()}`
        const newMessage: ChatMessage = {
            id: optimisticId,
            conversationId: currentConversationId || '',
            role: 'user',
            content,
            createdAt: new Date().toISOString()
        }

        setMessages(prev => [...prev, newMessage])

        try {
            const response = await chatService.sendMessage({
                conversationId: currentConversationId,
                message: content
            })

            // Update conversation ID if it was a new conversation
            if (!currentConversationId && response.conversationId) {
                selectConversation(response.conversationId)
                // We should also reload conversations since a new one was created
                await loadConversations()
            }

            // Replace optimistic user message & add assistant response
            // For now, we just fetch history to ensure everything is synced, 
            // OR we can manually append the new messages if the API returns them nicely.
            // Let's assume response contains the assistant's message, or we refetch.
            // A simple refetch is safest to get proper IDs, but if it takes too long, we can manually append.
            const history = await chatService.getHistory(response.conversationId)
            setMessages(history)

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Gửi tin nhắn thất bại')
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.id !== optimisticId))
        } finally {
            setIsSending(false)
        }
    }, [currentConversationId, user, selectConversation, loadConversations, setIsSending])

    const clearHistory = useCallback(async () => {
        if (currentConversationId) {
            await deleteConversation(currentConversationId)
            setMessages([])
            selectConversation(null)
        }
    }, [currentConversationId, deleteConversation, selectConversation])

    const startNewConversation = useCallback(() => {
        selectConversation(null)
        setMessages([])
        setError(null)
    }, [selectConversation])

    return {
        messages,
        isExpanded,
        isLoading: isSending,
        isLoadingMessages,
        error,
        conversationId: currentConversationId,
        conversations,
        toggleExpanded,
        setExpanded,
        sendMessage,
        clearHistory,
        startNewConversation,
        selectConversation,
        deleteConversation
    }
}
