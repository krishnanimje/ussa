// Analytics & Business Intelligence Engine
// Privacy-conscious, server-side aggregation for Edgar Valle Real Estate Platform

import type {
  AnalyticsEvent,
  AnalyticsEventName,
  DateRangeFilter,
  AnalyticsSummary,
  MetricDelta,
  DailyTrafficPoint,
  TrafficSource,
  DeviceCategory,
  PropertyRanking,
  LandingPagePerformance,
  FunnelStage
} from './types';
import { isSupabaseConfigured, getSupabase, getSupabaseAdmin } from './supabase';
import { getProperties, getAllLeads } from './store';

// In-Memory store for analytics events (persisted during runtime & fallback)
let inMemoryEvents: AnalyticsEvent[] = [];

/**
 * PII scrubber: Ensures no email, phone, names, or auth tokens are saved in analytics.
 */
export function scrubPII(input: string): string {
  if (!input) return input;
  // Scrub email addresses
  let scrubbed = input.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]');
  // Scrub phone numbers
  scrubbed = scrubbed.replace(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, '[REDACTED_PHONE]');
  // Scrub bearer tokens or secrets
  scrubbed = scrubbed.replace(/(bearer\s+|token=|secret[=:])([a-zA-Z0-9_\-\.]+)/gi, '$1[REDACTED_TOKEN]');
  scrubbed = scrubbed.replace(/secret-[a-zA-Z0-9_\-\.]+/gi, '[REDACTED_TOKEN]');
  return scrubbed;
}

/**
 * Helper to determine traffic source from referrer and UTM tags.
 */
export function detectTrafficSource(referrer?: string, utmSource?: string, utmMedium?: string): TrafficSource {
  if (utmMedium && ['cpc', 'ppc', 'paid', 'ad', 'meta_ad'].includes(utmMedium.toLowerCase())) {
    return 'paid';
  }
  if (utmSource && ['google', 'bing', 'yahoo'].includes(utmSource.toLowerCase())) {
    return 'organic';
  }
  if (utmSource && ['instagram', 'facebook', 'linkedin', 'youtube', 'tiktok'].includes(utmSource.toLowerCase())) {
    return 'social';
  }

  if (!referrer || referrer.trim() === '') {
    return 'direct';
  }

  const lowerRef = referrer.toLowerCase();
  if (lowerRef.includes('google.') || lowerRef.includes('bing.') || lowerRef.includes('duckduckgo.') || lowerRef.includes('yahoo.')) {
    return 'organic';
  }
  if (lowerRef.includes('instagram.com') || lowerRef.includes('facebook.com') || lowerRef.includes('t.co') || lowerRef.includes('twitter.com') || lowerRef.includes('linkedin.com')) {
    return 'social';
  }
  return 'referral';
}

/**
 * Helper to determine device category from user-agent string.
 */
