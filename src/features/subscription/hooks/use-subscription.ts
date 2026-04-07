import useSWR from 'swr'
import { fetchSubscriptionPlans, fetchCurrentSubscription } from '../api/subscription-service'

export function useSubscriptionPlans() {
    const { data, error, isLoading } = useSWR('/api/Subscription/plans', fetchSubscriptionPlans)
    return { plans: data, error, isLoading }
}

export function useCurrentSubscription() {
    const { data, error, isLoading, mutate } = useSWR('/api/Subscription/current', fetchCurrentSubscription)
    return { subscription: data, error, isLoading, mutate }
}
