import type { APIRoute } from 'astro';
import { checkAdminAuth } from '../../../../lib/auth';
import { getProperties, getAllLeads } from '../../../../lib/store';
import { getAnalyticsSummary } from '../../../../lib/analytics';
import { generateReportCsv } from '../../../../lib/csv';
import type { ReportType } from '../../../../lib/types';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const reportType = (url.searchParams.get('type') || 'property_inventory') as ReportType;
    const range = (url.searchParams.get('range') || '30d') as any;

    const [properties, leads, analytics] = await Promise.all([
      getProperties({ includeUnpublished: true, includeDeleted: true }),
      getAllLeads(),
      getAnalyticsSummary(range)
    ]);

    const { filename, csv } = generateReportCsv(reportType, {
      properties,
      leads,
      analytics
    });

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err) {
    return new Response(`Error generating report: ${err instanceof Error ? err.message : 'Unknown error'}`, {
      status: 500
    });
  }
};
