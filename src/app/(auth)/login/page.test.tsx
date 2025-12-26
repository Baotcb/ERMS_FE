import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from './page'
import { authService } from '@/lib/auth'

// Mock entire dependencies
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

jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        login: jest.fn(),
    }),
}))

jest.mock('@/components/navbar', () => ({
    Navbar: () => <div data-testid="navbar">Navbar</div>,
}))

jest.mock('@/components/footer', () => ({
    Footer: () => <div data-testid="footer">Footer</div>,
}))

// Mock auth service
jest.mock('@/lib/auth', () => ({
    authService: {
        login: jest.fn(),
        getCurrentUser: jest.fn(),
        logout: jest.fn(),
    },
}))

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (authService.getCurrentUser as jest.Mock).mockReturnValue(null)
    })

    it('renders login form', () => {
        render(<LoginPage />)
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument()
    })

    it('handles successful login', async () => {
        // Setup success mock
        ; (authService.login as jest.Mock).mockResolvedValue({ token: 'fake-token' })
            ; (authService.getCurrentUser as jest.Mock).mockReturnValue({
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'hr'
            })

        render(<LoginPage />)

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByLabelText(/mật khẩu/i), { target: { value: 'password123' } })

        const submitButton = screen.getByRole('button', { name: /đăng nhập/i })
        fireEvent.click(submitButton)

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            })
        })
    })

    it('shows error on login failure', async () => {
        // Setup failure mock
        const error = new Error('Invalid credentials')
        // @ts-ignore
        error.message = 'Thông tin đăng nhập không chính xác'
            ; (authService.login as jest.Mock).mockRejectedValue(error)

        render(<LoginPage />)

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'wrong@example.com' } })
        fireEvent.change(screen.getByLabelText(/mật khẩu/i), { target: { value: 'wrongpass' } })

        fireEvent.click(screen.getByRole('button', { name: /đăng nhập/i }))

        await waitFor(() => {
            // Expect the generic error message because standard Error is not ApiException
            expect(screen.getByText(/Đã xảy ra lỗi/i)).toBeInTheDocument()
        })
    })
})
