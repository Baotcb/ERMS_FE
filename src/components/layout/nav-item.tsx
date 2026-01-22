
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface NavItemProps {
    label: React.ReactNode;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    href?: string;
    align?: "left" | "right";
    className?: string; // For the trigger
}

export function NavItem({
    label,
    icon,
    children,
    href,
    align = "left",
    className,
}: NavItemProps) {
    // If no children, render a simple Link or span
    if (!children) {
        if (href) {
            return (
                <Link
                    href={href}
                    className={cn(
                        "flex items-center gap-1 font-bold text-slate-700 hover:text-brand-primary transition-colors h-full px-1",
                        className
                    )}
                >
                    {label}
                </Link>
            );
        }
        return (
            <span
                className={cn(
                    "flex items-center gap-1 font-bold text-slate-700 hover:text-brand-primary transition-colors cursor-pointer h-full px-1",
                    className
                )}
            >
                {label}
            </span>
        );
    }

    return (
        <div className="group relative h-full flex items-center">
            {/* Trigger Area */}
            <div
                className={cn(
                    "flex items-center gap-1 font-bold text-slate-700 hover:text-brand-primary transition-colors cursor-pointer py-4 px-1 outline-none",
                    className
                )}
            >
                <span className="flex items-center gap-1">
                    {icon}
                    {label}
                </span>
                <ChevronDown
                    className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180"
                />
            </div>

            {/* Dropdown Content */}
            <div
                className={cn(
                    "absolute top-full transition-all duration-200 ease-out transform z-50",
                    "opacity-0 invisible scale-95",
                    "group-hover:opacity-100 group-hover:visible group-hover:scale-100",
                    align === "left" ? "left-0 origin-top-left" : "right-0 origin-top-right"
                )}
            >
                {/* Visual Card */}
                <div className="bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}
