import type { APIRoute } from 'astro';
import { validateLeadSubmission } from '../../lib/validation';
import { submitLead } from '../../lib/store';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    body.leadType = 'seller_valuation';

    const validation = validateLeadSubmission(body);
    if (!validation.success || !validation.data) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Please fill in all required fields including your property address.', 
        errors: validation.errors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
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
    console.error('API /valuation error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
