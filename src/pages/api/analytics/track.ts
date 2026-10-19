import type { APIRoute } from 'astro';
import { recordAnalyticsEvent } from '../../../lib/analytics';
import type { AnalyticsEventName } from '../../../lib/types';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const userAgent = request.headers.get('user-agent') || undefined;
    const body = await request.json();

    if (!body || typeof body !== 'object') {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const {
      event_name,
      session_id,
      page_path,
      property_id,
      referrer,
      traffic_source,
      device_category,
      utm_source,
      utm_medium,
      utm_campaign,
      metadata
    } = body;

    const result = await recordAnalyticsEvent({
      event_name: event_name as AnalyticsEventName,
      session_id,
      page_path,
      property_id,
      referrer,
      traffic_source,
      device_category,
      utm_source,
      utm_medium,
      utm_campaign,
      metadata,
      user_agent: userAgent
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, eventId: result.eventId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error processing analytics event' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
