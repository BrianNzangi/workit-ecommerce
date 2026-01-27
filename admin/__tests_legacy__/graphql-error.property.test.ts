/**
 * Feature: workit-admin-backend, Property 54: GraphQL error structure
 * Validates: Requirements 13.3
 * 
 * Property: For any GraphQL error, the response should include an errors array 
 * with errorCode and message fields
 */

import { describe, it, expect } from '@jest/globals';
import * as fc from 'fast-check';
import {
  createGraphQLError,
  validationError,
  notFoundError,
  unauthorizedError,
  forbiddenError,
  duplicateError,
  internalError,
  databaseError,
  ErrorCode,
} from '@/lib/graphql/errors';
import { GraphQLError } from 'graphql';

describe('GraphQL Error Structure Property Tests', () => {
  it('Property 54: All GraphQL errors should have proper structure with errorCode and message', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary error messages
        fc.string({ minLength: 1, maxLength: 200 }),
        // Generate arbitrary error codes from our enum
        fc.constantFrom(...Object.values(ErrorCode)),
        // Generate optional field names
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
        // Generate optional details
        fc.option(
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.record({
              key: fc.string(),
              value: fc.string(),
            })
          ),
          { nil: undefined }
        ),
        (message, code, field, details) => {
          // Create a GraphQL error using our error creation function
          const error = createGraphQLError(message, code, field, details);

          // Verify the error is a GraphQLError instance
          expect(error).toBeInstanceOf(GraphQLError);

          // Verify the error has a message
          expect(error.message).toBe(message);
          expect(typeof error.message).toBe('string');
          expect(error.message.length).toBeGreaterThan(0);

          // Verify the error has extensions
          expect(error.extensions).toBeDefined();
          expect(typeof error.extensions).toBe('object');

          // Verify the error has a code in extensions
          expect(error.extensions.code).toBe(code);
          expect(typeof error.extensions.code).toBe('string');

          // Verify optional field if provided
          if (field !== undefined) {
            expect(error.extensions.field).toBe(field);
          }

          // Verify optional details if provided
          if (details !== undefined) {
            expect(error.extensions.details).toBe(details);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 54: Validation errors should have proper structure', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
        (message, field) => {
          const error = validationError(message, field);

          expect(error).toBeInstanceOf(GraphQLError);
          expect(error.message).toBe(message);
          expect(error.extensions.code).toBe(ErrorCode.VALIDATION_ERROR);

          if (field !== undefined) {
            expect(error.extensions.field).toBe(field);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 54: Not found errors should have proper structure', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 200 }), (message) => {
        const error = notFoundError(message);

        expect(error).toBeInstanceOf(GraphQLError);
        expect(error.message).toBe(message);
        expect(error.extensions.code).toBe(ErrorCode.NOT_FOUND);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 54: Unauthorized errors should have proper structure', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
        (message) => {
          const error = message ? unauthorizedError(message) : unauthorizedError();

          expect(error).toBeInstanceOf(GraphQLError);
          expect(typeof error.message).toBe('string');
          expect(error.message.length).toBeGreaterThan(0);
          expect(error.extensions.code).toBe(ErrorCode.UNAUTHORIZED);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 54: Forbidden errors should have proper structure', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
        (message) => {
          const error = message ? forbiddenError(message) : forbiddenError();

          expect(error).toBeInstanceOf(GraphQLError);
          expect(typeof error.message).toBe('string');
          expect(error.message.length).toBeGreaterThan(0);
          expect(error.extensions.code).toBe(ErrorCode.FORBIDDEN);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 54: Duplicate errors should have proper structure', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
        (message, field) => {
          const error = duplicateError(message, field);

          expect(error).toBeInstanceOf(GraphQLError);
          expect(error.message).toBe(message);
          expect(error.extensions.code).toBe(ErrorCode.DUPLICATE_ERROR);

          if (field !== undefined) {
            expect(error.extensions.field).toBe(field);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 54: Internal errors should have proper structure', () => {
    fc.assert(
      fc.property(
        fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
        (message) => {
          const error = message ? internalError(message) : internalError();

          expect(error).toBeInstanceOf(GraphQLError);
          expect(typeof error.message).toBe('string');
          expect(error.message.length).toBeGreaterThan(0);
          expect(error.extensions.code).toBe(ErrorCode.INTERNAL_ERROR);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 54: Database errors should have proper structure', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 200 }), (message) => {
        const error = databaseError(message);

        expect(error).toBeInstanceOf(GraphQLError);
        expect(error.message).toBe(message);
        expect(error.extensions.code).toBe(ErrorCode.DATABASE_ERROR);
      }),
      { numRuns: 100 }
    );
  });

  it('Property 54: Error structure should be consistent across all error types', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.constantFrom(
          validationError,
          notFoundError,
          duplicateError,
          databaseError
        ),
        (message, errorFactory) => {
          const error = errorFactory(message);

          // All errors should have these properties
          expect(error).toBeInstanceOf(GraphQLError);
          expect(error.message).toBe(message);
          expect(error.extensions).toBeDefined();
          expect(error.extensions.code).toBeDefined();
          expect(typeof error.extensions.code).toBe('string');
          expect(error.extensions.code.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
