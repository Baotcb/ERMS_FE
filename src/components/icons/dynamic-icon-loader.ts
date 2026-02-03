/**
 * Dynamic Icon Loader
 * Dynamically imports icons from lucide-react to reduce bundle size
 * Icons are loaded on-demand rather than all at once
 */

import React from 'react'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

/**
 * Dynamically load an icon from lucide-react
 * @param iconName - The name of the icon (e.g., 'Menu', 'Search')
 * @returns React component for the icon
 */
export function createDynamicIcon(iconName: string): ComponentType<any> {
    return dynamic(
        () => import('lucide-react').then((mod: any) => {
            const icon = mod[iconName] as ComponentType<any>
            if (!icon) {
                throw new Error(`Icon "${iconName}" not found in lucide-react`)
            }
            return { default: icon }
        }),
        {
            loading: () => React.createElement('div', {
                className: 'w-4 h-4 bg-gray-200 rounded animate-pulse'
            }),
            ssr: false // Skip server-side rendering for icons
        }
    )
}
