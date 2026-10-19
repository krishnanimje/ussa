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
});
