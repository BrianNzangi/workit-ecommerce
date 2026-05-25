/**
 * Unit tests for mapHttpError
 *
 * Validates: Requirements 14.1, 14.2, 14.3, 14.4
 */

import {
  mapHttpError,
  ErrorCode,
  StructuredError,
} from './errors';

describe('mapHttpError', () => {
  describe('status code 400 → validationError', () => {
    it('returns a StructuredError with VALIDATION_ERROR code', () => {
      const error = { statusCode: 400, message: 'Invalid input' };
      const result = mapHttpError(error);

      expect(result).toBeInstanceOf(StructuredError);
      expect(result.extensions.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('preserves the error message from the input', () => {
      const error = { statusCode: 400, message: 'Name is required' };
      const result = mapHttpError(error);

      expect(result.message).toBe('Name is required');
    });
  });

  describe('status code 401 → unauthorizedError', () => {
    it('returns a StructuredError with UNAUTHORIZED code', () => {
      const error = { statusCode: 401, message: 'Authentication required' };
      const result = mapHttpError(error);

      expect(result).toBeInstanceOf(StructuredError);
      expect(result.extensions.code).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('preserves the error message from the input', () => {
      const error = { statusCode: 401, message: 'Token expired' };
      const result = mapHttpError(error);

      expect(result.message).toBe('Token expired');
    });
  });

  describe('status code 403 → forbiddenError', () => {
    it('returns a StructuredError with FORBIDDEN code', () => {
      const error = { statusCode: 403, message: 'Access denied' };
      const result = mapHttpError(error);

      expect(result).toBeInstanceOf(StructuredError);
      expect(result.extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('preserves the error message from the input', () => {
      const error = { statusCode: 403, message: 'Insufficient permissions' };
      const result = mapHttpError(error);

      expect(result.message).toBe('Insufficient permissions');
    });
  });

  describe('status code 404 → notFoundError', () => {
    it('returns a StructuredError with NOT_FOUND code', () => {
      const error = { statusCode: 404, message: 'Resource not found' };
      const result = mapHttpError(error);

      expect(result).toBeInstanceOf(StructuredError);
      expect(result.extensions.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('preserves the error message from the input', () => {
      const error = { statusCode: 404, message: 'Product not found' };
      const result = mapHttpError(error);

      expect(result.message).toBe('Product not found');
    });
  });

  describe('status code 500 → internalError', () => {
    it('returns a StructuredError with INTERNAL_ERROR code', () => {
      const error = { statusCode: 500, message: 'Internal server error' };
      const result = mapHttpError(error);

      expect(result).toBeInstanceOf(StructuredError);
      expect(result.extensions.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('preserves the error message from the input', () => {
      const error = { statusCode: 500, message: 'Database connection failed' };
      const result = mapHttpError(error);

      expect(result.message).toBe('Database connection failed');
    });
  });

  describe('status code 503 → internalError (5xx boundary)', () => {
    it('returns a StructuredError with INTERNAL_ERROR code for 503', () => {
      const error = { statusCode: 503, message: 'Service unavailable' };
      const result = mapHttpError(error);

      expect(result).toBeInstanceOf(StructuredError);
      expect(result.extensions.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('preserves the error message from the input', () => {
      const error = { statusCode: 503, message: 'Service temporarily unavailable' };
      const result = mapHttpError(error);

      expect(result.message).toBe('Service temporarily unavailable');
    });
  });

  describe('unknown / missing status codes → internalError', () => {
    it('defaults to INTERNAL_ERROR when statusCode is undefined', () => {
      const error = { message: 'Something went wrong' };
      const result = mapHttpError(error);

      expect(result).toBeInstanceOf(StructuredError);
      expect(result.extensions.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('defaults to INTERNAL_ERROR for an unrecognised status code (e.g. 422)', () => {
      const error = { statusCode: 422, message: 'Unprocessable entity' };
      const result = mapHttpError(error);

      expect(result).toBeInstanceOf(StructuredError);
      expect(result.extensions.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('defaults to INTERNAL_ERROR when the error is null', () => {
      const result = mapHttpError(null);

      expect(result).toBeInstanceOf(StructuredError);
      expect(result.extensions.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('defaults to INTERNAL_ERROR when the error is undefined', () => {
      const result = mapHttpError(undefined);

      expect(result).toBeInstanceOf(StructuredError);
      expect(result.extensions.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('uses a fallback message when message is missing', () => {
      const error = { statusCode: 503 };
      const result = mapHttpError(error);

      expect(result.message).toBeTruthy();
    });
  });
});
