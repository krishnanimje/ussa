// Input validation, anti-spam sanitization, and secure media inspection
import type { LeadType, ContactMethod, Language } from './types';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  isSpam?: boolean;
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
  marketingConsent?: boolean;
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
  // 1. Anti-Spam Honeypot Verification
  // If the hidden honeypot field is filled, reject silently / mark as spam
  const honeypot = String(rawData._hp || rawData.website || rawData.url || '').trim();
  if (honeypot.length > 0) {
    return {
      success: false,
      isSpam: true,
      errors: { _hp: 'Automated submission rejected.' }
    };
  }

  // 2. Anti-Spam Time Verification (Form must take > 1.5s to complete for genuine humans)
  if (rawData._t) {
    const renderTime = Number(rawData._t);
    if (!isNaN(renderTime) && renderTime > 0) {
      const elapsedMs = Date.now() - renderTime;
      if (elapsedMs < 1200) {
        return {
          success: false,
          isSpam: true,
          errors: { _t: 'Submission completed unnaturally fast. Automated bot detected.' }
        };
      }
    }
  }

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

  const marketingConsent = Boolean(
    rawData.marketingConsent === true ||
    rawData.marketing_consent === true ||
    rawData.consent === 'true' ||
    rawData.consent === true
  );

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
      languagePreference,
      marketingConsent
    }
  };
}

// --------------------------------------------------------------------------
// Secure Media & File Upload Verification (OWASP Compliant)
// --------------------------------------------------------------------------

export interface FileValidationResult {
  valid: boolean;
  detectedMime?: string;
  error?: string;
}

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg']);
const MAX_MEDIA_BYTES = 10 * 1024 * 1024; // 10MB

export function validateImageBuffer(
  buffer: Buffer,
  filename: string,
  declaredMime: string
): FileValidationResult {
  // 1. Size constraint
  if (buffer.length === 0) {
    return { valid: false, error: 'Empty file uploaded.' };
  }
  if (buffer.length > MAX_MEDIA_BYTES) {
    return { 
      valid: false, 
      error: `File size exceeds maximum allowed 10MB limit (${(buffer.length / (1024 * 1024)).toFixed(1)}MB).` 
    };
  }

  // 2. Extension check
  const dotIndex = filename.lastIndexOf('.');
  const ext = dotIndex !== -1 ? filename.substring(dotIndex).toLowerCase() : '';
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { 
      valid: false, 
      error: `Disallowed file extension '${ext}'. Allowed formats: JPG, PNG, WebP, AVIF, SVG.` 
    };
  }

  // 3. Binary Magic Number / File Signature Verification
  // JPEG: 0xFF, 0xD8, 0xFF
  if (buffer.length >= 3 && buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { valid: true, detectedMime: 'image/jpeg' };
  }

  // PNG: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  if (buffer.length >= 8 &&
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
      buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
    return { valid: true, detectedMime: 'image/png' };
  }

  // WebP: RIFF at byte 0..3 and WEBP at byte 8..11
  if (buffer.length >= 12) {
    const riff = buffer.toString('ascii', 0, 4);
    const webp = buffer.toString('ascii', 8, 12);
    if (riff === 'RIFF' && webp === 'WEBP') {
      return { valid: true, detectedMime: 'image/webp' };
    }
  }

  // AVIF: check for ftyp box with avif or avis
  if (buffer.length >= 16) {
    const ftypCheck = buffer.toString('ascii', 4, 16);
    if (ftypCheck.includes('ftypavif') || ftypCheck.includes('ftypavis')) {
      return { valid: true, detectedMime: 'image/avif' };
    }
  }

  // SVG: Inspect text for valid XML/SVG and strictly reject script or embedded payload injection
  if (ext === '.svg' || declaredMime === 'image/svg+xml') {
    const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 65536)).toLowerCase();
    
    // Must contain <svg tag
    if (!text.includes('<svg')) {
      return { valid: false, error: 'Malformed SVG: missing <svg> element.' };
    }

    // OWASP SVG Sanitization: strictly reject active content / script execution
    const dangerousPatterns = [
      '<script',
      'javascript:',
      'onload=',
      'onerror=',
      'onclick=',
      'onmouseover=',
      '<foreignobject',
      '<iframe',
      '<embed',
      'xlink:href="javascript:'
    ];

    for (const pattern of dangerousPatterns) {
      if (text.includes(pattern)) {
        return { 
          valid: false, 
          error: `SVG contains unsafe active script content (${pattern}). Upload rejected for security.` 
        };
      }
    }

    return { valid: true, detectedMime: 'image/svg+xml' };
  }

  return { 
    valid: false, 
    error: 'File signature does not match authorized image types (JPEG, PNG, WebP, AVIF, SVG).' 
  };
}
