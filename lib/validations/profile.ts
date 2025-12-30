import { z } from 'zod'

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Họ và tên là bắt buộc')
    .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự')
    .regex(/^[\p{L}\s]+$/u, 'Họ và tên chỉ được chứa chữ cái và khoảng trắng'),

  dateOfBirth: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      'Ngày sinh không hợp lệ'
    )
    .refine(
      (val) => {
        if (!val) return true
        const date = new Date(val)
        const now = new Date()
        const minDate = new Date('1900-01-01')
        return date >= minDate && date <= now
      },
      'Ngày sinh phải trong khoảng từ 1900 đến hiện tại'
    ),

  hometown: z
    .string()
    .max(200, 'Quê quán không được vượt quá 200 ký tự')
    .optional(),

  phones: z
    .string()
    .regex(/^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)')
    .optional()
    .or(z.literal('')),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>
