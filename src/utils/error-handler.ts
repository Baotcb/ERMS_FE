/**
 * Error Handling Utilities
 * Provides standardized error handling across the application
 */

import { logger } from './logger'

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network error occurred') {
    super(message)
    this.name = 'NetworkError'
  }
}

/**
 * Standard error response type from API
 */
export interface ErrorResponse {
  message: string
  code?: string
  field?: string
  details?: unknown
}

/**
 * Handle API response errors
 */
export async function handleApiResponse<T>(
  response: Response,
  defaultErrorMessage: string = 'Đã có lỗi xảy ra'
): Promise<T> {
  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')

  try {
    if (isJson) {
      const data = await response.json()

      if (!response.ok) {
        const errorData = data as ErrorResponse
        throw new ApiError(
          errorData.message || defaultErrorMessage,
          response.status,
          errorData.code
        )
      }

      return data as T
    } else {
      // Handle non-JSON response
      const text = await response.text()

      if (!response.ok) {
        throw new ApiError(
          text || response.statusText || defaultErrorMessage,
          response.status
        )
      }

      // If success but not JSON, return text or empty?? 
      // For this app, we expect JSON. If we got text on 200 OK, it's weird but maybe it's just a string response?
      try {
        return JSON.parse(text) as T
      } catch {
        // If it's really not JSON, return text if T allows, or throw?
        // Let's assume it might be a primitive string return
        return text as unknown as T
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }

    // If JSON parsing failed but we thought it was JSON?
    if (error instanceof SyntaxError) {
      logger.error('JSON Parse Error', error, { responseStatus: response.status })
      throw new ApiError('Invalid response format: ' + (error.message || ''))
    }

    throw new NetworkError()
  }
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    // Handle specific status codes
    switch (error.statusCode) {
      case 401:
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
      case 403:
        return 'Bạn không có quyền thực hiện hành động này.'
      case 404:
        return 'Không tìm thấy tài nguyên yêu cầu.'
      case 409:
        return 'Dữ liệu đã tồn tại.'
      case 422:
        return 'Dữ liệu không hợp lệ.'
      case 429:
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.'
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.'
      default:
        return error.message || 'Đã có lỗi xảy ra.'
    }
  }

  if (error instanceof NetworkError) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Đã có lỗi xảy ra. Vui lòng thử lại.'
}
