import { describe, it, expect, beforeEach } from 'vitest';
import { checkAdminAuth, getAdminSecret, createAdminSessionCookie, createLogoutCookie, constantTimeCompare } from '../lib/auth';
import { checkRateLimit, checkLeadSubmissionRateLimit, checkAdminLoginRateLimit, clearAllRateLimits } from '../lib/rateLimit';
import { validateLeadSubmission, validateImageBuffer } from '../lib/validation';
import { getProperties, getPropertyBySlug, SITE_SETTINGS } from '../lib/store';
import fs from 'node:fs';
import path from 'node:path';

describe('Master Prompt 05 — Security, Privacy & Compliance Test Suite', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  // --------------------------------------------------------------------------
  // 1. Authentication & Session Security
  // --------------------------------------------------------------------------
  describe('1. Authentication & Session Security', () => {
    it('verifies constantTimeCompare prevents side-channel timing leaks', () => {
      const secret = 'super-secure-admin-passphrase-2026';
      expect(constantTimeCompare(secret, secret)).toBe(true);
      expect(constantTimeCompare(secret, 'wrong-password')).toBe(false);
      expect(constantTimeCompare(secret, 'super-secure-admin-passphrase-2027')).toBe(false);
      expect(constantTimeCompare(secret, '')).toBe(false);
      expect(constantTimeCompare('', secret)).toBe(false);
      expect(constantTimeCompare('', '')).toBe(false);
    });

    it('rejects unauthenticated requests without authorization header or cookie', () => {
      const req = new Request('http://localhost:4321/api/admin/leads');
      expect(checkAdminAuth(req)).toBe(false);
    });

    it('rejects requests with forged or invalid session cookies', () => {
      const req = new Request('http://localhost:4321/api/admin/properties', {
        headers: { 'Cookie': 'valle_admin_session=forged-malicious-token-12345' }
      });
      expect(checkAdminAuth(req)).toBe(false);
    });

    it('accepts requests with valid server admin session cookie', () => {
      const secret = getAdminSecret();
      const req = new Request('http://localhost:4321/api/admin/properties', {
        headers: { 'Cookie': `valle_admin_session=${secret}` }
      });
      expect(checkAdminAuth(req)).toBe(true);
    });

    it('generates secure HttpOnly session cookies with Max-Age', () => {
      const cookie = createAdminSessionCookie(false);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
      expect(cookie).toContain('Max-Age=86400');
    });

    it('generates server-side logout cookie with expired 1970 timestamp', () => {
      const logoutCookie = createLogoutCookie();
      expect(logoutCookie).toContain('Max-Age=0');
      expect(logoutCookie).toContain('Expires=Thu, 01 Jan 1970');
      expect(logoutCookie).toContain('HttpOnly');
    });

    it('rejects unauthorized mutations to site settings and neighborhood endpoints with 401', async () => {
      const { GET: getSettings, POST: postSettings } = await import('../pages/api/admin/site-settings');
      const { GET: getNeighborhoods, POST: postNeighborhoods } = await import('../pages/api/admin/neighborhoods');

      // Unauthenticated requests
      const unauthReq = new Request('http://localhost:4321/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_avatar: '/malicious.png' })
      });

      const res1 = await postSettings({ request: unauthReq } as any);
      expect(res1.status).toBe(401);

      const res2 = await getSettings({ request: unauthReq } as any);
      expect(res2.status).toBe(401);

      const unauthHoodReq = new Request('http://localhost:4321/api/admin/neighborhoods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'north-park', hero_image: '/malicious.png' })
      });

      const res3 = await postNeighborhoods({ request: unauthHoodReq } as any);
      expect(res3.status).toBe(401);

      const res4 = await getNeighborhoods({ request: unauthHoodReq } as any);
      expect(res4.status).toBe(401);
    });
  });


  // --------------------------------------------------------------------------
  // 2. Private Data & Unpublished Listings Isolation
  // --------------------------------------------------------------------------
  describe('2. Data Isolation & Least Privilege', () => {
    it('excludes draft listings from public query results', async () => {
      const properties = await getProperties();
      const drafts = properties.filter(p => p.publication_status === 'draft');
      expect(drafts.length).toBe(0);
    });

    it('excludes soft-deleted listings from public query results', async () => {
      const properties = await getProperties();
      const deleted = properties.filter(p => p.deleted_at !== null && p.deleted_at !== undefined);
      expect(deleted.length).toBe(0);
    });

    it('does not leak draft properties to public callers by slug', async () => {
      // Querying an arbitrary draft slug returns undefined for public callers
      const draft = await getPropertyBySlug('non-existent-or-draft-slug');
      expect(draft).toBeUndefined();
    });
  });

  // --------------------------------------------------------------------------
  // 3. Rate Limiting Tests
  // --------------------------------------------------------------------------
  describe('3. Rate Limiting Protection (Anti-DDoS / Anti-Brute-Force)', () => {
    it('enforces request thresholds and throttles when limit is exceeded', () => {
      const ip = '198.51.100.1';
      // Limit to 3 requests per 10 seconds
      const res1 = checkRateLimit(ip, 3, 10000);
      const res2 = checkRateLimit(ip, 3, 10000);
      const res3 = checkRateLimit(ip, 3, 10000);
      const res4 = checkRateLimit(ip, 3, 10000);

      expect(res1.allowed).toBe(true);
      expect(res2.allowed).toBe(true);
      expect(res3.allowed).toBe(true);
      expect(res4.allowed).toBe(false);
      expect(res4.remaining).toBe(0);
      expect(res4.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('enforces lead submission rate limit of 5 requests per 15 minutes', () => {
      const ip = '203.0.113.42';
      for (let i = 0; i < 5; i++) {
        const res = checkLeadSubmissionRateLimit(ip);
        expect(res.allowed).toBe(true);
      }
      const throttled = checkLeadSubmissionRateLimit(ip);
      expect(throttled.allowed).toBe(false);
      expect(throttled.retryAfterSeconds).toBeGreaterThan(0);
    });

    it('enforces admin login brute-force limit of 5 attempts', () => {
      const ip = '192.0.2.99';
      for (let i = 0; i < 5; i++) {
        const res = checkAdminLoginRateLimit(ip);
        expect(res.allowed).toBe(true);
      }
      const blocked = checkAdminLoginRateLimit(ip);
      expect(blocked.allowed).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 4. Input Validation & Spam Protection
  // --------------------------------------------------------------------------
  describe('4. Input Validation & Anti-Spam Defense', () => {
    it('detects and blocks automated honeypot submissions', () => {
      const botSubmission = {
        fullName: 'Bot Spammer',
        email: 'spammer@example.com',
        phone: '6195550199',
        leadType: 'general_contact',
        _hp: 'http://spam-link.ru' // Honeypot filled
      };

      const result = validateLeadSubmission(botSubmission);
      expect(result.success).toBe(false);
      expect(result.isSpam).toBe(true);
      expect(result.errors?._hp).toBeDefined();
    });

    it('detects and blocks unnaturally fast bot form submissions', () => {
      const fastBotSubmission = {
        fullName: 'Super Fast Bot',
        email: 'fastbot@example.com',
        phone: '6195550198',
        leadType: 'general_contact',
        _t: Date.now() - 200 // Submitted in 200ms
      };

      const result = validateLeadSubmission(fastBotSubmission);
      expect(result.success).toBe(false);
      expect(result.isSpam).toBe(true);
    });

    it('accepts valid human submissions with proper elapsed time', () => {
      const humanSubmission = {
        fullName: 'Sarah Jenkins',
        email: 'sarah.j@example.com',
        phone: '6195550198',
        leadType: 'first_time_buyer',
        message: 'Interested in North Park homes under $950,000.',
        _hp: '', // Empty honeypot
        _t: Date.now() - 8500 // 8.5 seconds
      };

      const result = validateLeadSubmission(humanSubmission);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toBe('Sarah Jenkins');
    });
  });

  // --------------------------------------------------------------------------
  // 5. Secure File Upload & Magic Byte Verification
  // --------------------------------------------------------------------------
  describe('5. OWASP File Upload Security & Magic Byte Inspection', () => {
    it('accepts authentic JPEG buffers with valid magic bytes (0xFF, 0xD8, 0xFF)', () => {
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
      const res = validateImageBuffer(jpegBuffer, 'kitchen.jpg', 'image/jpeg');
      expect(res.valid).toBe(true);
      expect(res.detectedMime).toBe('image/jpeg');
    });

    it('accepts authentic PNG buffers with valid magic bytes (0x89, 0x50, 0x4E, 0x47...)', () => {
      const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00]);
      const res = validateImageBuffer(pngBuffer, 'floorplan.png', 'image/png');
      expect(res.valid).toBe(true);
      expect(res.detectedMime).toBe('image/png');
    });

    it('rejects executable binaries spoofing an image extension', () => {
      // Windows PE executable header: 'MZ' (0x4D, 0x5A)
      const exeBuffer = Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00]);
      const res = validateImageBuffer(exeBuffer, 'trojan.jpg', 'image/jpeg');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('does not match authorized image types');
    });

    it('rejects disallowed file extensions (e.g. .php, .exe, .sh, .html)', () => {
      const buffer = Buffer.from('console.log("hello");');
      const res = validateImageBuffer(buffer, 'payload.php', 'application/x-php');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Disallowed file extension');
    });

    it('rejects SVG files containing malicious active scripts or XSS vectors', () => {
      const xssSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script><circle cx="5" cy="5" r="5"/></svg>');
      const res = validateImageBuffer(xssSvg, 'vector.svg', 'image/svg+xml');
      expect(res.valid).toBe(false);
      expect(res.error).toContain('unsafe active script content');
    });

    it('accepts clean, safe SVG vectors without scripts or event handlers', () => {
      const cleanSvg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="M10 10 H 90 V 90 H 10 Z" fill="#c5a059"/></svg>');
      const res = validateImageBuffer(cleanSvg, 'icon.svg', 'image/svg+xml');
      expect(res.valid).toBe(true);
      expect(res.detectedMime).toBe('image/svg+xml');
    });
  });

  // --------------------------------------------------------------------------
  // 6. Secret Leaks & Client Asset Inspection
  // --------------------------------------------------------------------------
  describe('6. Zero Secret Leaks in Public Pages', () => {
    it('ensures admin login template does not leak the secret key in HTML attributes', () => {
      const loginFilePath = path.join(process.cwd(), 'src', 'pages', 'admin', 'login.astro');
      const content = fs.readFileSync(loginFilePath, 'utf-8');
      // Must NOT contain value={adminSecret}
      expect(content).not.toContain('value={adminSecret}');
    });

    it('ensures client-side JavaScript does not attempt to clear HttpOnly cookies via document.cookie', () => {
      const adminLayoutPath = path.join(process.cwd(), 'src', 'layouts', 'AdminLayout.astro');
      const content = fs.readFileSync(adminLayoutPath, 'utf-8');
      expect(content).not.toContain("document.cookie = 'valle_admin_session=");
      expect(content).toContain('/admin/logout');
    });
  });

  // --------------------------------------------------------------------------
  // 7. California Real Estate & Brokerage Regulatory Disclosures
  // --------------------------------------------------------------------------
  describe('7. California DRE & Statutory Disclosures', () => {
    it('verifies California DRE license #02375273 and Full Circle Group brokerage identity', () => {
      expect(SITE_SETTINGS.dre_license).toBe('02375273');
      expect(SITE_SETTINGS.brokerage_name).toBe('Full Circle Group');
      expect(SITE_SETTINGS.brand_name).toBe('Edgar Valle | Realtor');
    });

    it('contains mandatory Equal Housing Opportunity and DRE disclosures in disclosures.astro', () => {
      const disclosuresPath = path.join(process.cwd(), 'src', 'pages', 'disclosures.astro');
      const content = fs.readFileSync(disclosuresPath, 'utf-8');
      expect(content).toContain('Fair Housing Act');
      expect(content).toContain('02375273');
      expect(content).toContain('Full Circle Group');
      expect(content).toContain('TILA-RESPA / Regulation Z');
      expect(content).toContain('Digitally Altered &amp; Virtually Staged');
    });
  });
});
