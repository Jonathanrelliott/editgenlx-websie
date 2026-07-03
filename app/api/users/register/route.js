import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/db';
import {
  USERS_COLLECTION,
  ensureUsersIndexes,
  hashPassword,
  normalizeEmail,
  sanitizeUser,
  validateCredentials,
} from '../../../lib/users';

export async function POST(req) {
  try {
    const body = await req.json();
    const email = normalizeEmail(body?.email);
    const password = body?.password || '';
    const name = String(body?.name || '').trim();
    const role = 'user';

    const credentialError = validateCredentials({ email, password });
    if (credentialError) {
      return NextResponse.json({ error: credentialError }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('editgenlx');

    await ensureUsersIndexes(db);

    const existing = await db.collection(USERS_COLLECTION).findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const now = new Date();

    const result = await db.collection(USERS_COLLECTION).insertOne({
      email,
      passwordHash,
      name,
      role,
      createdAt: now,
      updatedAt: now,
    });

    const createdUser = await db.collection(USERS_COLLECTION).findOne({ _id: result.insertedId });

    return NextResponse.json({ success: true, user: sanitizeUser(createdUser) }, { status: 201 });
  } catch (err) {
    if (err?.code === 11000) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
    }

    return NextResponse.json({ error: err.message || 'Failed to register user.' }, { status: 500 });
  }
}
