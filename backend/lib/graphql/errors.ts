import { GraphQLError } from 'graphql';

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
 * Create a structured GraphQL error with proper error code and extensions
 */
export function createGraphQLError(
  message: string,
  code: ErrorCode,
  field?: string,
  details?: any
): GraphQLError {
  const extensions: ErrorExtensions = {
    code,
  };
  
  if (field !== undefined) {
    extensions.field = field;
  }
  
  if (details !== undefined) {
    extensions.details = details;
  }

  return new GraphQLError(message, {
    extensions,
  });
}

/**
 * Validation error helper
 */
export function validationError(message: string, field?: string, details?: any): GraphQLError {
  return createGraphQLError(message, ErrorCode.VALIDATION_ERROR, field, details);
}

/**
 * Not found error helper
 */
export function notFoundError(message: string, details?: any): GraphQLError {
  return createGraphQLError(message, ErrorCode.NOT_FOUND, undefined, details);
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(message: string = 'Unauthorized'): GraphQLError {
  return createGraphQLError(message, ErrorCode.UNAUTHORIZED);
}

/**
 * Forbidden error helper
 */
export function forbiddenError(message: string = 'Forbidden'): GraphQLError {
  return createGraphQLError(message, ErrorCode.FORBIDDEN);
}

/**
 * Duplicate error helper
 */
export function duplicateError(message: string, field?: string, details?: any): GraphQLError {
  return createGraphQLError(message, ErrorCode.DUPLICATE_ERROR, field, details);
}

/**
 * Internal error helper
 */
export function internalError(message: string = 'Internal server error', details?: any): GraphQLError {
  return createGraphQLError(message, ErrorCode.INTERNAL_ERROR, undefined, details);
}

/**
 * Database error helper
 */
export function databaseError(message: string, details?: any): GraphQLError {
  return createGraphQLError(message, ErrorCode.DATABASE_ERROR, undefined, details);
}

/**
 * External service error helper
 */
export function externalServiceError(message: string, details?: any): GraphQLError {
  return createGraphQLError(message, ErrorCode.EXTERNAL_SERVICE_ERROR, undefined, details);
}

/**
 * Payment gateway error helper
 */
export function paymentGatewayError(message: string, details?: any): GraphQLError {
  return createGraphQLError(message, ErrorCode.PAYMENT_GATEWAY_ERROR, undefined, details);
}
