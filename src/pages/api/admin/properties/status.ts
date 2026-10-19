import type { APIRoute } from 'astro';
import { checkAdminAuth } from '../../../../lib/auth';
import { 
  publishProperty, 
  unpublishProperty, 
  archiveProperty, 
  unarchiveProperty,
  getPropertyById 
} from '../../../../lib/store';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { id, action } = await request.json();
    if (!id || !action) {
      return new Response(JSON.stringify({ success: false, error: 'Property ID and action are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    let success = false;
    if (action === 'publish') {
      success = await publishProperty(id, 'edgar@yourrealtoredgar.com');
    } else if (action === 'unpublish') {
      success = await unpublishProperty(id, 'edgar@yourrealtoredgar.com');
    } else if (action === 'archive') {
      success = await archiveProperty(id, 'edgar@yourrealtoredgar.com');
    } else if (action === 'unarchive') {
      success = await unarchiveProperty(id, 'edgar@yourrealtoredgar.com');
    } else {
      return new Response(JSON.stringify({ success: false, error: `Invalid action: ${action}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updated = await getPropertyById(id);
    return new Response(JSON.stringify({ success, property: updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message || 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
