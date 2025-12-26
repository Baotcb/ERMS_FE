import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from './page'
import { authService } from '@/lib/auth'

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}))

jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: jest.fn(),
    }),
}))

jest.mock('@/components/navbar', () => ({
    Navbar: () => <div data-testid="navbar">Navbar</div>,
}))

jest.mock('@/components/footer', () => ({
    Footer: () => <div data-testid="footer">Footer</div>,
}))

jest.mock('@/lib/auth', () => ({
    authService: {
        register: jest.fn(),
    },
}))

describe('RegisterPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders register form', () => {
        render(<RegisterPage />)
        expect(screen.getByLabelText(/họ và tên/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByTestId('register-password')).toBeInTheDocument()
        // Using a more specific selector strategy because there are multiple password fields
    })

    const fillForm = (name: string, email: string, pass: string, confirm: string) => {
        fireEvent.change(screen.getByLabelText(/họ và tên/i), { target: { value: name } })
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } })

        // There are two password inputs (password and confirmPassword), usually labelled "Mật khẩu" and "Xác nhận mật khẩu"
        fireEvent.change(screen.getByLabelText(/^mật khẩu$/i), { target: { value: pass } })
        fireEvent.change(screen.getByLabelText(/xác nhận mật khẩu/i), { target: { value: confirm } })
    }

    it('validates password mismatch', async () => {
        render(<RegisterPage />)

        fillForm('Test User', 'test@example.com', 'password123', 'password456')

        fireEvent.click(screen.getByRole('button', { name: /đăng ký/i }))

        await waitFor(() => {
            expect(screen.getByText(/mật khẩu xác nhận không khớp/i)).toBeInTheDocument()
        })

        expect(authService.register).not.toHaveBeenCalled()
    })

    it('handles successful registration', async () => {
        ; (authService.register as jest.Mock).mockResolvedValue({})

        render(<RegisterPage />)

        fillForm('Test User', 'test@example.com', 'password123', 'password123')

        fireEvent.click(screen.getByRole('button', { name: /đăng ký/i }))

        await waitFor(() => {
            expect(authService.register).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
                fullName: 'Test User',
                role: 'candidate'
            })
        })
    })
})
