// Server-side authentication & authorization utilities for Edgar Valle Admin Portal
// Supports both Supabase Auth and cryptographically secured server secret sessions

import crypto from 'node:crypto';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';

/**
 * Constant-time string equality comparison using crypto.timingSafeEqual.
 * Protects against side-channel timing attacks attempting to brute-force or deduce secrets.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length === 0 || b.length === 0) {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Avoid timing leakage on length mismatch by comparing bufA against bufA before returning false
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET_KEY || 
    process.env.SESSION_SECRET || 
    import.meta.env.ADMIN_SECRET_KEY || 
    import.meta.env.SESSION_SECRET || 
    'dev-secret-valle-admin-session-key-2026';
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';
}

/**
 * Synchronous check for cookie or Bearer token matching server admin secret.
 * Enforces constant-time comparison against side-channel timing attacks.
 */
export function checkAdminAuth(request: Request): boolean {
  const secret = getAdminSecret();
  const cookie = request.headers.get('cookie') || '';
  const authHeader = request.headers.get('authorization') || '';

  // 1. Check server session cookie (extract token strictly)
  const cookieMatch = cookie.match(/valle_admin_session=([^;]+)/);
  if (cookieMatch && constantTimeCompare(cookieMatch[1].trim(), secret.trim())) {
    return true;
  }

  // 2. Check Bearer token header
  if (authHeader.startsWith('Bearer ')) {
    if (constantTimeCompare(authHeader.substring(7).trim(), secret.trim())) {
      return true;
    }
  } else if (constantTimeCompare(authHeader.trim(), secret.trim())) {
    return true;
  }

  return false;
}

/**
 * Asynchronous authentication verification supporting Supabase Auth JWTs
 * as well as server session secrets.
 */
export async function verifyAdminAuthAsync(request: Request): Promise<boolean> {
  // Check fast path (secret session cookie or static Bearer)
  if (checkAdminAuth(request)) {
    return true;
  }

  // If Supabase is configured, check for Supabase Auth JWT
  if (isSupabaseConfigured) {
    const authHeader = request.headers.get('authorization') || '';
    let token = '';

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      const cookie = request.headers.get('cookie') || '';
      const match = cookie.match(/sb-[a-zA-Z0-9_-]+-auth-token=([^;]+)/) || cookie.match(/sb-access-token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (token) {
      const adminClient = getSupabaseAdmin();
      if (adminClient) {
        try {
          const { data: { user }, error } = await adminClient.auth.getUser(token);
          if (!error && user) {
            const role = user.app_metadata?.role || user.user_metadata?.role;
            const allowedEmails = ['edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com'];
            if (role === 'admin' || (user.email && allowedEmails.includes(user.email.toLowerCase()))) {
              return true;
            }
          }
        } catch {
          // Token verification error
        }
      }
    }
  }

  return false;
}

/**
 * Generates Set-Cookie header string for establishing admin session.
 */
export function createAdminSessionCookie(isProduction: boolean = process.env.NODE_ENV === 'production'): string {
  const secret = getAdminSecret();
  const secureFlag = isProduction ? '; Secure' : '';
  return `valle_admin_session=${secret}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${secureFlag}`;
}

/**
 * Generates Set-Cookie header string for clearing admin session upon logout.
 */
export function createLogoutCookie(): string {
  return `valle_admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Verifies credentials submitted to administrator login.
 */
export async function verifyAdminCredentials(
  keyOrPassword: string,
  email?: string
): Promise<{ success: boolean; userEmail?: string; error?: string }> {
  const adminSecret = getAdminSecret();

  // 1. Direct admin secret passphrase match (timing-attack resistant)
  if (constantTimeCompare(keyOrPassword.trim(), adminSecret.trim())) {
    return { success: true, userEmail: 'edgar@yourrealtoredgar.com' };
  }

  // 2. Supabase Auth email + password verification (if Supabase is configured and email provided)
  if (isSupabaseConfigured && email) {
    const adminClient = getSupabaseAdmin();
    if (adminClient) {
      try {
        const { data, error } = await adminClient.auth.signInWithPassword({
          email: email.trim(),
          password: keyOrPassword
        });

        if (!error && data.user) {
          const role = data.user.app_metadata?.role || data.user.user_metadata?.role;
          const allowedEmails = ['edgar@yourrealtoredgar.com', 'admin@yourrealtoredgar.com'];
          if (role === 'admin' || (data.user.email && allowedEmails.includes(data.user.email.toLowerCase()))) {
            return { success: true, userEmail: data.user.email };
          }
          return { success: false, error: 'Unauthorized: User does not possess administrator privileges.' };
        }
      } catch (err) {
        return { success: false, error: 'Authentication service encountered an unexpected error.' };
      }
    }
  }

  return { success: false, error: 'Invalid access credentials. Please verify your administrator secret or password.' };
}
