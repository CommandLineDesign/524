const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type HelperStatus = 'success' | 'error' | '';

export interface HelperResult {
  message: string;
  status: HelperStatus;
}

export function isValidEmail(email: string) {
  return emailRegex.test(email.trim());
}

export function isValidPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

// ===============================================
// New validation functions for updated signup
// ===============================================

/**
 * Validates name - must be non-empty and 1-50 characters
 */
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 50;
}

/**
 * Validates Korean phone number format
 * - 010 numbers must be 11 digits: 010-XXXX-XXXX (01012345678)
 * - Other prefixes (011, 016, 017, 018, 019) can be 10-11 digits
 */
export function isValidKoreanPhone(phone: string): boolean {
  const cleaned = phone.replace(/[-\s]/g, '');
  // 010 requires exactly 11 digits (010 + 8 more)
  if (cleaned.startsWith('010')) {
    return /^010\d{8}$/.test(cleaned);
  }
  // Other prefixes (011, 016, 017, 018, 019) allow 10-11 digits
  return /^01[16789]\d{7,8}$/.test(cleaned);
}

/**
 * Validates date of birth string (YYYY-MM-DD format)
 * Checks: valid date, age between 13-120 years
 */
export function isValidDateOfBirth(dob: string): boolean {
  // Check format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return false;
  }

  const [year, month, day] = dob.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  // Check if date is valid (handles invalid dates like 2000-02-30)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false;
  }

  // Check age (13-120 years old)
  const today = new Date();
  const currentYear = today.getFullYear();
  const age = currentYear - year;

  return age >= 13 && age <= 120;
}

/**
 * Auto-formats Korean phone number as user types
 * Input: "01012345678" -> Output: "010-1234-5678"
 */
export function formatKoreanPhone(input: string): string {
  // Remove all non-digits
  const digits = input.replace(/\D/g, '');

  // Format based on length
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  // Handle both 10-digit (010-XXX-XXXX) and 11-digit (010-XXXX-XXXX) formats
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Auto-formats date of birth as user types
 * Input: "19900101" -> Output: "1990-01-01"
 */
export function formatDateOfBirth(input: string): string {
  // Remove all non-digits
  const digits = input.replace(/\D/g, '');

  // Format based on length
  if (digits.length <= 4) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
}

/**
 * Extracts birth year from YYYY-MM-DD format
 */
export function extractBirthYear(dob: string): number | null {
  if (!isValidDateOfBirth(dob)) {
    return null;
  }
  return Number.parseInt(dob.split('-')[0], 10);
}

/**
 * Get helper message for name field
 */
export function getNameHelper(name: string, touched: boolean): HelperResult {
  if (!touched && name.length === 0) {
    return { message: '', status: '' };
  }

  if (isValidName(name)) {
    return { message: '', status: 'success' };
  }

  if (name.trim().length === 0) {
    return { message: '이름을 입력해주세요.', status: 'error' };
  }

  return { message: '이름은 50자 이하로 입력해주세요.', status: 'error' };
}

/**
 * Get helper message for date of birth field
 */
export function getDateOfBirthHelper(dob: string, touched: boolean): HelperResult {
  if (!touched && dob.length === 0) {
    return { message: '', status: '' };
  }

  if (isValidDateOfBirth(dob)) {
    return { message: '', status: 'success' };
  }

  if (dob.length < 10) {
    return { message: 'YYYY-MM-DD 형식으로 입력해주세요.', status: 'error' };
  }

  return { message: '유효한 생년월일을 입력해주세요.', status: 'error' };
}

/**
 * Get helper message for phone number field
 */
export function getPhoneHelper(phone: string, touched: boolean): HelperResult {
  if (!touched && phone.length === 0) {
    return { message: '', status: '' };
  }

  if (isValidKoreanPhone(phone)) {
    return { message: '', status: 'success' };
  }

  return { message: '올바른 휴대폰 번호를 입력해주세요. (010-XXXX-XXXX)', status: 'error' };
}

export function getEmailError(email: string, touched: boolean) {
  if (!touched) return '';
  return isValidEmail(email) ? '' : '유효한 이메일을 입력해주세요.';
}

export function getPasswordHelper(password: string, touched: boolean): HelperResult {
  const valid = isValidPassword(password);

  if (!touched && password.length === 0) {
    return { message: '', status: '' };
  }

  if (valid) {
    return { message: '사용 가능한 비밀번호입니다.', status: 'success' };
  }

  return { message: '8자 이상, 문자와 숫자를 포함해야 합니다.', status: 'error' };
}

export function getConfirmHelper(
  password: string,
  confirmPassword: string,
  touched: boolean
): HelperResult {
  const match = confirmPassword.length > 0 && confirmPassword === password;

  if (!touched && confirmPassword.length === 0) {
    return { message: '', status: '' };
  }

  if (match) {
    return { message: '비밀번호가 일치합니다.', status: 'success' };
  }

  return { message: '비밀번호가 일치해야 합니다.', status: 'error' };
}
