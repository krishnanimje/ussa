import type { APIRoute } from 'astro';
import { validateLeadSubmission } from '../../lib/validation';
import { submitLead } from '../../lib/store';
import { checkLeadSubmissionRateLimit } from '../../lib/rateLimit';
import { getClientIp } from '../../lib/auth';
import { dispatchLeadNotification } from '../../lib/notifications';

export const prerender = false;

// Maximum acceptable JSON payload size: 50KB
const MAX_PAYLOAD_BYTES = 50 * 1024;

export const POST: APIRoute = async ({ request }) => {
  const clientIp = getClientIp(request);

  // 1. Enforce IP Rate Limiting
  const rateLimit = checkLeadSubmissionRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Too many inquiry submissions from this network. Please wait 15 minutes before submitting another request.',
      retryAfter: rateLimit.retryAfterSeconds
    }), {
      status: 429,
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimit.retryAfterSeconds)
      }
    });
  }

  // 2. Enforce Payload Size Limit
  const contentLength = Number(request.headers.get('content-length') || '0');
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Payload size exceeds the 50KB limit.' 
    }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON request payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Server-Side Input Validation & Anti-Spam Check
    const validation = validateLeadSubmission(body);
    if (!validation.success || !validation.data) {
      if (validation.isSpam) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Automated spam submission detected and blocked.' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Validation failed', 
        errors: validation.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 4. Persist to database
    const persistenceResult = await submitLead({
      full_name: validation.data.fullName,
      email: validation.data.email,
      phone: validation.data.phone,
      lead_type: validation.data.leadType,
      message: validation.data.message,
      preferred_contact_method: validation.data.preferredContactMethod,
      property_id: validation.data.propertyId,
      property_address: validation.data.propertyAddress,
      estimated_budget: validation.data.estimatedBudget,
      timeframe: validation.data.timeframe,
      is_preapproved: validation.data.isPreapproved,
      language_preference: validation.data.languagePreference,
      ip_address: clientIp,
      user_agent: userAgent
    });

    if (!persistenceResult.success) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unable to save lead to database. Please call (619) 555-0198.' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. Real-Time Webhook & Lead Alert Dispatch (Non-blocking)
    dispatchLeadNotification({
      id: persistenceResult.leadId,
      full_name: validation.data.fullName,
      email: validation.data.email,
      phone: validation.data.phone,
      lead_type: validation.data.leadType,
      message: validation.data.message,
      preferred_contact_method: validation.data.preferredContactMethod,
      property_id: validation.data.propertyId,
      property_address: validation.data.propertyAddress,
      estimated_budget: validation.data.estimatedBudget,
      timeframe: validation.data.timeframe,
      is_preapproved: validation.data.isPreapproved,
      language_preference: validation.data.languagePreference
    }).catch(err => console.warn('Lead notification alert dispatch warning:', err));

    return new Response(JSON.stringify({ 
      success: true, 
      leadId: persistenceResult.leadId,
      message: 'Inquiry saved successfully.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Safe error response - never leak stack traces to client
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'An internal server error occurred while processing your request.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
