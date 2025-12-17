/**
 * UUID validation utilities
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates if a string is a valid UUID v4 format
 */
export function isValidUUID(value: string | undefined | null): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

/**
 * Validates UUID parameter from request and returns appropriate error response
 */
export function validateUUIDParam(
  param: string | undefined,
  paramName: string
): { isValid: boolean; error?: { status: number; message: string } } {
  if (!param) {
    return {
      isValid: false,
      error: { status: 400, message: `${paramName} parameter is required` },
    };
  }

  if (!isValidUUID(param)) {
    return {
      isValid: false,
      error: { status: 400, message: `Invalid ${paramName} format. Must be a valid UUID.` },
    };
  }

  return { isValid: true };
}
