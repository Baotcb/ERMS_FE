'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Reusable hook for async form submissions / action handlers with toast notifications.
 *
 * Replaces the duplicated pattern of:
 *   useState(isSubmitting) + try/catch + toast(success) + toast(error) + finally
 *
 * @example
 * ```tsx
 * const { execute, isSubmitting } = useAsyncAction();
 *
 * const handleApprove = () => execute(
 *     () => directorTrainingService.approvePlan(planId),
 *     {
 *         successMessage: { title: 'Thành công', description: 'Đã duyệt kế hoạch.' },
 *         onSuccess: () => { setDialogOpen(false); mutate(); },
 *     }
 * );
 * ```
 */
export function useAsyncAction() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const execute = useCallback(
        async <T = void>(
            action: () => Promise<T>,
            options: {
                successMessage?: { title: string; description: string };
                errorFallback?: string;
                onSuccess?: (result: T) => void;
                onError?: (error: Error) => void;
            } = {},
        ): Promise<T | undefined> => {
            setIsSubmitting(true);
            try {
                const result = await action();
                if (options.successMessage) {
                    toast(options.successMessage);
                }
                options.onSuccess?.(result);
                return result;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : options.errorFallback ?? 'Không thể thực hiện. Vui lòng thử lại.';
                toast({
                    variant: 'destructive',
                    title: 'Lỗi',
                    description: message,
                });
                options.onError?.(err instanceof Error ? err : new Error(message));
                return undefined;
            } finally {
                setIsSubmitting(false);
            }
        },
        [toast],
    );

    return { execute, isSubmitting };
}