export function detectDeviceCategory(userAgent?: string): DeviceCategory {
  if (!userAgent) return 'desktop';
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Valid event names according to Master Prompt 03
 */
const VALID_EVENT_NAMES: AnalyticsEventName[] = [
  'page_view',
  'session_started',
  'property_view',
  'property_search',
  'contact_click',
  'inquiry_form_started',
  'inquiry_submitted',
  'consultation_requested',
  'appointment_requested',
  'open_house_view',
  'outbound_link_click'
];

/**
 * Record a privacy-conscious analytics event.
 */
export async function recordAnalyticsEvent(event: {
  event_name: AnalyticsEventName;
  session_id: string;
  page_path: string;
  property_id?: string;
  referrer?: string;
  traffic_source?: TrafficSource;
  device_category?: DeviceCategory;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  metadata?: Record<string, unknown>;
  user_agent?: string;
}): Promise<{ success: boolean; eventId?: string; error?: string }> {
  // 1. Validation
  if (!VALID_EVENT_NAMES.includes(event.event_name)) {
    return { success: false, error: `Invalid event_name: ${event.event_name}` };
  }

  if (!event.session_id || typeof event.session_id !== 'string') {
    return { success: false, error: 'Missing or invalid session_id' };
  }

  if (!event.page_path || typeof event.page_path !== 'string') {
    return { success: false, error: 'Missing or invalid page_path' };
  }

  // 2. Privacy scrubbing
  const cleanPath = scrubPII(event.page_path);
  const cleanReferrer = event.referrer ? scrubPII(event.referrer) : undefined;
  const trafficSource = event.traffic_source || detectTrafficSource(cleanReferrer, event.utm_source, event.utm_medium);
  const deviceCategory = event.device_category || detectDeviceCategory(event.user_agent);

  const cleanMetadata: Record<string, unknown> = {};
  if (event.metadata && typeof event.metadata === 'object') {
    for (const [key, val] of Object.entries(event.metadata)) {
      if (typeof val === 'string') {
        cleanMetadata[key] = scrubPII(val);
      } else {
        cleanMetadata[key] = val;
      }
    }
  }

  const newEvent: AnalyticsEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    event_name: event.event_name,
    session_id: event.session_id,
    page_path: cleanPath,
    property_id: event.property_id,
    referrer: cleanReferrer,
    traffic_source: trafficSource,
    device_category: deviceCategory,
    utm_source: event.utm_source,
    utm_medium: event.utm_medium,
    utm_campaign: event.utm_campaign,
    metadata: cleanMetadata,
    created_at: new Date().toISOString()
  };

  // Add to in-memory store
  inMemoryEvents.push(newEvent);

  // Sync to Supabase if configured
  if (isSupabaseConfigured) {
    const client = getSupabase();
    if (client) {
      try {
        await client.from('analytics_events').insert({
          event_name: newEvent.event_name,
          session_id: newEvent.session_id,
          page_path: newEvent.page_path,
          property_id: newEvent.property_id || null,
          referrer: newEvent.referrer || null,
          traffic_source: newEvent.traffic_source,
          device_category: newEvent.device_category,
          utm_source: newEvent.utm_source || null,
          utm_medium: newEvent.utm_medium || null,
          utm_campaign: newEvent.utm_campaign || null,
          metadata: newEvent.metadata || {},
          created_at: newEvent.created_at
        });
      } catch (err) {
        console.warn('Could not insert analytics event into Supabase:', err);
      }
    }
  }

  return { success: true, eventId: newEvent.id };
}

/**
 * Seed historical baseline analytics for realistic Power BI dashboard metrics.
 */
function seedHistoricalEvents() {
  if (inMemoryEvents.length > 50) return;

  const now = Date.now();
  const dayMs = 86400000;

  // Generate 90 days of realistic real estate traffic
  const paths = [
    '/',
    '/properties',
    '/properties/north-park-spanish-revival',
    '/properties/la-jolla-oceanfront-contemporary',
    '/properties/chula-vista-family-pool-home',
    '/properties/pacific-beach-modern-duplex',
    '/properties/mission-hills-craftsman-estate',
    '/properties/east-village-luxury-penthouse',
    '/first-time-homebuyer',
    '/va-loans',
    '/fix-and-flip',
    '/about',
    '/contact',
    '/open-houses'
  ];

  const propertyIds = [
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000006'
  ];

  const sources: TrafficSource[] = ['organic', 'social', 'direct', 'referral', 'paid'];

  // Realistic seed distribution (weekdays vs weekends)
  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const dayTimestamp = now - dayOffset * dayMs;
    const dateObj = new Date(dayTimestamp);
    const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Daily volume
    const baseVisitors = isWeekend ? 45 : 32;
    const dailyVisitors = baseVisitors + (dayOffset % 7) * 3;

    for (let v = 0; v < dailyVisitors; v++) {
      const sessionId = `sess-${dayOffset}-${v}-${Math.random().toString(36).substring(2, 6)}`;
      const source = sources[Math.floor(Math.random() * sources.length)];
      const device = Math.random() < 0.65 ? 'mobile' : Math.random() < 0.9 ? 'desktop' : 'tablet';
      const eventTime = new Date(dayTimestamp + Math.floor(Math.random() * dayMs)).toISOString();

      // 1. Session started & Page view
      inMemoryEvents.push({
        id: `evt-seed-${dayOffset}-${v}-1`,
        event_name: 'session_started',
        session_id: sessionId,
        page_path: '/',
        traffic_source: source,
        device_category: device,
        created_at: eventTime
      });

      inMemoryEvents.push({
        id: `evt-seed-${dayOffset}-${v}-2`,
        event_name: 'page_view',
        session_id: sessionId,
        page_path: '/',
        traffic_source: source,
        device_category: device,
        created_at: eventTime
      });

      // 2. Property views
      if (Math.random() > 0.35) {
        const propIndex = Math.floor(Math.random() * propertyIds.length);
        const propPath = paths[2 + propIndex];
        const propId = propertyIds[propIndex];

        inMemoryEvents.push({
          id: `evt-seed-${dayOffset}-${v}-3`,
          event_name: 'property_view',
          session_id: sessionId,
          page_path: propPath,
          property_id: propId,
          traffic_source: source,
          device_category: device,
          created_at: eventTime
        });

        // 3. Inquiry form started / submitted
        if (Math.random() < 0.12) {
          inMemoryEvents.push({
            id: `evt-seed-${dayOffset}-${v}-4`,
            event_name: 'inquiry_form_started',
            session_id: sessionId,
            page_path: propPath,
            property_id: propId,
            traffic_source: source,
            device_category: device,
            created_at: eventTime
          });

          if (Math.random() < 0.75) {
            inMemoryEvents.push({
              id: `evt-seed-${dayOffset}-${v}-5`,
              event_name: 'inquiry_submitted',
              session_id: sessionId,
              page_path: propPath,
              property_id: propId,
              traffic_source: source,
              device_category: device,
              created_at: eventTime
            });

            if (Math.random() < 0.5) {
              inMemoryEvents.push({
                id: `evt-seed-${dayOffset}-${v}-6`,
                event_name: 'appointment_requested',
                session_id: sessionId,
                page_path: propPath,
                property_id: propId,
                traffic_source: source,
                device_category: device,
                created_at: eventTime
              });
            }
          }
        }
      }

      // 4. Consultation requested on service pages
      if (Math.random() < 0.08) {
        inMemoryEvents.push({
          id: `evt-seed-${dayOffset}-${v}-7`,
          event_name: 'consultation_requested',
          session_id: sessionId,
          page_path: '/first-time-homebuyer',
          traffic_source: source,
          device_category: device,
          created_at: eventTime
        });
      }
    }
  }
}

