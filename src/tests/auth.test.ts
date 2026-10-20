import { describe, it, expect } from 'vitest';
import { checkAdminAuth, getAdminSecret } from '../lib/auth';

describe('Admin Authentication Guard', () => {
  it('returns valid admin secret fallback', () => {
    const secret = getAdminSecret();
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThan(10);
  });

  it('rejects unauthenticated requests without cookie or header', () => {
    const req = new Request('http://localhost:4321/admin');
    expect(checkAdminAuth(req)).toBe(false);
  });

  it('rejects requests with invalid cookie or token', () => {
    const req = new Request('http://localhost:4321/admin', {
      headers: {
        'Cookie': 'valle_admin_session=wrong-secret-key'
      }
    });
    expect(checkAdminAuth(req)).toBe(false);
  });

  it('accepts requests with valid session cookie', () => {
    const secret = getAdminSecret();
    const req = new Request('http://localhost:4321/admin', {
      headers: {
        'Cookie': `valle_admin_session=${secret}; Path=/`
      }
    });
    expect(checkAdminAuth(req)).toBe(true);
  });

  it('accepts requests with valid Bearer authorization header', () => {
    const secret = getAdminSecret();
    const req = new Request('http://localhost:4321/api/admin/leads', {
      headers: {
        'Authorization': `Bearer ${secret}`
      }
    });
    expect(checkAdminAuth(req)).toBe(true);
  });

  it('generates secure HttpOnly session cookie with Lax SameSite policy', async () => {
    const { createAdminSessionCookie, createLogoutCookie } = await import('../lib/auth');
    const cookie = createAdminSessionCookie(false);
    expect(cookie).toContain('valle_admin_session=');
    expect(cookie).toContain('Path=/');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(cookie).toContain('Max-Age=86400');

    const logoutCookie = createLogoutCookie();
    expect(logoutCookie).toContain('valle_admin_session=');
    expect(logoutCookie).toContain('Max-Age=0');
  });

  it('verifies admin credentials correctly and rejects wrong passwords', async () => {
    const { verifyAdminCredentials } = await import('../lib/auth');
    const secret = getAdminSecret();
    const valid = await verifyAdminCredentials(secret);
    expect(valid.success).toBe(true);

    const invalid = await verifyAdminCredentials('incorrect-password-xyz');
    expect(invalid.success).toBe(false);
    expect(invalid.error).toBeDefined();
  });
});
