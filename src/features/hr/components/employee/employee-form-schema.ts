import * as z from 'zod'

const phoneRegex = /^[0-9+\-\s()]{10,15}$/
const managedRoles = ['Employee', 'Trainer', 'DepartmentHead', 'Director'] as const

const phoneField = z.string()
    .regex(phoneRegex, 'Số điện thoại không hợp lệ (10-15 chữ số)')
    .optional()
    .or(z.literal(''))

const roleField = z.enum(managedRoles).or(z.literal(''))

const baseEmployeeSchema = z.object({
    fullName: z.string().optional(),
    email: z.string().optional(),
    phone: phoneField,
    password: z.string().optional(),
    departmentId: z.string().optional().or(z.literal('')),
    position: z.string().optional(),
    employmentType: z.string().default('FullTime'),
    hireDate: z.date().optional(),
    status: z.string().default('Active'),
    role: roleField,
})

const validateRoleAndDepartment = (
    values: z.infer<typeof baseEmployeeSchema>,
    ctx: z.RefinementCtx
) => {
    if (!values.role) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['role'],
            message: 'Vai trò là bắt buộc',
        })
    }

    if (values.role && values.role !== 'Director' && !values.departmentId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['departmentId'],
            message: 'Phòng ban là bắt buộc',
        })
    }
}

export const createEmployeeSchema = baseEmployeeSchema.extend({
    fullName: z.string().min(1, 'Họ tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
}).superRefine(validateRoleAndDepartment)

export const updateEmployeeSchema = baseEmployeeSchema.extend({
    fullName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional().or(z.literal('')),
    password: z.string().optional(),
    hireDate: z.date().optional(),
}).superRefine(validateRoleAndDepartment)

export type EmployeeFormValues = z.infer<typeof baseEmployeeSchema>
