import { USER_ROLES } from '@/utils/constants';

interface LearningAccessIdentity {
    isTrainer?: boolean;
    role?: string;
}

const LEARNING_ENABLED_ROLES = new Set<string>([
    USER_ROLES.EMPLOYEE,
    USER_ROLES.TRAINER,
    USER_ROLES.DEPARTMENT_HEAD,
    USER_ROLES.DIRECTOR,
    USER_ROLES.HR,
    USER_ROLES.HR_MANAGER,
    USER_ROLES.ADMIN,
]);

export function canAccessLearningWorkspace(
    user?: LearningAccessIdentity | null,
    fallbackRole?: string | null
): boolean {
    if (user?.isTrainer) {
        return true;
    }

    const role = user?.role || fallbackRole || '';
    return LEARNING_ENABLED_ROLES.has(role);
}
