'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Bot, X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChatbot } from '@/hooks/use-chatbot'
import { TypingIndicator } from './typing-indicator'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

const SUGGESTED_PROMPTS = [
    "Phân tích kỹ năng team của tôi",
    "Team tôi cần kỹ năng nào theo xu hướng mới?",
    "Gợi ý khóa học nâng cao kỹ năng mềm",
    "So sánh kỹ năng hiện tại so với yêu cầu"
]

export function ChatbotWidget() {
    const { user } = useAuthStore()
    const {
        messages,
        isExpanded,
        isLoading,
        isLoadingMessages,
        error,
        toggleExpanded,
        setExpanded,
        sendMessage
    } = useChatbot()

    const [input, setInput] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isLoading])

    // Only DeptHead uses this
    if (!user || user.role !== 'DepartmentHead') return null

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() || isLoading) return

        const messageToSend = input
        setInput('')
        await sendMessage(messageToSend)
    }

    const handlePromptClick = (prompt: string) => {
        setInput(prompt)
    }

    const formatTime = (isoString?: string) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        // Convert UTC to Vietnam time (UTC+7)
        const vietnamTime = new Date(date.getTime() + 7 * 60 * 60 * 1000)
        return vietnamTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
    }

    if (!isExpanded) {
        return (
            <Button
                onClick={toggleExpanded}
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
                size="icon"
            >
                <Bot className="h-6 w-6" />
                <span className="sr-only">Mở tư vấn AI</span>
            </Button>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 w-[400px] h-[480px] bg-background border shadow-2xl rounded-2xl flex overflow-hidden z-50 flex-col sm:flex-row transition-all duration-300">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col h-full bg-background relative z-0 min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b bg-primary text-primary-foreground">
                    <div className="flex items-center gap-2">
                        <div>
                            <h3 className="font-semibold text-sm">AI Skill Gap Advisor</h3>
                            <p className="text-xs opacity-80">Trực tuyến</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setExpanded(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoadingMessages ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pb-10">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                <Bot className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-muted-foreground">Xin chào!</p>
                                <p className="text-sm text-muted-foreground">Tôi có thể giúp gì cho việc phân tích kỹ năng team bạn?</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, idx) => (
                                <div key={msg.id || idx} className={cn("flex flex-col gap-1", msg.role === 'user' ? "items-end" : "items-start")}>
                                    <div className={cn(
                                        "max-w-[85%] rounded-2xl p-3 text-sm",
                                        msg.role === 'user' 
                                            ? "bg-primary text-primary-foreground rounded-tr-sm" 
                                            : "bg-muted/50 rounded-tl-sm empty:hidden whitespace-pre-wrap"
                                    )}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground px-1">
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>
                            ))}
                            {isLoading && <TypingIndicator />}
                        </>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 border-t bg-background">
                    {error && (
                        <div className="text-xs text-destructive mb-2 px-1">
                            {error}
                        </div>
                    )}
                    
                    {/* Suggested Prompts - only show if no messages */}
                    {messages.length === 0 && !isLoadingMessages && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {SUGGESTED_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    className="text-[10px] bg-muted/50 hover:bg-muted border rounded-full px-2.5 py-1 text-muted-foreground transition-colors text-left"
                                    onClick={() => handlePromptClick(prompt)}
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            placeholder="Nhập câu hỏi..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="rounded-full"
                        />
                        <Button 
                            type="submit" 
                            size="icon" 
                            disabled={!input.trim() || isLoading}
                            className="rounded-full shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
