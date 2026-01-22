/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree
 * Displays fallback UI instead of crashing the entire app
 */

'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logger } from '@/utils/logger'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to logging service
    logger.error('Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
    })

    // You can also send to error tracking service like Sentry here
    // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Đã xảy ra lỗi
            </h1>
            <p className="text-slate-600 mb-6">
              Xin lỗi, ứng dụng đã gặp phải lỗi không mong muốn.
              Vui lòng thử tải lại trang hoặc liên hệ hỗ trợ nếu lỗi tiếp diễn ra.
            </p>

            <div className="space-y-3">
              <Button
                onClick={this.handleReset}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
              >
                Về trang chủ
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-slate-500 cursor-pointer hover:text-slate-700">
                  Chi tiết lỗi (Chế độ phát triển)
                </summary>
                <pre className="mt-2 p-4 bg-slate-100 rounded-lg overflow-auto text-xs text-red-600">
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
