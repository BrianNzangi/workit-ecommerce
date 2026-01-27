import * as fc from 'fast-check';
import {
  validateRequiredFields,
  validateEmail,
  validatePrice,
  generateSlug,
  validateSlugFormat,
  ensureUniqueSlug,
  validateForeignKey,
  validateNonNegative,
  validateNonEmptyString,
} from '@/lib/validation';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ErrorCode } from '@/lib/graphql/errors';

// Feature: workit-admin-backend, Property 57: Required field validation
// Validates: Requirements 14.1
// For any mutation with missing required fields, the system should reject the request with a validation error

// Feature: workit-admin-backend, Property 58: Email format validation
// Validates: Requirements 14.2
// For any email input, invalid email formats should be rejected with a validation error

// Feature: workit-admin-backend, Property 59: Price positivity validation
// Validates: Requirements 14.3
// For any price input, negative or zero values should be rejected with a validation error

// Feature: workit-admin-backend, Property 60: Slug uniqueness and URL safety
// Validates: Requirements 14.4
// For any generated slug, it should be URL-safe (containing only lowercase letters, numbers, and hyphens) 
// and unique within its entity type

// Feature: workit-admin-backend, Property 61: Foreign key referential integrity
// Validates: Requirements 14.5
// For any mutation creating a relationship, if the referenced record does not exist, 
// the system should reject the request with a referential integrity error

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

