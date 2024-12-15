import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from '@/app/login/page'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders login form', () => {
        render(<Login />)

        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('handles successful login', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true })
            }) as Promise<Response>
        )

        render(<Login />)

        await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com')
        await userEvent.type(screen.getByLabelText(/password/i), 'password123')

        fireEvent.submit(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/home')
        })
    })

    it('handles login error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ message: 'Invalid credentials' })
            }) as Promise<Response>
        )

        render(<Login />)

        await userEvent.type(screen.getByLabelText(/email address/i), 'test@example.com')
        await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword')

        fireEvent.submit(screen.getByRole('button', { name: /sign in/i }))

        await waitFor(() => {
            expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
        })
    })
})