// Seed historical baseline events strictly in test environments for automated test suites
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  seedHistoricalEvents();
}

/**
 * Calculates date boundaries for a given date filter.
 */
export function calculateDateRanges(
  range: DateRangeFilter,
  customStart?: string,
  customEnd?: string
): {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
  hasPreviousData: boolean;
} {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start: Date;
  let prevStart: Date;
  let prevEnd: Date;

  switch (range) {
    case 'today': {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      prevStart = new Date(start.getTime() - 86400000);
      prevEnd = new Date(end.getTime() - 86400000);
      break;
    }
    case 'yesterday': {
      const yesterday = new Date(now.getTime() - 86400000);
      start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0, 0);
      end.setTime(start.getTime() + 86400000 - 1);
      prevStart = new Date(start.getTime() - 86400000);
      prevEnd = new Date(end.getTime() - 86400000);
      break;
    }
    case '7d': {
      start = new Date(end.getTime() - 7 * 86400000);
      prevStart = new Date(start.getTime() - 7 * 86400000);
      prevEnd = new Date(start.getTime() - 1);
      break;
    }
    case '30d': {
      start = new Date(end.getTime() - 30 * 86400000);
      prevStart = new Date(start.getTime() - 30 * 86400000);
      prevEnd = new Date(start.getTime() - 1);
      break;
    }
    case '90d': {
      start = new Date(end.getTime() - 90 * 86400000);
      prevStart = new Date(start.getTime() - 90 * 86400000);
      prevEnd = new Date(start.getTime() - 1);
      break;
    }
    case 'custom': {
      start = customStart ? new Date(customStart) : new Date(end.getTime() - 30 * 86400000);
      const parsedEnd = customEnd ? new Date(customEnd) : end;
      end.setTime(parsedEnd.getTime());
      const durationMs = Math.max(86400000, end.getTime() - start.getTime());
      prevStart = new Date(start.getTime() - durationMs);
      prevEnd = new Date(start.getTime() - 1);
      break;
    }
    default: {
      start = new Date(end.getTime() - 30 * 86400000);
      prevStart = new Date(start.getTime() - 30 * 86400000);
      prevEnd = new Date(start.getTime() - 1);
    }
  }

  return {
    start,
    end,
    prevStart,
    prevEnd,
    hasPreviousData: true
  };
}

/**
 * Calculates MetricDelta with percentage and trend.
 */
export function computeDelta(current: number, previous: number): MetricDelta {
  let deltaPercentage = 0;
  if (previous > 0) {
    deltaPercentage = Math.round(((current - previous) / previous) * 1000) / 10;
  } else if (current > 0) {
    deltaPercentage = 100;
  }

  const trend: 'up' | 'down' | 'neutral' = 
    deltaPercentage > 0 ? 'up' : deltaPercentage < 0 ? 'down' : 'neutral';

  return {
    current,
    previous,
    deltaPercentage,
    trend
  };
}

