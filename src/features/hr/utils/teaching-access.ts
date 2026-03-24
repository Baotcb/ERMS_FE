import { USER_ROLES } from '@/utils/constants';

interface TeachingAccessIdentity {
    isTrainer?: boolean;
    role?: string;
}

const TEACHING_ENABLED_ROLES = new Set<string>([
    USER_ROLES.TRAINER,
    USER_ROLES.DEPARTMENT_HEAD,
    USER_ROLES.DIRECTOR,
]);

export function canAccessTeachingWorkspace(
    user?: TeachingAccessIdentity | null,
    fallbackRole?: string | null
): boolean {
    if (user?.isTrainer) {
        return true;
    }

    const role = user?.role || fallbackRole || '';
    return TEACHING_ENABLED_ROLES.has(role);
}
