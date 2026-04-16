'use client'

import dynamic from 'next/dynamic'
import { ChatbotWidget } from '@/components/floating/chatbot-widget'

const Toaster = dynamic(() => import("@/components/ui/toaster").then(mod => mod.Toaster), {
    ssr: false
})
const FloatingMenu = dynamic(() => import("@/components/layout/floating-menu").then(mod => mod.FloatingMenu), {
    ssr: false // Skip SSR for menu as it's interactive-only and adds to render time
})

export function ClientLayoutElements() {
    return (
        <>
            <FloatingMenu />
            <Toaster />
            <ChatbotWidget key="chatbot" />
        </>
    )
}
