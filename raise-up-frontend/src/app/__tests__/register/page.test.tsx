import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Register from '@/app/register/page'

const mockPush = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

describe('Register Component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders registration form', () => {
        render(<Register />)

        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('validates matching passwords', async () => {
        render(<Register />)

        await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe')
        await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com')
        await userEvent.type(screen.getByLabelText(/^password/i), 'password123')
        await userEvent.type(screen.getByLabelText(/confirm password/i), 'password124')

        fireEvent.submit(screen.getByRole('button', { name: /create account/i }))

        await waitFor(() => {
            expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
        })
    })

    it('handles successful registration', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true })
            }) as Promise<Response>
        )

        render(<Register />)

        await userEvent.type(screen.getByLabelText(/full name/i), 'John Doe')
        await userEvent.type(screen.getByLabelText(/email address/i), 'john@example.com')
        await userEvent.type(screen.getByLabelText(/^password/i), 'password123')
        await userEvent.type(screen.getByLabelText(/confirm password/i), 'password123')

        fireEvent.submit(screen.getByRole('button', { name: /create account/i }))

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login?registered=true')
        })
    })
})