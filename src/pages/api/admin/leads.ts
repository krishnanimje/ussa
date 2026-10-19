import type { APIRoute } from 'astro';
import { getAllLeads, updateLead, addLeadNote, getLeadById, deleteLead } from '../../../lib/store';
import { checkAdminAuth } from '../../../lib/auth';
import type { LeadStatus } from '../../../lib/types';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (id) {
    const lead = await getLeadById(id);
    if (!lead) {
      return new Response(JSON.stringify({ error: 'Lead not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ success: true, lead }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const search = url.searchParams.get('search')?.toLowerCase().trim() || '';
  const status = url.searchParams.get('status') || '';
  const leadType = url.searchParams.get('type') || '';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const pageSize = Math.max(1, parseInt(url.searchParams.get('pageSize') || '20', 10));

  let all = await getAllLeads();

  if (search) {
    all = all.filter(l => 
      l.full_name.toLowerCase().includes(search) ||
      l.email.toLowerCase().includes(search) ||
      l.phone.toLowerCase().includes(search) ||
      (l.property_address && l.property_address.toLowerCase().includes(search)) ||
      (l.message && l.message.toLowerCase().includes(search))
    );
  }

  if (status && status !== 'all') {
    all = all.filter(l => l.status === status);
  }

  if (leadType && leadType !== 'all') {
    all = all.filter(l => l.lead_type === leadType);
  }

  const total = all.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const paginated = all.slice((page - 1) * pageSize, page * pageSize);

  return new Response(JSON.stringify({
    success: true,
    leads: paginated,
    total,
    page,
    pageSize,
    totalPages
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await request.json();
    const { action, leadId, note } = body;

    if (action === 'add_note') {
      if (!leadId || !note || typeof note !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing leadId or note' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const res = await addLeadNote(leadId, note, 'edgar@yourrealtoredgar.com');
      return new Response(JSON.stringify(res), {
        status: res.success ? 200 : 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unsupported action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { leadId, status, admin_notes, follow_up_date, assigned_admin } = await request.json();
    if (!leadId) {
      return new Response(JSON.stringify({ error: 'Missing leadId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status as LeadStatus;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;
    if (follow_up_date !== undefined) updates.follow_up_date = follow_up_date;
    if (assigned_admin !== undefined) updates.assigned_admin = assigned_admin;

    const updated = await updateLead(leadId, updates, 'edgar@yourrealtoredgar.com');
    return new Response(JSON.stringify({ success: updated }), {
      status: updated ? 200 : 404,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error updating lead' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  if (!checkAdminAuth(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Admin privileges required.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing lead id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const success = await deleteLead(id, 'edgar@yourrealtoredgar.com');
    return new Response(JSON.stringify({ success }), {
      status: success ? 200 : 404,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error deleting lead' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
