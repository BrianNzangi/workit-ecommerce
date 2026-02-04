// Custom error handling for Workit Admin

export enum ErrorCode {
  // Validation Errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Authentication Errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',

  // Authorization Errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Not Found Errors
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Conflict Errors
  DUPLICATE_ERROR = 'DUPLICATE_ERROR',
  CONFLICT = 'CONFLICT',

  // External Service Errors
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_GATEWAY_ERROR = 'PAYMENT_GATEWAY_ERROR',

  // Internal Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export interface ErrorExtensions {
  code: ErrorCode;
  field?: string;
  details?: any;
  [key: string]: any; // Index signature for GraphQL compatibility
}

/**
 * Custom Error class that mimics GraphQLError structure but is more robust for serialization
 */
export class StructuredError extends Error {
  public extensions: ErrorExtensions;

  constructor(message: string, extensions: ErrorExtensions) {
    super(message);
    this.name = 'StructuredError';
    // Deep serialize extensions to ensure everything is serializable (e.g. Dates -> strings)
    this.extensions = StructuredError.safeSerialize(extensions);

    // Ensure this stays as a StructuredError in older environments
    Object.setPrototypeOf(this, StructuredError.prototype);
  }

  public static safeSerialize(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (Array.isArray(obj)) {
      return obj.map(item => StructuredError.safeSerialize(item));
    }

    const serialized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        serialized[key] = StructuredError.safeSerialize(obj[key]);
      }
    }
    return serialized;
  }

  // Optional: Add a toJSON method to ensure safe serialization
  public toJSON() {
    return {
      message: this.message,
      name: this.name,
      extensions: this.extensions,
    };
  }
}

/**
 * Create a structured error with proper error code and extensions
 */
export function createGraphQLError(
  message: string,
  code: ErrorCode,
  field?: string,
  details?: any
): StructuredError {
  const extensions: ErrorExtensions = {
    code,
  };

  if (field !== undefined) {
    extensions.field = field;
  }

  if (details !== undefined) {
    extensions.details = details;
  }

  // Log for debugging
  console.log('[DEBUG] createStructuredError - message:', String(message));
  console.log('[DEBUG] createStructuredError - code:', code);
  console.log('[DEBUG] createStructuredError - extensions before serialize:', extensions);

  // Pre-serialize extensions to ensure all values are safe BEFORE creating the error
  const safeExtensions = StructuredError.safeSerialize(extensions) as ErrorExtensions;

  console.log('[DEBUG] createStructuredError - extensions after serialize:', safeExtensions);

  return new StructuredError(String(message), safeExtensions);
}

/**
 * Validation error helper
 */
export function validationError(message: string, field?: string, details?: any): StructuredError {
  return createGraphQLError(message, ErrorCode.VALIDATION_ERROR, field, details);
}

/**
 * Not found error helper
 */
export function notFoundError(message: string, details?: any): StructuredError {
  return createGraphQLError(message, ErrorCode.NOT_FOUND, undefined, details);
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(message: string = 'Unauthorized'): StructuredError {
  return createGraphQLError(message, ErrorCode.UNAUTHORIZED);
}

/**
 * Forbidden error helper
 */
export function forbiddenError(message: string = 'Forbidden'): StructuredError {
  return createGraphQLError(message, ErrorCode.FORBIDDEN);
}

/**
 * Duplicate error helper
 */
export function duplicateError(message: string, field?: string, details?: any): StructuredError {
  return createGraphQLError(message, ErrorCode.DUPLICATE_ERROR, field, details);
}

/**
 * Internal error helper
 */
export function internalError(message: string = 'Internal server error', details?: any): StructuredError {
  return createGraphQLError(message, ErrorCode.INTERNAL_ERROR, undefined, details);
}

/**
 * Database error helper
 */
export function databaseError(message: string, details?: any): StructuredError {
  return createGraphQLError(message, ErrorCode.DATABASE_ERROR, undefined, details);
}

/**
 * External service error helper
 */
export function externalServiceError(message: string, details?: any): StructuredError {
  return createGraphQLError(message, ErrorCode.EXTERNAL_SERVICE_ERROR, undefined, details);
}

/**
 * Payment gateway error helper
 */
export function paymentGatewayError(message: string, details?: any): StructuredError {
  return createGraphQLError(message, ErrorCode.PAYMENT_GATEWAY_ERROR, undefined, details);
}
