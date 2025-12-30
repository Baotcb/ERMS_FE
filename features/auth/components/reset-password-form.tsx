import type React from 'react'
import Link from 'next/link'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Lock, AlertCircle } from 'lucide-react'
import type { ResetPasswordFormData } from '../types'

interface ResetPasswordFormProps {
  onSubmit: (e: React.FormEvent) => void
  isLoading: boolean
  error: string | null
  email: string
  token: string
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  isLoading,
  error,
  email,
  token
}) => {
  const {
    register,
    formState: { errors }
  } = useFormContext<ResetPasswordFormData>()

  // Check if required parameters are missing
  const hasRequiredParams = email && token

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-600">
          <Lock className="size-6 text-white" />
        </div>

        <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
        <CardDescription>
          Nhập mật khẩu mới của bạn dưới đây
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!hasRequiredParams ? (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              Liên kết đặt lại không hợp lệ hoặc bị thiếu. Vui lòng kiểm tra email của bạn để nhận liên kết đặt lại chính xác.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500">
                Email này sẽ được sử dụng để đặt lại mật khẩu của bạn
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Nhập mật khẩu mới của bạn"
                {...register('newPassword')}
                disabled={isLoading}
                className={errors.newPassword ? 'border-red-500' : ''}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-500">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Xác nhận mật khẩu mới của bạn"
                {...register('confirmPassword')}
                disabled={isLoading}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !hasRequiredParams}
            >
              {isLoading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm">
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
