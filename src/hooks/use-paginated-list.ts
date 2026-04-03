'use client';

import { useState, useCallback } from 'react';
import useSWR, { type SWRConfiguration, type KeyedMutator } from 'swr';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';

/**
 * Standard shape returned by paginated API endpoints.
 * Fields are optional to be compatible with various backend result types.
 */
export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
}

export interface UsePaginatedListOptions<T> {
    /** SWR cache key prefix (e.g. ['/api/TrainingPlan', 'director']) */
    key: string[];
    /** Async fetcher that receives the current pagination params */
    fetcher: (params: {
        search?: string;
        page: number;
        pageSize: number;
        [k: string]: unknown;
    }) => Promise<PaginatedResult<T>>;
    /** Items per page (defaults to DEFAULT_PAGE_SIZE) */
    pageSize?: number;
    /** SSR initial data for SWR fallback */
    initialData?: PaginatedResult<T>;
    /** Extra params appended to both the SWR key and fetcher call */
    extraParams?: Record<string, string | undefined>;
    /** SWR config overrides */
    swrOptions?: SWRConfiguration<PaginatedResult<T>>;
}

export interface UsePaginatedListReturn<T> {
    /** Current page items */
    items: T[];
    /** Total number of items across all pages */
    totalCount: number;
    /** Total number of pages */
    totalPages: number;
    /** Current page number (1-indexed) */
    page: number;
    /** Set the current page */
    setPage: (page: number | ((prev: number) => number)) => void;
    /** Current raw search input */
    search: string;
    /** Set search and auto-reset to page 1 */
    handleSearch: (value: string) => void;
    /** Debounced search value (the one sent to the API) */
    debouncedSearch: string;
    /** Whether data is currently loading */
    isLoading: boolean;
    /** SWR error, if any */
    error: Error | undefined;
    /** SWR mutate function for manual revalidation */
    mutate: KeyedMutator<PaginatedResult<T>>;
}

/**
 * Reusable hook for paginated list data with search + SWR.
 *
 * Replaces the duplicated pattern of:
 *   useState(search) + useState(page) + useDebouncedValue + useSWR + derived items/totalPages
 *
 * @example
 * ```tsx
 * const list = usePaginatedList({
 *     key: ['/api/TrainingPlan'],
 *     fetcher: (params) => hrTrainingService.getPlans(params),
 *     extraParams: { status: statusFilter },
 *     initialData,
 * });
 *
 * // Use: list.items, list.page, list.setPage, list.search, list.handleSearch, etc.
 * ```
 */
export function usePaginatedList<T>(
    options: UsePaginatedListOptions<T>,
): UsePaginatedListReturn<T> {
    const {
        key,
        fetcher,
        pageSize = DEFAULT_PAGE_SIZE,
        initialData,
        extraParams = {},
        swrOptions,
    } = options;

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const debouncedSearch = useDebouncedValue(search, 300);

    // Build a stable SWR key that includes all parameters
    const extraValues = Object.values(extraParams).filter(Boolean);
    const swrKey = [...key, debouncedSearch, page, ...extraValues];

    const { data, isLoading, error, mutate } = useSWR<PaginatedResult<T>>(
        swrKey,
        () =>
            fetcher({
                search: debouncedSearch || undefined,
                page,
                pageSize,
                ...extraParams,
            }),
        {
            fallbackData: initialData,
            ...swrOptions,
        },
    );

    const handleSearch = useCallback((value: string) => {
        setSearch(value);
        setPage(1);
    }, []);

    return {
        items: data?.items ?? [],
        totalCount: data?.totalCount ?? 0,
        totalPages: data?.totalPages ?? 1,
        page,
        setPage,
        search,
        handleSearch,
        debouncedSearch,
        isLoading,
        error,
        mutate,
    };
}
