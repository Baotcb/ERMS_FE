'use client'

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { mutate } from 'swr'
import * as service from '../api/offer-service'
import type { AcceptOfferRequest, RejectOfferRequest } from '../types/offer-types'

const MY_OFFERS_KEY = '/api/applications/my-offers'

// Hook lấy danh sách offer của ứng viên
export function useMyOffers(params?: { pageNumber?: number; pageSize?: number }) {
    const key = params?.pageNumber
        ? `${MY_OFFERS_KEY}?page=${params.pageNumber}`
        : MY_OFFERS_KEY

    return useSWR(key, () => service.getMyOffers(params), {
        revalidateOnFocus: false,
        keepPreviousData: true,
    })
}

// Hook lấy chi tiết 1 offer
export function useMyOfferById(offerId: string | null) {
    return useSWR(
        offerId ? `${MY_OFFERS_KEY}/${offerId}` : null,
        () => service.getMyOfferById(offerId!),
        { revalidateOnFocus: false }
    )
}

// Hook chấp nhận offer
export function useAcceptOffer() {
    return useSWRMutation(
        MY_OFFERS_KEY,
        (_, { arg }: { arg: AcceptOfferRequest }) => service.acceptOffer(arg),
        { onSuccess: () => mutate(MY_OFFERS_KEY) }
    )
}

// Hook từ chối offer
export function useRejectOffer() {
    return useSWRMutation(
        MY_OFFERS_KEY,
        (_, { arg }: { arg: RejectOfferRequest }) => service.rejectOffer(arg),
        { onSuccess: () => mutate(MY_OFFERS_KEY) }
    )
}