/**
 * Computes the full Power BI Business Intelligence Summary for the specified date range.
 */
export async function getAnalyticsSummary(
  range: DateRangeFilter = '30d',
  customStart?: string,
  customEnd?: string
): Promise<AnalyticsSummary> {
  const { start, end, prevStart, prevEnd, hasPreviousData } = calculateDateRanges(range, customStart, customEnd);
  const startTime = start.getTime();
  const endTime = end.getTime();
  const prevStartTime = prevStart.getTime();
  const prevEndTime = prevEnd.getTime();

  let allEvents = inMemoryEvents;
  const adminClient = getSupabaseAdmin();
  if (adminClient && (typeof process === 'undefined' || process.env.NODE_ENV !== 'test')) {
    try {
      const { data, error } = await adminClient.from('analytics_events')
        .select('*')
        .gte('created_at', prevStart.toISOString())
        .lte('created_at', end.toISOString());
      if (!error && data) {
        allEvents = data as AnalyticsEvent[];
      }
    } catch (err) {
      console.warn('Could not query analytics from Supabase, using local memory:', err);
    }
  }

  // Filter current period and previous period events
  const currentEvents = allEvents.filter(e => {
    const t = new Date(e.created_at).getTime();
    return t >= startTime && t <= endTime;
  });

  const previousEvents = allEvents.filter(e => {
    const t = new Date(e.created_at).getTime();
    return t >= prevStartTime && t <= prevEndTime;
  });

  // Calculate current period metrics
  const currentPageViews = currentEvents.filter(e => e.event_name === 'page_view').length;
  const prevPageViews = previousEvents.filter(e => e.event_name === 'page_view').length;

  const currentSessions = new Set(currentEvents.map(e => e.session_id)).size;
  const prevSessions = new Set(previousEvents.map(e => e.session_id)).size;

  const currentUniqueVisitors = currentSessions; // privacy-safe estimated unique visitors
  const prevUniqueVisitors = prevSessions;

  const currentPropertyViews = currentEvents.filter(e => e.event_name === 'property_view').length;
  const prevPropertyViews = previousEvents.filter(e => e.event_name === 'property_view').length;

  const currentInquiries = currentEvents.filter(e => e.event_name === 'inquiry_submitted').length;
  const prevInquiries = previousEvents.filter(e => e.event_name === 'inquiry_submitted').length;

  const currentConsultations = currentEvents.filter(e => e.event_name === 'consultation_requested').length;
  const prevConsultations = previousEvents.filter(e => e.event_name === 'consultation_requested').length;

  const currentAppointments = currentEvents.filter(e => e.event_name === 'appointment_requested').length;
  const prevAppointments = previousEvents.filter(e => e.event_name === 'appointment_requested').length;

  const currentOrganic = currentEvents.filter(e => e.traffic_source === 'organic' && e.event_name === 'session_started').length;
  const prevOrganic = previousEvents.filter(e => e.traffic_source === 'organic' && e.event_name === 'session_started').length;

  // Real leads from store
  const allLeads = await getAllLeads();
  const currentLeadsInRange = allLeads.filter(l => {
    const t = new Date(l.created_at).getTime();
    return t >= startTime && t <= endTime;
  });
  const prevLeadsInRange = allLeads.filter(l => {
    const t = new Date(l.created_at).getTime();
    return t >= prevStartTime && t <= prevEndTime;
  });

  const currentQualified = currentLeadsInRange.filter(l => l.status === 'qualified').length;
  const prevQualified = prevLeadsInRange.filter(l => l.status === 'qualified').length;

  // Conversion rate (inquiries / unique_visitors)
  const currentConvRate = currentUniqueVisitors > 0 
    ? Math.round((currentInquiries / currentUniqueVisitors) * 1000) / 10 
    : 0;
  const prevConvRate = prevUniqueVisitors > 0 
    ? Math.round((prevInquiries / prevUniqueVisitors) * 1000) / 10 
    : 0;

  // Real properties
  const allProperties = await getProperties({ includeUnpublished: true });
  const publishedCount = allProperties.filter(p => p.publication_status === 'published').length;

  // Daily traffic trend line points
  const dailyMap = new Map<string, { page_views: number; sessions: Set<string>; inquiries: number }>();
  // Initialize days
  const stepMs = 86400000;
  for (let t = startTime; t <= endTime; t += stepMs) {
    const dStr = new Date(t).toISOString().split('T')[0];
    dailyMap.set(dStr, { page_views: 0, sessions: new Set(), inquiries: 0 });
  }

  for (const evt of currentEvents) {
    const dStr = new Date(evt.created_at).toISOString().split('T')[0];
    const item = dailyMap.get(dStr);
    if (item) {
      if (evt.event_name === 'page_view') item.page_views++;
      if (evt.event_name === 'inquiry_submitted') item.inquiries++;
      item.sessions.add(evt.session_id);
    }
  }

  const traffic_trend: DailyTrafficPoint[] = Array.from(dailyMap.entries()).map(([date, val]) => ({
    date,
    page_views: val.page_views,
    sessions: val.sessions.size,
    unique_visitors: val.sessions.size,
    inquiries: val.inquiries
  }));

  // Traffic Source breakdown
  const sourceCounts: Record<TrafficSource, number> = {
    direct: 0,
    organic: 0,
    social: 0,
    referral: 0,
    paid: 0
  };

  const deviceCounts: Record<DeviceCategory, number> = {
    desktop: 0,
    mobile: 0,
    tablet: 0
  };

  for (const evt of currentEvents) {
    if (evt.event_name === 'session_started') {
      sourceCounts[evt.traffic_source] = (sourceCounts[evt.traffic_source] || 0) + 1;
      deviceCounts[evt.device_category] = (deviceCounts[evt.device_category] || 0) + 1;
    }
  }

  const totalSourceSessions = Math.max(1, Object.values(sourceCounts).reduce((a, b) => a + b, 0));
  const traffic_sources = (Object.keys(sourceCounts) as TrafficSource[]).map(src => ({
    source: src,
    label: src.charAt(0).toUpperCase() + src.slice(1),
    sessions: sourceCounts[src],
    percentage: Math.round((sourceCounts[src] / totalSourceSessions) * 1000) / 10
  }));

  const totalDeviceSessions = Math.max(1, Object.values(deviceCounts).reduce((a, b) => a + b, 0));
  const device_distribution = (Object.keys(deviceCounts) as DeviceCategory[]).map(dev => ({
    category: dev,
    label: dev.charAt(0).toUpperCase() + dev.slice(1),
    sessions: deviceCounts[dev],
    percentage: Math.round((deviceCounts[dev] / totalDeviceSessions) * 1000) / 10
  }));

  // Lead status distribution
  const lead_status_distribution: Record<string, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    appointment_scheduled: 0,
    in_progress: 0,
    converted: 0,
    lost: 0,
    spam: 0
  };

  for (const l of allLeads) {
    const s = l.status as string;
    if (s === 'appointment_set') {
      lead_status_distribution['appointment_scheduled'] = (lead_status_distribution['appointment_scheduled'] || 0) + 1;
    } else if (s === 'closed') {
      lead_status_distribution['converted'] = (lead_status_distribution['converted'] || 0) + 1;
    } else if (s === 'archived') {
      lead_status_distribution['lost'] = (lead_status_distribution['lost'] || 0) + 1;
    } else {
      lead_status_distribution[s] = (lead_status_distribution[s] || 0) + 1;
    }
  }

  // Property ranking (views & inquiries in date range)
  const propViewsMap = new Map<string, number>();
  const propInquiriesMap = new Map<string, number>();

  for (const evt of currentEvents) {
    if (evt.property_id) {
      if (evt.event_name === 'property_view') {
        propViewsMap.set(evt.property_id, (propViewsMap.get(evt.property_id) || 0) + 1);
      }
      if (evt.event_name === 'inquiry_submitted') {
        propInquiriesMap.set(evt.property_id, (propInquiriesMap.get(evt.property_id) || 0) + 1);
      }
    }
  }

  const property_ranking: PropertyRanking[] = allProperties.map(p => {
    const views = propViewsMap.get(p.id) || p.view_count || 0;
    const inquiries = propInquiriesMap.get(p.id) || p.inquiries_count || 0;
    const convRate = views > 0 ? (inquiries / views) * 100 : 0;
    return {
      property_id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      status: p.listing_status || 'for_sale',
      views,
      inquiries,
      conversion_rate: Math.round(convRate * 10) / 10
    };
  }).sort((a, b) => b.views - a.views);

  // Top Landing Pages
  const landingMap = new Map<string, { views: number; inquiries: number }>();
  for (const evt of currentEvents) {
    if (evt.event_name === 'page_view') {
      const item = landingMap.get(evt.page_path) || { views: 0, inquiries: 0 };
      item.views++;
      landingMap.set(evt.page_path, item);
    }
    if (evt.event_name === 'inquiry_submitted') {
      const item = landingMap.get(evt.page_path) || { views: 0, inquiries: 0 };
      item.inquiries++;
      landingMap.set(evt.page_path, item);
    }
  }

  const landing_pages: LandingPagePerformance[] = Array.from(landingMap.entries())
    .map(([path, data]) => ({
      path,
      views: data.views,
      inquiries: data.inquiries,
      conversion_rate: data.views > 0 ? Math.round((data.inquiries / data.views) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  // Conversion Funnel calculation (strictly non-increasing pipeline)
  const stage1Visitors = currentUniqueVisitors;
  const stage2PropertyViews = Math.min(stage1Visitors, currentPropertyViews);
  const stage3Inquiries = Math.min(stage2PropertyViews, currentInquiries);
  const stage4Qualified = Math.min(stage3Inquiries, Math.max(0, currentQualified));
  const stage5Appointments = Math.min(stage4Qualified, Math.max(0, currentAppointments));
  const stage6Closed = Math.min(stage5Appointments, Math.max(0, lead_status_distribution['converted'] || 0));

  const funnelStages: { stage: string; label: string; count: number }[] = [
    { stage: 'visitors', label: '1. Site Visitors', count: stage1Visitors },
    { stage: 'property_views', label: '2. Property Views', count: stage2PropertyViews },
    { stage: 'inquiries', label: '3. Inquiries Submitted', count: stage3Inquiries },
    { stage: 'qualified', label: '4. Qualified Leads', count: stage4Qualified },
    { stage: 'appointments', label: '5. Appointments Scheduled', count: stage5Appointments },
    { stage: 'closed', label: '6. Escrow Closed', count: stage6Closed }
  ];

  const funnel: FunnelStage[] = funnelStages.map((st, idx) => {
    const topCount = Math.max(1, funnelStages[0].count);
    const prevCount = idx === 0 ? st.count : Math.max(1, funnelStages[idx - 1].count);
    const dropoffRate = idx === 0 ? 0 : Math.max(0, 100 - (st.count / prevCount) * 100);
    const conversionRate = (st.count / topCount) * 100;
    return {
      stage: st.stage,
      label: st.label,
      count: st.count,
      dropoffRate: Math.round(dropoffRate * 10) / 10,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  });

  // Listing Inventory by status
  const inventory_status_breakdown: Record<string, number> = {
    for_sale: 0,
    for_rent: 0,
    pending: 0,
    sold: 0,
    coming_soon: 0
  };

  for (const p of allProperties) {
    const st = p.listing_status;
    if (st && inventory_status_breakdown[st] !== undefined) {
      inventory_status_breakdown[st] = (inventory_status_breakdown[st] || 0) + 1;
    }
  }

  // Open house inquiries count
  const open_house_inquiries_count = allLeads.filter(l => l.lead_type === 'open_house_rsvp').length;

  return {
    range,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    previousStartDate: prevStart.toISOString(),
    previousEndDate: prevEnd.toISOString(),
    hasPreviousData,
    page_views: computeDelta(currentPageViews, prevPageViews),
    sessions: computeDelta(currentSessions, prevSessions),
    unique_visitors: computeDelta(currentUniqueVisitors, prevUniqueVisitors),
    property_views: computeDelta(currentPropertyViews, prevPropertyViews),
    inquiries: computeDelta(currentInquiries, prevInquiries),
    qualified_leads: computeDelta(currentQualified, prevQualified),
    consultations: computeDelta(currentConsultations, prevConsultations),
    appointments: computeDelta(currentAppointments, prevAppointments),
    conversion_rate: computeDelta(currentConvRate, prevConvRate),
    published_count: publishedCount,
    organic_traffic: computeDelta(currentOrganic, prevOrganic),
    traffic_trend,
    traffic_sources,
    device_distribution,
    lead_status_distribution,
    property_ranking,
    landing_pages,
    funnel,
    inventory_status_breakdown,
    open_house_inquiries_count
  };
}

/**
 * Returns raw events count (for diagnostics and testing)
 */
export function getInMemoryEventsCount(): number {
  return inMemoryEvents.length;
}

/**
 * Clear in memory events (for isolated tests)
 */
export function resetInMemoryEvents(): void {
  inMemoryEvents = [];
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    seedHistoricalEvents();
  }
}
