/**
 * Profile Validation Utilities
 * Centralized validation logic for user profile fields
 */

export const VALIDATION_CONSTANTS = {
  MIN_AGE: 18,
  MAX_NAME_LENGTH: 100,
  MAX_HOMETOWN_LENGTH: 200,
  VIETNAM_PHONE_REGEX: /^(0|\+84)(3[2-9]|5[2689]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/,
} as const;

export interface ProfileErrors {
  fullName?: string;
  phone?: string;
  hometown?: string;
  dob?: string;
}

export function validateFullName(value: string): string | undefined {
  if (!value) return 'Họ và tên không được để trống';
  if (value.trim().length < 2) return 'Họ và tên phải có ít nhất 2 ký tự';
  if (value.trim().length > VALIDATION_CONSTANTS.MAX_NAME_LENGTH) {
    return `Họ và tên không được quá ${VALIDATION_CONSTANTS.MAX_NAME_LENGTH} ký tự`;
  }
  if (!/^[\p{L}\s]+$/u.test(value)) {
    return 'Họ và tên chỉ được chứa chữ cái và khoảng trắng';
  }
  return undefined;
}

export function validatePhone(value: string): string | undefined {
  if (!value) return undefined;
  if (!VALIDATION_CONSTANTS.VIETNAM_PHONE_REGEX.test(value)) {
    return 'Số điện thoại không đúng định dạng Việt Nam';
  }
  return undefined;
}

export function validateDOB(value: string): string | undefined {
  if (!value) return undefined;

  const birthDate = new Date(value);
  const today = new Date();

  if (birthDate > today) {
    return 'Ngày sinh không được trong tương lai';
  }

  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  const actualAge =
    monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

  if (actualAge < VALIDATION_CONSTANTS.MIN_AGE) {
    return `Bạn phải ít nhất ${VALIDATION_CONSTANTS.MIN_AGE} tuổi`;
  }

  return undefined;
}

export function validateHometown(value: string): string | undefined {
  if (value && value.length > VALIDATION_CONSTANTS.MAX_HOMETOWN_LENGTH) {
    return `Địa chỉ không được quá ${VALIDATION_CONSTANTS.MAX_HOMETOWN_LENGTH} ký tự`;
  }
  return undefined;
}

export function validateProfileForm(data: {
  fullName: string;
  phone: string;
  hometown: string;
  dob: string;
}): ProfileErrors {
  return {
    fullName: validateFullName(data.fullName),
    phone: validatePhone(data.phone),
    hometown: validateHometown(data.hometown),
    dob: validateDOB(data.dob),
  };
}

export function getMaxDateForAge(minAge: number = VALIDATION_CONSTANTS.MIN_AGE): string {
  const today = new Date();
  return new Date(
    today.getFullYear() - minAge,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split('T')[0];
}
