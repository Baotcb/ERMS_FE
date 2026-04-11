'use client'

import { useState, useRef, useCallback } from 'react'
import type { PublicJobPostingDto } from '../types'
import { getPublicJobById } from '../api/public-job-service'

interface PreviewState {
    jobId: string
    job: PublicJobPostingDto | null
    isLoading: boolean
    anchorRect: DOMRect | null
}

const HOVER_DELAY_MS = 300
const jobCache = new Map<string, PublicJobPostingDto>()

export function useJobPreview() {
    const [preview, setPreview] = useState<PreviewState | null>(null)
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const activeJobIdRef = useRef<string | null>(null)

    const showPreview = useCallback((jobId: string, anchorElement: HTMLElement) => {
        // Clear any pending timer
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current)
        }

        hoverTimerRef.current = setTimeout(async () => {
            activeJobIdRef.current = jobId
            const rect = anchorElement.getBoundingClientRect()

            // Check cache first
            const cached = jobCache.get(jobId)
            if (cached) {
                if (activeJobIdRef.current === jobId) {
                    setPreview({ jobId, job: cached, isLoading: false, anchorRect: rect })
                }
                return
            }

            // Show loading state
            setPreview({ jobId, job: null, isLoading: true, anchorRect: rect })

            try {
                const jobData = await getPublicJobById(jobId)
                if (jobData) {
                    jobCache.set(jobId, jobData)
                }
                // Only update if this is still the active job
                if (activeJobIdRef.current === jobId) {
                    setPreview({ jobId, job: jobData, isLoading: false, anchorRect: rect })
                }
            } catch {
                if (activeJobIdRef.current === jobId) {
                    setPreview(null)
                }
            }
        }, HOVER_DELAY_MS)
    }, [])

    const hidePreview = useCallback(() => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current)
            hoverTimerRef.current = null
        }
        activeJobIdRef.current = null
        setPreview(null)
    }, [])

    return { preview, showPreview, hidePreview }
}
