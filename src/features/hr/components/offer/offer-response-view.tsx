'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

import { respondOfferByToken, getOfferByToken } from '@/features/hr/api/offer-service'
import { OfferConfirmAction } from '@/features/hr/components/offer/offer-confirm-action'
import { OfferStatusDisplay } from '@/features/hr/components/offer/offer-status-display'
import type { OfferPublicInfo } from '@/features/hr/types/offer-types'

type Status = 'confirm' | 'loading' | 'accepted' | 'rejected' | 'error'

export function OfferResponseView() {
    const params = useParams<{ token: string }>()
    const searchParams = useSearchParams()
    const action = searchParams.get('action') as 'accept' | 'reject' | null
    const [status, setStatus] = useState<Status>('confirm')
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [offerData, setOfferData] = useState<OfferPublicInfo | null>(null)
    const [isLoadingInfo, setIsLoadingInfo] = useState(true)

    // Load offer data when token is present
    useEffect(() => {
        const token = params.token
        if (!token) {
            setIsLoadingInfo(false)
            return
        }
        getOfferByToken(token)
            .then(data => {
                setOfferData(data)
                setIsLoadingInfo(false)
            })
            .catch(err => {
                setErrorMsg(err.message)
                setStatus('error')
                setIsLoadingInfo(false)
            })
    }, [params.token])

    const isAccept = action === 'accept'
    const isValidAction = action === 'accept' || action === 'reject'

    const handleConfirm = async () => {
        const token = params.token

        if (!token || !isValidAction) {
            setStatus('error')
            return
        }

        setStatus('loading')

        try {
            await respondOfferByToken(token, action)
            setStatus(isAccept ? 'accepted' : 'rejected')
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : null)
            setStatus('error')
        }
    }

    const renderContent = () => {
        if (isLoadingInfo) {
            return <OfferStatusDisplay status="loading" />
        }

        if (status === 'confirm' && isValidAction) {
            return <OfferConfirmAction isAccept={isAccept} onConfirm={handleConfirm} offerData={offerData} />
        }

        if (status === 'confirm' && !isValidAction) {
            return <OfferStatusDisplay status="invalid" />
        }

        if (status === 'loading') {
            return <OfferStatusDisplay status="loading" />
        }

        if (status === 'accepted') {
            return <OfferStatusDisplay status="accepted" />
        }

        if (status === 'rejected') {
            return <OfferStatusDisplay status="rejected" />
        }

        if (status === 'error') {
            return <OfferStatusDisplay status="error" errorMsg={errorMsg} />
        }

        return null
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-10 max-w-md w-full text-center">
                {renderContent()}
            </div>
        </div>
    )
}
