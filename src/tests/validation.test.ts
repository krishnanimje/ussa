import { describe, it, expect } from 'vitest';
import { validateLeadSubmission, validateEmail, validatePhone } from '../lib/validation';

describe('Validation Logic', () => {
  it('validates correct email addresses', () => {
    expect(validateEmail('edgar@yourrealtoredgar.com')).toBe(true);
    expect(validateEmail('client.san-diego@gmail.com')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('invalid@')).toBe(false);
  });

  it('validates 10+ digit phone numbers', () => {
    expect(validatePhone('(619) 555-0198')).toBe(true);
    expect(validatePhone('6195550198')).toBe(true);
    expect(validatePhone('+1 858 555 1234')).toBe(true);
    expect(validatePhone('12345')).toBe(false);
  });

  it('rejects invalid lead submission missing required fields', () => {
    const result = validateLeadSubmission({
      fullName: '',
      email: 'notanemail',
      phone: ''
    });

    expect(result.success).toBe(false);
    expect(result.errors?.fullName).toBeDefined();
    expect(result.errors?.email).toBeDefined();
    expect(result.errors?.phone).toBeDefined();
  });

  it('accepts and sanitizes valid lead submission', () => {
    const result = validateLeadSubmission({
      fullName: '  Jane Doe <script>alert("xss")</script> ',
      email: 'jane@example.com',
      phone: '(619) 888-9999',
      leadType: 'first_time_buyer',
      message: 'Looking for homes in North Park.',
      preferredContactMethod: 'text',
      languagePreference: 'es'
    });

    expect(result.success).toBe(true);
    expect(result.data?.fullName).toBe('Jane Doe alert("xss")');
    expect(result.data?.email).toBe('jane@example.com');
    expect(result.data?.leadType).toBe('first_time_buyer');
    expect(result.data?.preferredContactMethod).toBe('text');
    expect(result.data?.languagePreference).toBe('es');
  });
});
