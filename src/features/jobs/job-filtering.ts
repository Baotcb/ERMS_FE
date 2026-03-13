export const EXPERIENCE_OPTIONS = [
    { value: '', label: 'Tất cả kinh nghiệm' },
    { value: '0', label: 'Chưa có kinh nghiệm' },
    { value: '0-1', label: 'Dưới 1 năm' },
    { value: '1-2', label: '1 - 2 năm' },
    { value: '2-3', label: '2 - 3 năm' },
    { value: '3-5', label: '3 - 5 năm' },
    { value: '5+', label: 'Trên 5 năm' },
] as const

export const SALARY_OPTIONS = [
    { value: '', label: 'Tất cả mức lương' },
    { value: '0-10', label: 'Dưới 10 triệu' },
    { value: '10-15', label: '10 - 15 triệu' },
    { value: '15-20', label: '15 - 20 triệu' },
    { value: '20-30', label: '20 - 30 triệu' },
    { value: '30+', label: 'Trên 30 triệu' },
] as const

export const EMPLOYMENT_OPTIONS = [
    { value: '', label: 'Tất cả hình thức' },
    { value: 'Full-time', label: 'Toàn thời gian' },
    { value: 'Part-time', label: 'Bán thời gian' },
    { value: 'Contract', label: 'Hợp đồng' },
    { value: 'Internship', label: 'Thực tập' },
] as const

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'salary_desc', label: 'Lương cao nhất' },
    { value: 'relevance', label: 'Phù hợp nhất' },
] as const

export const PUBLIC_JOB_PAGE_SIZE = 10
export const ALL_LOCATIONS_LABEL = 'Tất cả địa điểm'

type SearchParamsInput = URLSearchParams | { toString(): string } | undefined | null

export interface JobFilterUpdates {
    q?: string | null
    location?: string | null
    employment?: string | null
    experience?: string | null
    salary?: string | null
    departmentId?: string | null
    sort?: string | null
    page?: string | number | null
}

export function getSalaryRangeFromValue(value?: string | null): { minSalary?: number; maxSalary?: number } {
    switch (value) {
        case '0-10':
            return { minSalary: 0, maxSalary: 10_000_000 }
        case '10-15':
            return { minSalary: 10_000_000, maxSalary: 15_000_000 }
        case '15-20':
            return { minSalary: 15_000_000, maxSalary: 20_000_000 }
        case '20-30':
            return { minSalary: 20_000_000, maxSalary: 30_000_000 }
        case '30+':
            return { minSalary: 30_000_000 }
        default:
            return {}
    }
}

export function parseJobPageParam(value?: string | null) {
    const parsed = Number.parseInt(value ?? '', 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export function mergeJobSearchParams(current: SearchParamsInput, updates: JobFilterUpdates, resetPage = true) {
    const params = new URLSearchParams(current?.toString() ?? '')

    for (const [key, value] of Object.entries(updates)) {
        if (value == null || value === '' || (key === 'sort' && value === 'newest') || (key === 'page' && String(value) === '1')) {
            params.delete(key)
            continue
        }

        params.set(key, String(value).trim())
    }

    if (resetPage && !Object.prototype.hasOwnProperty.call(updates, 'page')) {
        params.delete('page')
    }

    return params
}

export function buildJobsHref(updates?: JobFilterUpdates, current?: SearchParamsInput, resetPage = true) {
    const params = mergeJobSearchParams(current, updates ?? {}, resetPage)
    const query = params.toString()
    return query ? `/jobs?${query}` : '/jobs'
}

export function normalizeLocationChoice(value?: string | null) {
    if (!value || value === ALL_LOCATIONS_LABEL) {
        return undefined
    }

    return value
}

export function getLocationChoiceLabel(value?: string | null) {
    return value || ALL_LOCATIONS_LABEL
}

export function getKeywordFromPositionLabel(label: string) {
    return label.replace(/^Việc làm\s+/i, '').trim()
}
