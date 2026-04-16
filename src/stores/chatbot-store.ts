import { create } from 'zustand'
import { ChatConversation } from '../features/training/types/chat-types'
import { chatService } from '../features/training/api/chat-service'
import { logger } from '../lib/logger'

interface ChatbotState {
    conversations: ChatConversation[]
    currentConversationId: string | null
    isExpanded: boolean
    isLoading: boolean
    isSending: boolean
    hasRetrievedInitial: boolean

    // Actions
    setExpanded: (expanded: boolean) => void
    toggleExpanded: () => void
    selectConversation: (id: string | null) => void
    loadConversations: () => Promise<void>
    deleteConversation: (id: string) => Promise<void>
    
    // UI state that use-chatbot relies on
    setIsLoading: (isLoading: boolean) => void
    setIsSending: (isSending: boolean) => void
}

export const useChatbotStore = create<ChatbotState>((set, get) => ({
    conversations: [],
    currentConversationId: null,
    isExpanded: false,
    isLoading: false,
    isSending: false,
    hasRetrievedInitial: false,

    setExpanded: (expanded) => {
        set({ isExpanded: expanded })
        // On expand, load conversations if not yet loaded
        if (expanded && !get().hasRetrievedInitial) {
            get().loadConversations()
            set({ hasRetrievedInitial: true })
        }
    },
    
    toggleExpanded: () => get().setExpanded(!get().isExpanded),

    selectConversation: (id) => set({ currentConversationId: id }),

    loadConversations: async () => {
        try {
            set({ isLoading: true })
            const data = await chatService.getConversations(1, 100) // load a bunch
            set({ conversations: data, isLoading: false })
            
            // If we have conversations but no current selected, maybe select the first one?
            // Usually we start with a new conversation (null ID) or user explicitly clicks
            if (data.length > 0 && !get().currentConversationId) {
                 set({ currentConversationId: data[0].id })
            }
        } catch (error) {
            logger.error('Failed to load conversations', error)
            set({ isLoading: false })
        }
    },

    deleteConversation: async (id: string) => {
        try {
            await chatService.deleteConversation(id)
            const newConversations = get().conversations.filter(c => c.id !== id)
            set({ 
                conversations: newConversations,
                currentConversationId: get().currentConversationId === id ? null : get().currentConversationId
            })
        } catch (error) {
            logger.error('Failed to delete conversation', error)
            throw error
        }
    },

    setIsLoading: (isLoading) => set({ isLoading }),
    setIsSending: (isSending) => set({ isSending })
}))

