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
