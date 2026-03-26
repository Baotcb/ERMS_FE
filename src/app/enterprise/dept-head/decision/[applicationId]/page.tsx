import { DecisionPage as DecisionPageView } from '@/features/dept-head/components/interview/decision-page'

export default function DecisionRoutePage(props: {
    params: Promise<{ applicationId: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    return <DecisionPageView {...props} />
}
