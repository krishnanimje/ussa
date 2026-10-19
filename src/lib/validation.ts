// Input validation and sanitization for forms and API endpoints
import type { LeadType, ContactMethod, Language } from './types';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
}

export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  leadType: LeadType;
  message?: string;
  preferredContactMethod?: ContactMethod;
  propertyId?: string;
  propertyAddress?: string;
  estimatedBudget?: string;
  timeframe?: string;
  isPreapproved?: boolean;
  languagePreference?: Language;
}

export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') return '';
  // Strip control characters, script tags, HTML tags
  return input
    .replace(/<[^>]*>?/gm, '')
    .trim();
}

export function validateEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
}

export function validatePhone(phone: string): boolean {
  // Strip spaces, dashes, parentheses
  const digitsOnly = phone.replace(/\D/g, '');
  // North American standard: 10 or 11 digits (with country code 1)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

export function validateLeadSubmission(rawData: Record<string, unknown>): ValidationResult<LeadFormData> {
  const errors: Record<string, string> = {};

  const fullName = sanitizeString(rawData.fullName || rawData.name || rawData.full_name);
  if (!fullName || fullName.length < 2) {
    errors.fullName = 'Please enter your full name (minimum 2 characters).';
  } else if (fullName.length > 100) {
    errors.fullName = 'Name cannot exceed 100 characters.';
  }

  const email = sanitizeString(rawData.email).toLowerCase();
  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!validateEmail(email)) {
    errors.email = 'Please provide a valid email address.';
  }

  const phone = sanitizeString(rawData.phone);
  if (!phone) {
    errors.phone = 'Phone number is required so Edgar can contact you.';
  } else if (!validatePhone(phone)) {
    errors.phone = 'Please provide a valid 10-digit phone number.';
  }

  const allowedLeadTypes: LeadType[] = [
    'first_time_buyer',
    'va_buyer',
    'seller_valuation',
    'investor_flip',
    'general_contact',
    'tour_request',
    'open_house_rsvp'
  ];

  const rawLeadType = sanitizeString(rawData.leadType || rawData.lead_type) as LeadType;
  const leadType: LeadType = allowedLeadTypes.includes(rawLeadType) ? rawLeadType : 'general_contact';

  const message = sanitizeString(rawData.message);
  if (message.length > 2000) {
    errors.message = 'Message must be under 2000 characters.';
  }

  const preferredContactMethod = (['phone', 'email', 'text'].includes(rawData.preferredContactMethod as string)
    ? rawData.preferredContactMethod
    : 'phone') as ContactMethod;

  const languagePreference = (['en', 'es'].includes(rawData.languagePreference as string)
    ? rawData.languagePreference
    : 'en') as Language;

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      fullName,
      email,
      phone,
      leadType,
      message,
      preferredContactMethod,
      propertyId: sanitizeString(rawData.propertyId || rawData.property_id) || undefined,
      propertyAddress: sanitizeString(rawData.propertyAddress || rawData.property_address || rawData.address) || undefined,
      estimatedBudget: sanitizeString(rawData.estimatedBudget || rawData.budget) || undefined,
      timeframe: sanitizeString(rawData.timeframe) || undefined,
      isPreapproved: Boolean(rawData.isPreapproved || rawData.preapproved),
      languagePreference
    }
  };
}
