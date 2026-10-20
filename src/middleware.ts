import { defineMiddleware } from 'astro:middleware';
import { checkAdminAuth, getClientIp } from './lib/auth';
import { checkAdminLoginRateLimit } from './lib/rateLimit';
import { logger } from './lib/logger';

export const onRequest = defineMiddleware(async (context, next) => {
  const startTime = Date.now();
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  const clientIp = getClientIp(context.request);
  const requestId = context.request.headers.get('x-request-id') || crypto.randomUUID();

  // 1. Rate limit protection on admin login to stop brute-force attacks
  if (context.request.method === 'POST' && (pathname === '/admin/login' || pathname === '/api/admin/login')) {
    const rateCheck = checkAdminLoginRateLimit(clientIp);
    if (!rateCheck.allowed) {
      if (pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ 
          error: 'Too many authentication attempts. Please wait 15 minutes before retrying.',
          retryAfter: rateCheck.retryAfterSeconds 
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.retryAfterSeconds)
          }
        });
      }
      return context.redirect('/429');
    }
  }

  // 2. Protect /admin routes (except /admin/login and /admin/logout)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/logout') {
    const isAuthenticated = checkAdminAuth(context.request);
    if (!isAuthenticated) {
      return context.redirect('/admin/login');
    }
  }

  // 3. Protect /api/admin routes (except /api/admin/login and /api/admin/logout)
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login' && pathname !== '/api/admin/logout') {
    const isAuthenticated = checkAdminAuth(context.request);
    if (!isAuthenticated) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Admin authentication required.' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer error="invalid_token"'
        }
      });
    }
  }

  // 3b. Anti-CSRF Origin Validation for state-changing mutation requests
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(context.request.method)) {
    const origin = context.request.headers.get('origin');
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const hostUrl = new URL(context.request.url);
        const isSameOrigin = originUrl.origin === hostUrl.origin;
        const isLocal = originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1';
        const isOfficialDomain = originUrl.hostname === 'edgarvalle.com' || originUrl.hostname.endsWith('.edgarvalle.com');
        const isVercelPreview = originUrl.hostname.endsWith('.vercel.app');

        if (!isSameOrigin && !isLocal && !isOfficialDomain && !isVercelPreview) {
          logger.warn('Untrusted Cross-Origin Request Blocked (Anti-CSRF)', {
            origin,
            targetPath: pathname,
            method: context.request.method,
            ip: clientIp
          });
          return new Response(JSON.stringify({ error: 'Forbidden: Cross-site request rejected.' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } catch {
        return new Response(JSON.stringify({ error: 'Forbidden: Malformed origin header.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
  }

  // 4. Execute request
  const response = await next();

  // 5. Attach OWASP Security Headers to every response
  const newHeaders = new Headers(response.headers);

  // Content-Security-Policy (CSP)
  if (!newHeaders.has('Content-Security-Policy')) {
    newHeaders.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://www.google-analytics.com; frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
    );
  }

  // MIME type sniffing prevention
  newHeaders.set('X-Content-Type-Options', 'nosniff');

  // Clickjacking prevention
  newHeaders.set('X-Frame-Options', 'DENY');

  // Enforce HTTPS via HSTS (Strict-Transport-Security)
  newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Referrer policy
  newHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (restrict device APIs)
  newHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Cross-Origin isolation protections
  newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Anti-XSS and file download protection
  newHeaders.set('X-XSS-Protection', '1; mode=block');
  newHeaders.set('X-Permitted-Cross-Domain-Policies', 'none');
  newHeaders.set('X-Download-Options', 'noopen');

  // 6. Caching Strategy: Optimize public caching, protect private responses (Master Prompt 06)
  const isPrivateRequest = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/api/admin') || 
    pathname.startsWith('/api/leads') || 
    pathname.startsWith('/api/valuation') ||
    (context.request.method !== 'GET' && context.request.method !== 'HEAD') ||
    Boolean(context.request.headers.get('cookie')?.includes('valle_admin_session')) ||
    Boolean(context.request.headers.get('cookie')?.includes('edgar_admin_session'));

  if (isPrivateRequest) {
    // Strictly isolate private responses from public CDNs/proxies/browsers
    newHeaders.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    newHeaders.set('Pragma', 'no-cache');
  } else if (!newHeaders.has('Cache-Control') || newHeaders.get('Cache-Control') === 'no-cache') {
    if (pathname.startsWith('/_astro/')) {
      // Hashed immutable static assets
      newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (pathname.startsWith('/images/') || pathname === '/favicon.svg' || pathname === '/site.webmanifest') {
      // Public static media
      newHeaders.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    } else {
      // Public marketing and property catalog pages
      newHeaders.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
    }
  }

  // 7. Attach Correlation Request ID
  newHeaders.set('X-Request-Id', requestId);

  // 8. Lightweight Structured Access Log for API calls and error responses
  if (pathname.startsWith('/api/') || response.status >= 400) {
    logger.info(`${context.request.method} ${pathname}`, {
      requestId,
      method: context.request.method,
      path: pathname,
      statusCode: response.status,
      durationMs: Date.now() - startTime
    });
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
});
