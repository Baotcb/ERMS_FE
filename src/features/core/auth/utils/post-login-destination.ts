type ResolvePostLoginDestinationOptions = {
    role: string | undefined
    redirectTarget: string | null
    candidateRole: string
    adminRole: string
    defaultEnterpriseDashboard: string
    roleDashboardMap: Record<string, string>
}

export function resolvePostLoginDestination({
    role,
    redirectTarget,
    candidateRole,
    adminRole,
    defaultEnterpriseDashboard,
    roleDashboardMap,
}: ResolvePostLoginDestinationOptions) {
    const dashboard = roleDashboardMap[role || ''] || defaultEnterpriseDashboard

    if (!redirectTarget || !redirectTarget.startsWith('/') || redirectTarget.startsWith('//')) {
        return role === candidateRole ? '/' : dashboard
    }

    if (redirectTarget.startsWith('/api')) {
        return role === candidateRole ? '/' : dashboard
    }

    if (role === candidateRole) {
        return redirectTarget.startsWith('/enterprise') ? '/' : redirectTarget
    }

    if (redirectTarget.startsWith('/enterprise')) {
        return redirectTarget
    }

    if (role === adminRole && redirectTarget.startsWith('/admin')) {
        return redirectTarget
    }

    return dashboard
}
