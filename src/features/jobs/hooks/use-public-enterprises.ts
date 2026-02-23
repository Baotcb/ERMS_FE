import { useData } from '@/lib/swr/hooks'
import * as service from '../api/public-enterprise-service'
import type { PublicEnterprise, PublicJobPostingDto } from '../types'

export function usePublicEnterprises() {
    return useData<PublicEnterprise[]>('/api/public/enterprises', {
        fetcher: () => service.getPublicEnterprises(),
    })
}

export function usePublicEnterprise(name: string) {
    return useData<{ enterprise: PublicEnterprise; jobs: PublicJobPostingDto[] } | null>(
        name ? `/api/public/enterprises/${encodeURIComponent(name)}` : null,
        {
            fetcher: () => service.getPublicEnterpriseByName(name),
        }
    )
}
