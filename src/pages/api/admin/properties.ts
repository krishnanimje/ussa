import type { APIRoute } from 'astro';
import { checkAdminAuth } from '../../../lib/auth';
import { 
  getPropertiesPaginated, 
  createProperty, 
  updateProperty, 
  deleteProperty,
  getPropertyById 
} from '../../../lib/store';

export const prerender = false;

// GET /api/admin/properties - Searchable, filterable, paginated inventory
export const GET: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  const url = new URL(request.url);
  const search = url.searchParams.get('search') || undefined;
  const publicationStatus = url.searchParams.get('publicationStatus') || undefined;
  const listingStatus = url.searchParams.get('listingStatus') || undefined;
  const propertyType = url.searchParams.get('propertyType') || undefined;
  const neighborhood = url.searchParams.get('neighborhood') || undefined;
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
  const id = url.searchParams.get('id');

  if (id) {
    const single = await getPropertyById(id);
    if (!single) {
      return new Response(JSON.stringify({ error: 'Property not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ success: true, property: single }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

  const result = await getPropertiesPaginated({
    search,
    publicationStatus,
    listingStatus,
    propertyType,
    neighborhood,
    page,
    pageSize,
    includeUnpublished: true,
    includeDeleted: false
  });

  return new Response(JSON.stringify({ success: true, ...result }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

// POST /api/admin/properties - Create new listing
export const POST: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    const result = await createProperty(body, 'edgar@yourrealtoredgar.com');

    if (!result.success) {
      return new Response(JSON.stringify({ success: false, error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, property: result.property }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Invalid request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// PUT /api/admin/properties - Update existing listing
export const PUT: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Property ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await updateProperty(id, updates, 'edgar@yourrealtoredgar.com');

    if (!result.success) {
      return new Response(JSON.stringify({ success: false, error: result.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, property: result.property }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Invalid request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE /api/admin/properties - Soft-delete listing
export const DELETE: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Property ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const success = await deleteProperty(id, true, 'edgar@yourrealtoredgar.com');

    return new Response(JSON.stringify({ success }), {
      status: success ? 200 : 404,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
