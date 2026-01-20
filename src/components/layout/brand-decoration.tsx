"use client";

import React from "react";

export function BrandDecoration({ className }: { className?: string }) {
    return (
        <svg
            width="70"
            height="50"
            viewBox="0 0 70 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="brand-grad" x1="0" y1="0" x2="70" y2="50" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#0F4C75" />
                    <stop offset="50%" stopColor="#BBE1FA" />
                    <stop offset="100%" stopColor="#FF7E67" />
                </linearGradient>
            </defs>

            {/* Chevron 1 - Leftmost */}
            <path
                d="M10 5 L25 25 L10 45"
                stroke="url(#brand-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
            />

            {/* Chevron 2 - Middle */}
            <path
                d="M25 5 L40 25 L25 45"
                stroke="url(#brand-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
            />

            {/* Chevron 3 - Rightmost */}
            <path
                d="M40 5 L55 25 L40 45"
                stroke="url(#brand-grad)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
            />

            {/* Small accent dot */}
            <circle cx="65" cy="25" r="3" fill="#FF7E67" />
        </svg>
    );
}
