import { useData } from '@/lib/swr/hooks'
import useSWRMutation from 'swr/mutation'
import { mutate } from 'swr'
import * as service from '../api/offer-service'
import type { CreateOfferRequest, ConfirmHireRequest } from '../types/offer-types'

const HR_OFFERS_KEY = '/api/applications/hr/my-offers'

// Hook lấy danh sách offer do HR tạo
export function useHROffers() {
    return useData(HR_OFFERS_KEY, {
        fetcher: () => service.getHROffers(),
    })
}

// Hook lấy chi tiết offer theo ID
export function useHROfferById(id: string | null) {
    return useData(id ? `${HR_OFFERS_KEY}/${id}` : null, {
        fetcher: () => service.getHROfferById(id!),
    })
}

// Hook tạo offer mới — tự revalidate danh sách sau khi tạo
export function useCreateOffer() {
    return useSWRMutation(
        HR_OFFERS_KEY,
        (_, { arg }: { arg: CreateOfferRequest }) =>
            service.createOffer(arg),
        {
            onSuccess: () => {
                mutate(HR_OFFERS_KEY)
            },
        }
    )
}

// Hook xác nhận tuyển dụng — tạo tài khoản nhân viên
export function useConfirmHire() {
    return useSWRMutation(
        'confirm-hire',
        (_, { arg }: { arg: ConfirmHireRequest }) =>
            service.confirmHire(arg),
        {
            onSuccess: () => {
                mutate(HR_OFFERS_KEY)
            },
        }
    )
}
