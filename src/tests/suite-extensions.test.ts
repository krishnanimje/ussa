import { describe, it, expect } from 'vitest';
import { dispatchLeadNotification, formatLeadTypeTitle } from '../lib/notifications';
import { SITE_SETTINGS } from '../lib/store';
import fs from 'node:fs';
import path from 'node:path';

describe('Spanish Parity, Open House Flyers & Lead Automation Test Suite', () => {
  // --------------------------------------------------------------------------
  // 1. Lead Notification & Webhook Automation
  // --------------------------------------------------------------------------
  describe('1. Real-Time Lead Notification & Webhook Automation', () => {
    it('correctly maps internal lead types to human-readable titles', () => {
      expect(formatLeadTypeTitle('first_time_buyer')).toBe('First-Time Homebuyer Inquiry');
      expect(formatLeadTypeTitle('va_buyer')).toBe('VA Military Loan Consultation');
      expect(formatLeadTypeTitle('seller_valuation')).toBe('Home Valuation & CMA Request');
      expect(formatLeadTypeTitle('investor_flip')).toBe('Fix-and-Flip / Investor Opportunity');
      expect(formatLeadTypeTitle('tour_request')).toBe('Private Property Tour Request');
      expect(formatLeadTypeTitle('open_house_rsvp')).toBe('Weekend Open House RSVP');
      expect(formatLeadTypeTitle('general_contact')).toBe('General Client Inquiry');
      expect(formatLeadTypeTitle('unknown_type')).toBe('Real Estate Inquiry');
    });

    it('dispatches structured notification payload with verified DRE credentials', async () => {
      const sampleLead = {
        id: 'lead-test-12345',
        full_name: 'Marcus Ramirez',
        email: 'marcus.ramirez@example.com',
        phone: '6195550198',
        lead_type: 'va_buyer',
        message: 'Looking for a 3-bedroom home near Naval Base Coronado.',
        preferred_contact_method: 'phone',
        estimated_budget: '$950,000',
        timeframe: '1-3 months',
        is_preapproved: true,
        language_preference: 'es'
      };

      const result = await dispatchLeadNotification(sampleLead);
      expect(result.dispatched).toBe(true);
      expect(result.channel).toBeDefined();
    });

    it('verifies verified agent credentials in SITE_SETTINGS store', () => {
      expect(SITE_SETTINGS.dre_license).toBe('02375273');
      expect(SITE_SETTINGS.brokerage_name).toBe('Full Circle Group');
      expect(SITE_SETTINGS.brand_name).toBe('Edgar Valle | Realtor');
    });
  });

  // --------------------------------------------------------------------------
  // 2. Spanish Language Parity Across All Real Estate Verticals
  // --------------------------------------------------------------------------
  describe('2. Spanish Language Localization Parity', () => {
    const spanishRoutes = [
      'index.astro',
      'comprar.astro',
      'vender.astro',
      'primeros-compradores.astro',
      'contacto.astro',
      'prestamos-va.astro',
      'inversionistas.astro',
      'casas-abiertas.astro',
      'sobre-mi.astro',
      'preguntas-frecuentes.astro'
    ];

    it.each(spanishRoutes)('verifies Spanish page template %s exists', (filename) => {
      const filePath = path.join(process.cwd(), 'src', 'pages', 'es', filename);
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('lang="es"');
    });

    it('ensures Spanish VA page contains military benefits and DRE disclosures', () => {
      const vaEsPath = path.join(process.cwd(), 'src', 'pages', 'es', 'prestamos-va.astro');
      const content = fs.readFileSync(vaEsPath, 'utf-8');
      expect(content).toContain('0% de enganche');
      expect(content).toMatch(/SITE_SETTINGS\.dre_license|02375273/);
      expect(content).toMatch(/SITE_SETTINGS\.brokerage_name|Full Circle Group/);
      expect(content).toContain('TILA-RESPA / Regulación Z');
    });

    it('ensures Spanish Investor page includes 70% rule and California SB9 ADU guidance', () => {
      const invPath = path.join(process.cwd(), 'src', 'pages', 'es', 'inversionistas.astro');
      const content = fs.readFileSync(invPath, 'utf-8');
      expect(content).toContain('regla del 70%');
      expect(content).toContain('California SB9');
      expect(content).toContain('ADU');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Open House Feature Sheets & Printable PDF Flyers
  // --------------------------------------------------------------------------
  describe('3. Open House Printable Feature Sheet (/properties/[slug]/flyer)', () => {
    it('verifies flyer template exists and defines standard Letter print size', () => {
      const flyerPath = path.join(process.cwd(), 'src', 'pages', 'properties', '[slug]', 'flyer.astro');
      expect(fs.existsSync(flyerPath)).toBe(true);
      const content = fs.readFileSync(flyerPath, 'utf-8');
      expect(content).toContain('size: letter portrait');
      expect(content).toContain('@media print');
      expect(content).toContain('window.print()');
    });

    it('verifies flyer contains vector QR code, specs ribbon, and agent credentials', () => {
      const flyerPath = path.join(process.cwd(), 'src', 'pages', 'properties', '[slug]', 'flyer.astro');
      const content = fs.readFileSync(flyerPath, 'utf-8');
      expect(content).toContain('qr-svg');
      expect(content).toContain('specs-ribbon');
      expect(content).toContain('Edgar Valle | Realtor');
      expect(content).toMatch(/SITE_SETTINGS\.dre_license|02375273/);
      expect(content).toMatch(/SITE_SETTINGS\.brokerage_name|Full Circle Group/);
      expect(content).toContain('Equal Housing Opportunity');
    });

    it('verifies property detail page includes link to printable flyer', () => {
      const detailPath = path.join(process.cwd(), 'src', 'pages', 'properties', '[slug].astro');
      const content = fs.readFileSync(detailPath, 'utf-8');
      expect(content).toContain('/flyer');
      expect(content).toContain('Print Feature Sheet');
    });
  });
});
