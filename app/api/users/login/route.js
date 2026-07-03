import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/db';
import {
  USERS_COLLECTION,
  normalizeEmail,
  sanitizeUser,
  validateCredentials,
  verifyPassword,
} from '../../../lib/users';
import {
  createSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from '../../../lib/session';

export async function POST(req) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const password = body?.password || '';

    const credentialError = validateCredentials({ email, password });
    if (credentialError) {
      return NextResponse.json({ error: credentialError }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('editgenlx');

    const user = await db.collection(USERS_COLLECTION).findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    await db.collection(USERS_COLLECTION).updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
    );

    const safeUser = sanitizeUser(user);
    const token = await createSessionToken(safeUser);

    const response = NextResponse.json({ success: true, user: safeUser });
    response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to log in.' }, { status: 500 });
  }
}