describe('Data Validation Properties', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.product.deleteMany({});
    await prisma.collection.deleteMany({});
  });

  describe('Property 57: Required field validation', () => {
    it('should reject objects with missing required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate an object with some fields
          fc.record({
            name: fc.option(fc.string(), { nil: undefined }),
            email: fc.option(fc.string(), { nil: undefined }),
            price: fc.option(fc.integer(), { nil: undefined }),
            description: fc.option(fc.string(), { nil: undefined }),
          }),
          // Generate a list of required fields
          fc.subarray(['name', 'email', 'price'], { minLength: 1, maxLength: 3 }),
          async (data, requiredFields) => {
            // Check if any required field is missing or empty string
            const hasMissingField = requiredFields.some(field => {
              const value = data[field as keyof typeof data];
              return value === undefined || 
                     value === null || 
                     (typeof value === 'string' && value.trim().length === 0);
            });

            if (hasMissingField) {
              // Should throw validation error
              try {
                validateRequiredFields(data, requiredFields);
                // If we get here, the validation didn't throw when it should have
                return false;
              } catch (error: any) {
                // Verify it's a validation error with correct code
                return error.extensions?.code === ErrorCode.VALIDATION_ERROR;
              }
            } else {
              // Should not throw
              try {
                validateRequiredFields(data, requiredFields);
                return true;
              } catch (error) {
                // Validation threw when it shouldn't have
                return false;
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject objects with empty string values for required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate strings that are empty or only whitespace
          fc.string().filter(s => s.trim().length === 0),
          fc.constantFrom('name', 'email', 'description'),
          async (emptyValue, fieldName) => {
            const data = { [fieldName]: emptyValue };
            
            try {
              validateRequiredFields(data, [fieldName]);
              // Should have thrown
              return false;
            } catch (error: any) {
              // Verify it's a validation error
              return error.extensions?.code === ErrorCode.VALIDATION_ERROR &&
                     error.extensions?.field === fieldName;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 58: Email format validation', () => {
    it('should reject invalid email formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate invalid emails
          fc.oneof(
            fc.string().filter(s => !s.includes('@') && s.length > 0), // No @ symbol
            fc.constant(''), // Empty string
            fc.constant('   '), // Whitespace only
            fc.constant('@example.com'), // Missing local part
            fc.constant('user@'), // Missing domain
            fc.constant('user @example.com'), // Space in email
            fc.constant('user..name@example.com'), // Double dots
            fc.constant('user@.com'), // Domain starts with dot
            fc.constant('user@domain'), // No TLD
          ),
          async (invalidEmail) => {
            try {
              validateEmail(invalidEmail);
              // Should have thrown
              return false;
            } catch (error: any) {
              // Verify it's a validation error
              return error.extensions?.code === ErrorCode.VALIDATION_ERROR;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid email formats', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate valid emails
          fc.emailAddress(),
          async (validEmail) => {
            try {
              validateEmail(validEmail);
              return true;
            } catch (error) {
              // Should not have thrown
              return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 59: Price positivity validation', () => {
    it('should reject negative and zero prices', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate non-positive numbers
          fc.oneof(
            fc.integer({ max: 0 }), // Zero or negative
            fc.constant(0),
            fc.integer({ max: -1 }), // Negative
          ),
          async (invalidPrice) => {
            try {
              validatePrice(invalidPrice);
              // Should have thrown
              return false;
            } catch (error: any) {
              // Verify it's a validation error
              return error.extensions?.code === ErrorCode.VALIDATION_ERROR;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept positive prices', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate positive numbers
          fc.integer({ min: 1, max: 1000000 }),
          async (validPrice) => {
            try {
              validatePrice(validPrice);
              return true;
            } catch (error) {
              // Should not have thrown
              return false;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 60: Slug uniqueness and URL safety', () => {
    it('should generate URL-safe slugs from any text', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate various text inputs
          fc.string({ minLength: 1, maxLength: 200 }),
          async (text) => {
            const slug = generateSlug(text);
            
            // Slug should match the URL-safe pattern
            const urlSafePattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
            
            // Generated slug should be URL-safe
            return urlSafePattern.test(slug);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-URL-safe slugs', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate invalid slugs
          fc.oneof(
            fc.string().filter(s => /[A-Z]/.test(s)), // Contains uppercase
            fc.string().filter(s => /[^a-z0-9-]/.test(s) && s.length > 0), // Contains invalid chars
            fc.constant('slug-'), // Ends with hyphen
            fc.constant('-slug'), // Starts with hyphen
            fc.constant('slug--name'), // Double hyphen
          ),
          async (invalidSlug) => {
            try {
              validateSlugFormat(invalidSlug);
              // Should have thrown
              return false;
            } catch (error: any) {
              // Verify it's a validation error
              return error.extensions?.code === ErrorCode.VALIDATION_ERROR;
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should ensure slug uniqueness within a table', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a base slug
          fc.string({ minLength: 1, maxLength: 50 })
            .map(s => s.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))
            .filter(s => s.length > 0),
          async (baseSlug) => {
            // Clean up before each property test run
            await prisma.product.deleteMany({
              where: {
                slug: {
                  startsWith: baseSlug,
                },
              },
            });

            // Create a product with this slug
            const product1 = await prisma.product.create({
              data: {
                name: 'Test Product 1',
                slug: baseSlug,
              },
            });

            // Try to ensure uniqueness for the same slug
            const uniqueSlug = await ensureUniqueSlug(prisma, 'product', baseSlug);

            // Clean up after this run
            await prisma.product.deleteMany({
              where: {
                slug: {
                  startsWith: baseSlug,
                },
              },
            });

            // The unique slug should be different from the base slug
            return uniqueSlug !== baseSlug && uniqueSlug.startsWith(baseSlug);
          }
        ),
        { numRuns: 50 } // Reduced runs due to database operations
      );
    });
  });

  describe('Property 61: Foreign key referential integrity', () => {
    it('should reject references to non-existent records', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate a random UUID that doesn't exist
          fc.uuid(),
          async (nonExistentId) => {
            try {
              await validateForeignKey(prisma, 'product', nonExistentId, 'productId');
              // Should have thrown
              return false;
            } catch (error: any) {
              // Verify it's a validation error
              return error.extensions?.code === ErrorCode.VALIDATION_ERROR;
            }
          }
        ),
        { numRuns: 50 } // Reduced runs due to database operations
      );
    });

    it('should accept references to existing records', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate product data
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          async (productName) => {
            // Create a product
            const product = await prisma.product.create({
              data: {
                name: productName,
                slug: `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              },
            });

            try {
              // Validate the foreign key
              await validateForeignKey(prisma, 'product', product.id, 'productId');
              return true;
            } catch (error) {
              // Should not have thrown
              return false;
            }
          }
        ),
        { numRuns: 50 } // Reduced runs due to database operations
      );
    });
  });
});
