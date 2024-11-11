import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

const secretKey = new TextEncoder().encode(
    process.env.JWT_SECRET_KEY || 'our-secret-should-be-here' //TODO: Setup the secret
)

export async function getSession() {
    const token = cookies().get('auth-token')?.value

    if (!token) return null

    try {
        const verified = await jwtVerify(token, secretKey)
        return verified.payload
    } catch (err) {
        return null
    }
}

export async function login(email: string, password: string) {
    const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
        throw new Error('Invalid credentials')
    }

    const data = await res.json()
    return data
}