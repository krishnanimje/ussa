import type { APIRoute } from 'astro';
import { validateLeadSubmission } from '../../lib/validation';
import { submitLead } from '../../lib/store';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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

    const validation = validateLeadSubmission(body);
    if (!validation.success || !validation.data) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Validation failed', 
        errors: validation.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('cf-connecting-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Persist to database
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

    return new Response(JSON.stringify({ 
      success: true, 
      leadId: persistenceResult.leadId,
      message: 'Inquiry saved successfully.' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('API /leads server error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'An internal server error occurred while processing your request.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
