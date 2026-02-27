/**
 * lib/auth.ts
 * Admin JWT authentication utilities using jose (edge-compatible).
 */
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "ballotbox-admin-secret-key-2026"
)
const COOKIE_NAME = "bb-admin-token"
const TOKEN_EXPIRY = "24h"

export interface AdminPayload {
    adminId: string
    email: string
    name: string
}

/** Create a signed JWT for an admin */
export async function signToken(payload: AdminPayload): Promise<string> {
    return new SignJWT(payload as unknown as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(TOKEN_EXPIRY)
        .sign(JWT_SECRET)
}

/** Verify a JWT and return the payload, or null if invalid */
export async function verifyToken(token: string): Promise<AdminPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        return payload as unknown as AdminPayload
    } catch {
        return null
    }
}

/** Set the auth cookie (call in a server action / route handler) */
export async function setAuthCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24h
    })
}

/** Remove the auth cookie */
export async function clearAuthCookie() {
    const cookieStore = await cookies()
    cookieStore.delete(COOKIE_NAME)
}

/** Read & verify the admin from the current request cookie */
export async function getAdmin(): Promise<AdminPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) return null
    return verifyToken(token)
}
