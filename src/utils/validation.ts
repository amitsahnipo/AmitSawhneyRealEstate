/**
 * Real-Time Input Validation Utility
 * Standardized validation for email addresses, phone numbers, names, and addresses.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format in real-time.
 * Checks for RFC standard structure: user@domain.tld
 */
export function validateEmail(email: string, isRequired = true): ValidationResult {
  const trimmed = email.trim();

  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, error: 'Email address is required.' };
    }
    return { isValid: true };
  }

  if (trimmed.includes(' ')) {
    return { isValid: false, error: 'Email address cannot contain spaces.' };
  }

  if (!trimmed.includes('@')) {
    return { isValid: false, error: "Email must include '@' (e.g. name@example.com)." };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: "Email cannot contain multiple '@' symbols." };
  }

  const [local, domain] = parts;

  if (!local) {
    return { isValid: false, error: "Please provide the username before the '@'." };
  }

  if (!domain) {
    return { isValid: false, error: "Please enter a domain after '@' (e.g. example.com)." };
  }

  if (!domain.includes('.')) {
    return { isValid: false, error: "Domain must include an extension (e.g. .com, .ca)." };
  }

  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];

  if (!tld || tld.length < 2) {
    return { isValid: false, error: "Domain extension must be at least 2 letters (e.g. .com, .ca)." };
  }

  // Strict regex test
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }

  return { isValid: true };
}

/**
 * Validates phone numbers.
 * Supports North American 10-digit formats with or without country code.
 */
export function validatePhone(phone: string, isRequired = true): ValidationResult {
  const trimmed = phone.trim();

  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, error: 'Phone number is required.' };
    }
    return { isValid: true };
  }

  // Extract digits
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length < 10) {
    return {
      isValid: false,
      error: `Please enter a full 10-digit phone number (${digitsOnly.length}/10 digits entered).`
    };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, error: 'Phone number cannot exceed 15 digits.' };
  }

  // Check if starts with invalid repeating single digit (e.g. 0000000000 or 1111111111)
  if (/^(\d)\1{9,}$/.test(digitsOnly)) {
    return { isValid: false, error: 'Please enter a real phone number.' };
  }

  return { isValid: true };
}

/**
 * Auto-formats phone numbers as the user types (e.g., (647) 555-0199)
 */
export function formatPhoneNumber(input: string): string {
  // Strip non-digits
  const digits = input.replace(/\D/g, '');

  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  // If 11 digits starting with 1
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
  }
  // Otherwise format first 10 and keep extension
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)} ext. ${digits.slice(10, 14)}`;
}

/**
 * Validates a person's name (first, last, or full name).
 */
export function validateName(name: string, label = 'Full name', isRequired = true): ValidationResult {
  const trimmed = name.trim();

  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, error: `${label} is required.` };
    }
    return { isValid: true };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: `${label} must be at least 2 characters.` };
  }

  // Disallow numbers or inappropriate symbols
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'\-\.]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: `${label} can only contain letters, spaces, hyphens, or apostrophes.` };
  }

  return { isValid: true };
}

/**
 * Validates street address for property valuation.
 */
export function validateAddress(address: string, isRequired = true): ValidationResult {
  const trimmed = address.trim();

  if (!trimmed) {
    if (isRequired) {
      return { isValid: false, error: 'Property street address is required.' };
    }
    return { isValid: true };
  }

  if (trimmed.length < 5) {
    return { isValid: false, error: 'Please enter a complete street address (e.g. 142 Meadowglen Dr).' };
  }

  return { isValid: true };
}
