import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Master Prompt 06 — Performance, Animations, Responsiveness & Accessibility Suite', () => {
  const root = process.cwd();

  // --------------------------------------------------------------------------
  // 1. Performance & Asset Delivery Optimization
  // --------------------------------------------------------------------------
  describe('1. Performance & Asset Delivery Optimization', () => {
    it('verifies fonts are preconnected and preloaded in <head> for fast LCP', () => {
      const seoHeadPath = path.join(root, 'src', 'components', 'SeoHead.astro');
      const content = fs.readFileSync(seoHeadPath, 'utf-8');
      expect(content).toContain('rel="preconnect" href="https://fonts.googleapis.com"');
      expect(content).toContain('rel="preconnect" href="https://fonts.gstatic.com" crossorigin');
      expect(content).toContain('family=Playfair+Display');
      expect(content).toContain('family=Plus+Jakarta+Sans');
    });

    it('verifies blocking @import font statement is removed from global stylesheet', () => {
      const globalCssPath = path.join(root, 'src', 'styles', 'global.css');
      const content = fs.readFileSync(globalCssPath, 'utf-8');
      expect(content).not.toContain('@import url(\'https://fonts.googleapis.com');
    });

    it('verifies strict Cache-Control isolation separating public and private endpoints', () => {
      const middlewarePath = path.join(root, 'src', 'middleware.ts');
      const content = fs.readFileSync(middlewarePath, 'utf-8');
      expect(content).toContain('isPrivateRequest');
      expect(content).toContain('private, no-cache, no-store, must-revalidate');
      expect(content).toContain('public, max-age=31536000, immutable');
      expect(content).toContain('public, max-age=300, stale-while-revalidate=86400');
    });

    it('verifies images have explicit dimensions and lazy loading to prevent CLS', () => {
      const cardPath = path.join(root, 'src', 'components', 'PropertyCard.astro');
      const content = fs.readFileSync(cardPath, 'utf-8');
      expect(content).toContain('width="400"');
      expect(content).toContain('height="260"');
      expect(content).toContain('loading="lazy"');
      expect(content).toContain('decoding="async"');
      expect(content).toContain('aspect-ratio: 16 / 10');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Animations & Reduced-Motion Compliance
  // --------------------------------------------------------------------------
  describe('2. Modern Animations & Reduced-Motion (WCAG 2.2 AA)', () => {
    it('verifies prefers-reduced-motion media query disables animations in global.css', () => {
      const globalCssPath = path.join(root, 'src', 'styles', 'global.css');
      const content = fs.readFileSync(globalCssPath, 'utf-8');
      expect(content).toContain('@media (prefers-reduced-motion: reduce)');
      expect(content).toContain('animation-duration: 0.001ms !important');
      expect(content).toContain('transition-duration: 0.001ms !important');
      expect(content).toContain('scroll-behavior: auto !important');
    });

    it('verifies prefers-reduced-motion is enforced in admin stylesheet', () => {
      const adminCssPath = path.join(root, 'src', 'styles', 'admin.css');
      const content = fs.readFileSync(adminCssPath, 'utf-8');
      expect(content).toContain('@media (prefers-reduced-motion: reduce)');
      expect(content).toContain('animation-duration: 0.001ms !important');
    });

    it('verifies hero entrance animation staggers exist and use CSS transforms', () => {
      const globalCssPath = path.join(root, 'src', 'styles', 'global.css');
      const content = fs.readFileSync(globalCssPath, 'utf-8');
      expect(content).toContain('.hero-stagger-1');
      expect(content).toContain('.hero-stagger-2');
      expect(content).toContain('.hero-stagger-3');
      expect(content).toContain('.hero-stagger-4');
      expect(content).toContain('@keyframes heroEntrance');
    });

    it('verifies scroll reveal observer script is integrated in base layout', () => {
      const layoutPath = path.join(root, 'src', 'layouts', 'Layout.astro');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('initScrollReveals');
      expect(content).toContain('IntersectionObserver');
      expect(content).toContain('prefers-reduced-motion: reduce');
      expect(content).toContain('astro:page-load');
    });

    it('verifies mobile hamburger button animates into an active state', () => {
      const headerPath = path.join(root, 'src', 'components', 'Header.astro');
      const content = fs.readFileSync(headerPath, 'utf-8');
      expect(content).toContain('.mobile-toggle.is-active .hamburger-line:nth-child(1)');
      expect(content).toContain('rotate(45deg)');
      expect(content).toContain('rotate(-45deg)');
      expect(content).toContain('opacity: 0');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Responsiveness & Touch Target Sizing
  // --------------------------------------------------------------------------
  describe('3. Multi-Device Responsiveness (320px to 4K)', () => {
    it('enforces viewport meta tag in SeoHead', () => {
      const seoHeadPath = path.join(root, 'src', 'components', 'SeoHead.astro');
      const content = fs.readFileSync(seoHeadPath, 'utf-8');
      expect(content).toContain('name="viewport" content="width=device-width, initial-scale=1.0"');
    });

    it('verifies minimum 44px touch targets on interactive controls in global stylesheet', () => {
      const globalCssPath = path.join(root, 'src', 'styles', 'global.css');
      const content = fs.readFileSync(globalCssPath, 'utf-8');
      expect(content).toContain('min-height: 44px');
      expect(content).toContain('touch-action: manipulation');
    });

    it('verifies admin layout incorporates responsive mobile sidebar adjustments', () => {
      const adminCssPath = path.join(root, 'src', 'styles', 'admin.css');
      const content = fs.readFileSync(adminCssPath, 'utf-8');
      expect(content).toContain('@media (max-width: 900px)');
      expect(content).toContain('flex-direction: column');
    });

    it('verifies responsive table horizontal scroll wrapper class is defined', () => {
      const globalCssPath = path.join(root, 'src', 'styles', 'global.css');
      const content = fs.readFileSync(globalCssPath, 'utf-8');
      expect(content).toContain('.table-responsive');
      expect(content).toContain('overflow-x: auto');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Accessibility (WCAG 2.2 AA Compliance)
  // --------------------------------------------------------------------------
  describe('4. Accessibility & Semantic Structure (WCAG 2.2 AA)', () => {
    it('verifies skip to main content link exists in Layout.astro', () => {
      const layoutPath = path.join(root, 'src', 'layouts', 'Layout.astro');
      const content = fs.readFileSync(layoutPath, 'utf-8');
      expect(content).toContain('class="skip-link"');
      expect(content).toContain('href="#mainContent"');
      expect(content).toContain('id="mainContent"');
    });

    it('verifies landmark roles (banner, main, contentinfo) are properly assigned', () => {
      const headerPath = path.join(root, 'src', 'components', 'Header.astro');
      const footerPath = path.join(root, 'src', 'components', 'Footer.astro');
      const layoutPath = path.join(root, 'src', 'layouts', 'Layout.astro');

      expect(fs.readFileSync(headerPath, 'utf-8')).toContain('role="banner"');
      expect(fs.readFileSync(footerPath, 'utf-8')).toContain('role="contentinfo"');
      expect(fs.readFileSync(layoutPath, 'utf-8')).toContain('<main id="mainContent">');
    });

    it('verifies visible high-contrast focus rings in global stylesheet', () => {
      const globalCssPath = path.join(root, 'src', 'styles', 'global.css');
      const content = fs.readFileSync(globalCssPath, 'utf-8');
      expect(content).toContain(':focus-visible');
      expect(content).toContain('outline:');
      expect(content).toContain('outline-offset:');
    });

    it('verifies mobile navigation menu provides ARIA dialog controls and Escape key handler', () => {
      const headerPath = path.join(root, 'src', 'components', 'Header.astro');
      const content = fs.readFileSync(headerPath, 'utf-8');
      expect(content).toContain('role="dialog"');
      expect(content).toContain('aria-modal="true"');
      expect(content).toContain('aria-controls="mobileDrawer"');
      expect(content).toContain('aria-expanded="false"');
      expect(content).toContain('e.key === \'Escape\'');
    });

    it('verifies lead form inputs associate labels, aria-describedby errors, and polite status announcements', () => {
      const formPath = path.join(root, 'src', 'components', 'LeadCaptureForm.astro');
      const content = fs.readFileSync(formPath, 'utf-8');
      expect(content).toContain('aria-describedby=');
      expect(content).toContain('role="alert" aria-live="polite"');
      expect(content).toContain('role="status" aria-live="polite"');
      expect(content).toContain('class="spinner"');
    });

    it('verifies screen reader visually hidden utility class exists', () => {
      const globalCssPath = path.join(root, 'src', 'styles', 'global.css');
      const content = fs.readFileSync(globalCssPath, 'utf-8');
      expect(content).toContain('.sr-only');
      expect(content).toContain('clip: rect(0, 0, 0, 0)');
    });
  });
});
