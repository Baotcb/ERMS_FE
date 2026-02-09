'use client'

import dynamic from 'next/dynamic'

const Toaster = dynamic(() => import("@/components/ui/toaster").then(mod => mod.Toaster), {
    ssr: false
})
const FloatingMenu = dynamic(() => import("@/components/layout/floating-menu").then(mod => mod.FloatingMenu), {
    ssr: true // Keep SSR for menu if it has SEO content, otherwise false
})

export function ClientLayoutElements() {
    return (
        <>
            <FloatingMenu />
            <Toaster />
        </>
    )
}
