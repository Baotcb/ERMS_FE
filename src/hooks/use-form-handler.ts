/**
 * Generic Form Handler Hook
 * Provides common form logic: state management, validation, and submission
 * Reduces code duplication across forms
 * 
 * Note: Type casting is required due to compatibility issues between
 * Zod v4 and @hookform/resolvers which expects Zod v3 types
 */

'use client'

import { useState } from 'react'
import {
  useForm,
  FieldValues,
  DefaultValues,
  Resolver,
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { ZodSchema } from 'zod'

interface UseFormHandlerOptions<TFieldValues extends FieldValues> {
  /**
   * Zod schema for form validation
   */
  schema: ZodSchema<TFieldValues>
  defaultValues: DefaultValues<TFieldValues>
  mode?: 'onBlur' | 'onChange' | 'onSubmit' | 'all' | 'onTouched'
}

export function useFormHandler<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  mode = 'onSubmit',
}: UseFormHandlerOptions<TFieldValues>) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const form = useForm<TFieldValues>({
    // Library incompatibility between currently installed zod/hookform versions requires this cast
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as Resolver<TFieldValues>,
    defaultValues,
    mode,
  })

  // Create a wrapper that adds loading/error state management
  const customHandleSubmit: typeof form.handleSubmit = (onValid, onInvalid) => {
    return async (e?: React.BaseSyntheticEvent) => {
      const handler = form.handleSubmit(async (data, event) => {
        setError(null)
        setSuccess(null)
        setIsLoading(true)

        try {
          await onValid(data, event)
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Đã có lỗi xảy ra'
          setError(errorMessage)
        } finally {
          setIsLoading(false)
        }
      }, onInvalid)

      await handler(e)
    }
  }

  return {
    form,
    isLoading,
    error,
    success,
    setError,
    setSuccess,
    handleSubmit: customHandleSubmit,
  }
}
