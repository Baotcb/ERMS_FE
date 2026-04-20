'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * CurrencyInput
 * -------------
 * Drop-in replacement for <Input type="number" /> that auto-formats the value
 * with thousand separators while the user types (locale-aware; defaults to
 * Vietnamese which uses "." as the grouping separator).
 *
 * The underlying form value is always a `number | undefined`, so it works
 * transparently with react-hook-form (just spread `{...field}` like you would
 * with the regular Input).
 */
export interface CurrencyInputProps
    extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
    value?: number | string | null
    /** Called with the parsed numeric value (or undefined for empty input). */
    onChange?: (value: number | undefined) => void
    /** BCP-47 locale used for grouping separators. Defaults to `vi-VN`. */
    locale?: string
}

function parseNumber(raw: string): number | undefined {
    const digits = raw.replace(/[^\d]/g, '')
    if (digits === '') return undefined
    const n = Number(digits)
    return Number.isFinite(n) ? n : undefined
}

function formatNumber(
    value: number | string | null | undefined,
    locale: string,
): string {
    if (value === null || value === undefined || value === '') return ''
    const num =
        typeof value === 'number'
            ? value
            : Number(String(value).replace(/[^\d-]/g, ''))
    if (!Number.isFinite(num)) return ''
    return new Intl.NumberFormat(locale).format(num)
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    function CurrencyInput(
        { value, onChange, onBlur, locale = 'vi-VN', className, ...props },
        ref,
    ) {
        const [display, setDisplay] = React.useState<string>(() =>
            formatNumber(value, locale),
        )

        // Keep internal display in sync when the external value changes (e.g.
        // form reset or async load). Avoid clobbering the input while the user
        // is mid-edit by only updating when the parsed display differs from
        // the incoming value.
        React.useEffect(() => {
            const parsed = parseNumber(display)
            const incoming =
                value === null || value === undefined || value === ''
                    ? undefined
                    : typeof value === 'number'
                        ? value
                        : Number(String(value).replace(/[^\d-]/g, ''))
            if (parsed !== incoming) {
                setDisplay(formatNumber(value, locale))
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [value, locale])

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const num = parseNumber(e.target.value)
            setDisplay(formatNumber(num, locale))
            onChange?.(num)
        }

        return (
            <input
                ref={ref}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                data-slot="input"
                value={display}
                onChange={handleChange}
                onBlur={onBlur}
                className={cn(
                    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                    className,
                )}
                {...props}
            />
        )
    },
)
