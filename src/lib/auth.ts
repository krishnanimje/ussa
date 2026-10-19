// Server-side authentication utilities for Edgar Valle Admin Portal

export function getAdminSecret(): string {
  return process.env.ADMIN_SECRET_KEY || import.meta.env.ADMIN_SECRET_KEY || 'dev-secret-valle-admin-session-key-2026';
}

export function checkAdminAuth(request: Request): boolean {
  const secret = getAdminSecret();
  const cookie = request.headers.get('cookie') || '';
  const authHeader = request.headers.get('authorization') || '';
  return cookie.includes(`valle_admin_session=${secret}`) || authHeader === `Bearer ${secret}`;
}
