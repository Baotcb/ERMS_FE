'use client'

import { SWRConfig } from 'swr'
import { DEFAULT_SWR_CONFIG } from '@/lib/swr/config'

export function SWRProvider({ children }: { children: React.ReactNode }) {
    return (
        <SWRConfig value={DEFAULT_SWR_CONFIG}>
            {children}
        </SWRConfig>
    )
}
