import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE_NAME = 'editgenix_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error('AUTH_SECRET is required for session cookies.');
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user) {
  return new SignJWT({
    sub: String(user.id),
    email: user.email,
    role: user.role || 'user',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token) {
  const { payload } = await jwtVerify(token, getSessionSecret());
  return payload;
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  };
}
