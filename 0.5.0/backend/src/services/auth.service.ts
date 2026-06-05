import crypto from 'crypto';
import { usersRepository } from '../repositories/users.repository';
import { ApiError } from '../middleware/error-handler.middleware';
import type { CreateUserDto, User } from '../dtos/users.dto';

// Secret for signing JWTs (override in production via env var)
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const JWT_EXPIRES_IN_SECONDS = 60 * 60 * 24; // 24 години
// PBKDF2 parameters for password hashing
const HASH_ITERATIONS = 120000;
const HASH_KEYLEN = 64;
const HASH_DIGEST = 'sha512';

type AuthPayload = {
  id: string;
  role: 'admin' | 'user' | 'guest';
  exp: number;
};

// Named export for utilities used by seed scripts
// (export placed here; `hashPassword` is declared later in the file)
export { hashPassword };

const failedLogins = new Map<string, { count: number; blockedUntil: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_TIME_MS = 15 * 60 * 1000; // 15 хвилин

// Простий in-memory blacklist для анулювання JWT (logout).
// Підходить для локальної розробки; у production потрібно
// використовувати спільне сховище (Redis) для масштабованості.
const revokedTokens = new Set<string>();

function getLoginKey(email: string, ip: string) {
  return `${email.toLowerCase()}:${ip}`;
}

function createJwt(payload: Omit<AuthPayload, 'exp'>): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payloadWithExp = { ...payload, exp: Math.floor(Date.now() / 1000) + JWT_EXPIRES_IN_SECONDS };
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payloadWithExp)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');

  return `${base64Header}.${base64Payload}.${signature}`;
}

function verifyJwt(token: string): AuthPayload {
  const parts = token.split('.');
  // Basic structure validation of JWT
  if (parts.length !== 3) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Невірний формат токена');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const signatureBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Невірний підпис токена');
  }

  const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  const parsed = JSON.parse(payloadJson) as AuthPayload;

  // Expiration check
  if (typeof parsed.exp !== 'number' || parsed.exp < Math.floor(Date.now() / 1000)) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Термін дії токена минув');
  }

  return parsed;
}

function hashPassword(password: string): string {
  // Generate a random salt and derive the password using PBKDF2.
  // Stored format: iterations:salt:derivedHex
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEYLEN, HASH_DIGEST).toString('hex');
  return `${HASH_ITERATIONS}:${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) return false;
  const [iterationsStr, salt, hash] = storedHash.split(':');
  if (!iterationsStr || !salt || !hash) return false;

  const iterations = Number(iterationsStr);
  // Derive and compare using timing-safe equality
  const derived = crypto.pbkdf2Sync(password, salt, iterations, HASH_KEYLEN, HASH_DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
}

function checkBruteForce(email: string, ip: string) {
  const key = getLoginKey(email, ip);
  const state = failedLogins.get(key);
  if (!state) return;
  // If currently blocked, reject with 429
  if (state.blockedUntil > Date.now()) {
    throw new ApiError(
      429,
      'TOO_MANY_REQUESTS',
      `Заблоковано через ${MAX_FAILED_ATTEMPTS} невдалих спроб входу. Спробуйте ще через ${Math.ceil(
        (state.blockedUntil - Date.now()) / 1000
      )} секунд.`
    );
  }
  failedLogins.delete(key);
}

function recordFailedLogin(email: string, ip: string) {
  const key = getLoginKey(email, ip);
  const current = failedLogins.get(key) || { count: 0, blockedUntil: 0 };
  current.count += 1;
  // When max attempts reached, set blockedUntil timestamp
  if (current.count >= MAX_FAILED_ATTEMPTS) {
    current.blockedUntil = Date.now() + BLOCK_TIME_MS;
  }
  failedLogins.set(key, current);
}

function clearFailedLogin(email: string, ip: string) {
  const key = getLoginKey(email, ip);
  failedLogins.delete(key);
}

export const authService = {
  hashPassword,
  verifyToken(token: string) {
    // Reject revoked tokens
    if (revokedTokens.has(token)) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Токен анульовано');
    }
    return verifyJwt(token);
  },

  revokeToken(token: string) {
    // Add token to in-memory revoked set
    if (!token) return;
    revokedTokens.add(token);
  },

  async login(email: string, password: string, ip: string) {
    if (!email || !password) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Email та пароль обов’язкові');
    }

    checkBruteForce(email, ip);

    const user = await usersRepository.getByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      recordFailedLogin(email, ip);
      throw new ApiError(401, 'UNAUTHORIZED', 'Невірні email або пароль');
    }

    clearFailedLogin(email, ip);
    const token = createJwt({ id: user.id, role: user.role === 'admin' ? 'admin' : 'user' });
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role as 'admin' | 'user' }, token };
  },

  async register(dto: { name: string; email: string; password: string }) {
    const errors: Array<{ field?: string; message: string }> = [];
    if (!dto.name || dto.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Ім’я обов’язкове і має бути не менше 2 символів' });
    }
    if (!dto.email || !dto.email.includes('@')) {
      errors.push({ field: 'email', message: 'Введіть коректний email' });
    }
    if (!dto.password || dto.password.length < 3) {
      errors.push({ field: 'password', message: 'Пароль має містити щонайменше 3 символи' });
    }
    if (errors.length > 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Некоректні дані реєстрації', errors);
    }

    const passwordHash = hashPassword(dto.password);
    const user = await usersRepository.add({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      role: 'user',
      passwordHash
    });

    const token = createJwt({ id: user.id, role: 'user' });
    return { user, token };
  }
};
