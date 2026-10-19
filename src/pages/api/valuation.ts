import type { APIRoute } from 'astro';
import { validateLeadSubmission } from '../../lib/validation';
import { submitLead } from '../../lib/store';
import { checkLeadSubmissionRateLimit } from '../../lib/rateLimit';
import { getClientIp } from '../../lib/auth';

export const prerender = false;
const MAX_PAYLOAD_BYTES = 50 * 1024;

export const POST: APIRoute = async ({ request }) => {
  const clientIp = getClientIp(request);

  // 1. Rate limiting
  const rateLimit = checkLeadSubmissionRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Too many requests. Please wait a few minutes before submitting another valuation request.',
      retryAfter: rateLimit.retryAfterSeconds
    }), {
      status: 429,
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimit.retryAfterSeconds)
      }
    });
  }

  // 2. Payload size check
  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return new Response(JSON.stringify({ success: false, error: 'Payload exceeds limit' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON request' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    body.leadType = 'seller_valuation';

    // 3. Validation & Anti-Spam
    const validation = validateLeadSubmission(body);
    if (!validation.success || !validation.data) {
      if (validation.isSpam) {
        return new Response(JSON.stringify({ success: false, error: 'Automated submission blocked.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Please fill in all required fields including your property address.', 
        errors: validation.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';

    const result = await submitLead({
      full_name: validation.data.fullName,
      email: validation.data.email,
      phone: validation.data.phone,
      lead_type: 'seller_valuation',
      message: `Property Address for Valuation: ${body.propertyAddress || 'Not specified'}. Details: ${validation.data.message || 'Standard CMA request'}`,
      preferred_contact_method: validation.data.preferredContactMethod,
      property_address: String(body.propertyAddress || ''),
      timeframe: validation.data.timeframe,
      language_preference: validation.data.languagePreference,
      ip_address: clientIp,
      user_agent: userAgent
    });

    return new Response(JSON.stringify({ 
      success: true, 
      leadId: result.leadId,
      message: 'Valuation request submitted successfully.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'An unexpected server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
