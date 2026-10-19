import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const url = new URL(context.request.url);
  const pathname = url.pathname;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSecret = process.env.ADMIN_SECRET_KEY || import.meta.env.ADMIN_SECRET_KEY || 'dev-secret-valle-admin-session-key-2026';
    const cookie = context.request.headers.get('cookie') || '';
    const isAuthenticated = cookie.includes(`valle_admin_session=${adminSecret}`);

    if (!isAuthenticated) {
      return context.redirect('/admin/login');
    }
  }

  // Protect /api/admin routes
  if (pathname.startsWith('/api/admin')) {
    const adminSecret = process.env.ADMIN_SECRET_KEY || import.meta.env.ADMIN_SECRET_KEY || 'dev-secret-valle-admin-session-key-2026';
    const cookie = context.request.headers.get('cookie') || '';
    const authHeader = context.request.headers.get('authorization') || '';
    const isAuthenticated = cookie.includes(`valle_admin_session=${adminSecret}`) || authHeader === `Bearer ${adminSecret}`;

    if (!isAuthenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Admin credentials required.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return next();
});
