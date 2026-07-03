import bcrypt from 'bcryptjs';

const USERS_COLLECTION = 'users';
const SALT_ROUNDS = 12;

export function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

export function validateCredentials({ email, password }) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return 'A valid email is required.';
  }

  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  return null;
}

export async function ensureUsersIndexes(db) {
  await db.collection(USERS_COLLECTION).createIndex({ email: 1 }, { unique: true });
}

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

export function sanitizeUser(userDoc) {
  if (!userDoc) return null;

  return {
    id: userDoc._id?.toString(),
    email: userDoc.email,
    name: userDoc.name || '',
    role: userDoc.role || 'user',
    createdAt: userDoc.createdAt,
    updatedAt: userDoc.updatedAt,
  };
}

export { USERS_COLLECTION };
