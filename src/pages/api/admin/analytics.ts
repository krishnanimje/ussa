import type { APIRoute } from 'astro';
import { checkAdminAuth } from '../../../lib/auth';
import { getAnalyticsSummary } from '../../../lib/analytics';
import { getGSCMetrics } from '../../../lib/gsc';
import type { DateRangeFilter } from '../../../lib/types';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const range = (url.searchParams.get('range') || '30d') as DateRangeFilter;
    const startDate = url.searchParams.get('startDate') || undefined;
    const endDate = url.searchParams.get('endDate') || undefined;

    const summary = await getAnalyticsSummary(range, startDate, endDate);
    const gsc = await getGSCMetrics();

    return new Response(JSON.stringify({
      success: true,
      summary,
      gsc
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error generating analytics summary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
