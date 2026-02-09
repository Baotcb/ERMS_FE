import * as z from 'zod'

export const employeeSchema = z.object({
    fullName: z.string().min(1, 'Họ tên là bắt buộc'),
    email: z.string().email('Email không hợp lệ'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional(), // Required for create, optional for update
    departmentId: z.string().min(1, 'Phòng ban là bắt buộc'),
    position: z.string().optional(),
    employmentType: z.string().default('FullTime'),
    hireDate: z.date().optional(),
    managerId: z.string().optional(),
    status: z.string().default('Active'),
})

export type EmployeeFormValues = z.infer<typeof employeeSchema>
