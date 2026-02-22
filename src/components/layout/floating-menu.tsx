"use client"

import { memo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bookmark, MessageSquare, Headphones, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from "@/features/core/auth/hooks/use-auth"

const ICON_SAVED = <Bookmark className="w-4 h-4 group-hover:fill-current" />
const ICON_CONNECT = <UserPlus className="w-4 h-4" />

interface FloatingMenuItemProps {
    href: string
    icon: React.ReactNode
    label: string
    color: string
    count?: number
}

const FloatingMenuItem = memo(({ href, icon, label, color, count }: FloatingMenuItemProps) => (
    <TooltipProvider delayDuration={0}>
        <Tooltip>
            <TooltipTrigger asChild>
                <Link href={href} className="relative group block">
                    <div className={cn(
                        "w-9 h-9 flex items-center justify-center rounded-full shadow-md transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-x-1 border border-white",
                        "bg-white hover:shadow-lg"
                    )}>
                        <div className={cn("text-slate-500", color)}>
                            {icon}
                        </div>
                    </div>
                    {count !== undefined && count > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                            {count}
                        </span>
                    )}
                </Link>
            </TooltipTrigger>
            <TooltipContent side="left" className="font-semibold bg-slate-900/90 text-white border-0 text-xs px-2 py-1" sideOffset={8}>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
))
FloatingMenuItem.displayName = "FloatingMenuItem"

// Pages where FloatingMenu should NOT appear (HR/Admin areas)
const EXCLUDED_PATHS = [
    '/campaigns',
    '/candidates',
    '/interviews',
    '/offers',
    '/dashboard',
    '/settings',
    '/admin',
]

export function FloatingMenu() {
    const pathname = usePathname()
    const { user } = useAuth()

    // Hide on auth pages
    if (pathname?.match(/^\/(login|register|forgot-password|reset-password|verify-email|confirm-email)/)) {
        return null
    }

    // Hide on HR/Admin pages (regardless of auth state)
    // This prevents showing menu when session expires on these pages
    if (pathname && EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
        return null
    }

    // Hide if logged in as HR/Admin
    if (user?.role && user.role !== 'Candidate') {
        return null
    }

    return (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-[5px] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 items-end">
            {/* Saved Jobs */}
            <FloatingMenuItem
                href="/jobs/saved"
                icon={ICON_SAVED}
                label="Công việc đã lưu"
                color="group-hover:text-brand-coral"
                count={1}
            />

            {/* Job Connections */}
            <FloatingMenuItem
                href="/not-found"
                icon={ICON_CONNECT}
                label="Kết nối việc làm"
                color="group-hover:text-brand-primary"
            />

            {/* Merged Feedback & Support Pill */}
            <div className="bg-white rounded-full shadow-md border border-white flex flex-col items-center mt-1 overflow-hidden">
                {/* Feedback */}
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/not-found" className="w-9 h-9 flex items-center justify-center group hover:bg-slate-50 transition-colors">
                                <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-brand-coral transition-colors" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="font-semibold bg-slate-900/90 text-white border-0 text-xs px-2 py-1" sideOffset={8}>
                            <p>Góp ý</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="w-5 h-px bg-slate-100" />

                {/* Support */}
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Link href="/not-found" className="w-9 h-9 flex items-center justify-center group hover:bg-slate-50 transition-colors">
                                <Headphones className="w-4 h-4 text-slate-500 group-hover:text-brand-coral transition-colors" />
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="font-semibold bg-slate-900/90 text-white border-0 text-xs px-2 py-1" sideOffset={8}>
                            <p>Hỗ trợ</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    )
}
