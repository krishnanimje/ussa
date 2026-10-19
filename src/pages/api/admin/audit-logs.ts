import type { APIRoute } from 'astro';
import { checkAdminAuth } from '../../../lib/auth';
import { getAuditLogs } from '../../../lib/store';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '30', 10);
  const logs = await getAuditLogs(limit);

  return new Response(JSON.stringify({ success: true, logs }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
