import type { APIRoute } from 'astro';
import { checkAdminAuth } from '../../../lib/auth';
import { getNeighborhoods, updateNeighborhood } from '../../../lib/store';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const neighborhoods = await getNeighborhoods();
  return new Response(JSON.stringify({ success: true, neighborhoods }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { slug, ...updates } = body;
    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: 'Neighborhood slug is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updated = await updateNeighborhood(slug, updates);
    if (!updated) {
      return new Response(JSON.stringify({ success: false, error: 'Neighborhood not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, neighborhood: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
