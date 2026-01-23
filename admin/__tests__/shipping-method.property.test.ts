/**
 * Shipping Method Property-Based Tests
 * Feature: workit-admin-backend
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { ShippingMethodService } from '@/lib/services/shipping-method.service';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Arbitraries for generating test data
const codeArbitrary = fc
  .stringMatching(/^[a-z0-9]+$/)
  .filter(s => s.length >= 3 && s.length <= 20);

const nameArbitrary = fc
  .string({ minLength: 3, maxLength: 50 })
  .filter(s => s.trim().length >= 3);

const descriptionArbitrary = fc.option(
  fc.string({ minLength: 5, maxLength: 200 }),
  { nil: undefined }
);

const priceArbitrary = fc.integer({ min: 0, max: 100000 }); // Price in cents

const enabledArbitrary = fc.boolean();

describe('Shipping Method Property Tests', () => {
  let shippingMethodService: ShippingMethodService;

  beforeAll(async () => {
    await prisma.$connect();
    shippingMethodService = new ShippingMethodService(prisma);
  });

  afterAll(async () => {
    // Clean up all test data before disconnecting
    await prisma.shippingMethod.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      await prisma.shippingMethod.deleteMany({});
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  /**
   * Property 50: Shipping method creation persistence
   * Validates: Requirements 12.1
   * 
   * For any valid shipping method data (name, description, price), 
   * creating a shipping method should store all fields
   */
  describe('Property 50: Shipping method creation persistence', () => {
    it(
      'should persist all shipping method fields',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            codeArbitrary,
            nameArbitrary,
            descriptionArbitrary,
            priceArbitrary,
            enabledArbitrary,
            async (code, name, description, price, enabled) => {
              // Make code unique by adding timestamp
              const uniqueCode = `${code}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
              
              // Create a shipping method
              const shippingMethod = await shippingMethodService.createShippingMethod({
                code: uniqueCode,
                name,
                description,
                price,
                enabled,
              });

              // Verify all fields are persisted (note: service trims strings)
              const trimmedName = name.trim();
              const trimmedDescription = description?.trim() || null;
              
              expect(shippingMethod.id).toBeDefined();
              expect(shippingMethod.code).toBe(uniqueCode);
              expect(shippingMethod.name).toBe(trimmedName);
              expect(shippingMethod.description).toBe(trimmedDescription);
              expect(shippingMethod.price).toBe(price);
              expect(shippingMethod.enabled).toBe(enabled);
              expect(shippingMethod.createdAt).toBeInstanceOf(Date);
              expect(shippingMethod.updatedAt).toBeInstanceOf(Date);

              // Verify shipping method can be retrieved from database
              const retrievedMethod = await prisma.shippingMethod.findUnique({
                where: { id: shippingMethod.id },
              });

              expect(retrievedMethod).not.toBeNull();
              expect(retrievedMethod?.code).toBe(uniqueCode);
              expect(retrievedMethod?.name).toBe(trimmedName);
              expect(retrievedMethod?.description).toBe(trimmedDescription);
              expect(retrievedMethod?.price).toBe(price);
              expect(retrievedMethod?.enabled).toBe(enabled);

              // Clean up
              try {
                await prisma.shippingMethod.delete({
                  where: { id: shippingMethod.id },
                });
              } catch (error) {
                // Ignore if already deleted
              }
            }
          ),
          { numRuns: 100 }
        );
      },
      30000 // 30 second timeout
    );

    it(
      'should default enabled to true when not specified',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            codeArbitrary,
            nameArbitrary,
            descriptionArbitrary,
            priceArbitrary,
            async (code, name, description, price) => {
              // Make code unique by adding timestamp
              const uniqueCode = `${code}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
              
              // Create a shipping method without specifying enabled
              const shippingMethod = await shippingMethodService.createShippingMethod({
                code: uniqueCode,
                name,
                description,
                price,
              });

              // Verify enabled defaults to true
              expect(shippingMethod.enabled).toBe(true);

              // Clean up
              try {
                await prisma.shippingMethod.delete({
                  where: { id: shippingMethod.id },
                });
              } catch (error) {
                // Ignore if already deleted
              }
            }
          ),
          { numRuns: 100 }
        );
      },
      30000 // 30 second timeout
    );

    it(
      'should reject duplicate codes',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            codeArbitrary,
            nameArbitrary,
            nameArbitrary,
            priceArbitrary,
            priceArbitrary,
            async (code, name1, name2, price1, price2) => {
              // Make code unique by adding timestamp
              const uniqueCode = `${code}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
              
              // Create first shipping method
              const method1 = await shippingMethodService.createShippingMethod({
                code: uniqueCode,
                name: name1,
                price: price1,
              });

              expect(method1.code).toBe(uniqueCode);

              // Attempt to create second shipping method with same code should fail
              await expect(
                shippingMethodService.createShippingMethod({
                  code: uniqueCode,
                  name: name2,
                  price: price2,
                })
              ).rejects.toThrow('A shipping method with this code already exists');

              // Clean up
              try {
                await prisma.shippingMethod.delete({
                  where: { id: method1.id },
                });
              } catch (error) {
                // Ignore if already deleted
              }
            }
          ),
          { numRuns: 100 }
        );
      },
      30000 // 30 second timeout
    );

    it(
      'should reject negative prices',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            codeArbitrary,
            nameArbitrary,
            fc.integer({ min: -100000, max: -1 }),
            async (code, name, negativePrice) => {
              // Attempt to create with negative price should fail
              await expect(
                shippingMethodService.createShippingMethod({
                  code,
                  name,
                  price: negativePrice,
                })
              ).rejects.toThrow('Shipping method price must be positive or zero');
            }
          ),
          { numRuns: 100 }
        );
      },
      15000 // 15 second timeout
    );

    it(
      'should reject empty code',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            nameArbitrary,
            priceArbitrary,
            async (name, price) => {
              // Attempt to create with empty code should fail
              await expect(
                shippingMethodService.createShippingMethod({
                  code: '',
                  name,
                  price,
                })
              ).rejects.toThrow('Shipping method code is required');
            }
          ),
          { numRuns: 100 }
        );
      },
      15000 // 15 second timeout
    );

    it(
      'should reject empty name',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            codeArbitrary,
            priceArbitrary,
            async (code, price) => {
              // Attempt to create with empty name should fail
              await expect(
                shippingMethodService.createShippingMethod({
                  code,
                  name: '',
                  price,
                })
              ).rejects.toThrow('Shipping method name is required');
            }
          ),
          { numRuns: 100 }
        );
      },
      15000 // 15 second timeout
    );

    it(
      'should allow zero price (free shipping)',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            codeArbitrary,
            nameArbitrary,
            async (code, name) => {
              // Make code unique by adding timestamp
              const uniqueCode = `${code}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
              
              // Create a shipping method with zero price
              const shippingMethod = await shippingMethodService.createShippingMethod({
                code: uniqueCode,
                name,
                price: 0,
              });

              // Verify price is zero
              expect(shippingMethod.price).toBe(0);

              // Clean up
              try {
                await prisma.shippingMethod.delete({
                  where: { id: shippingMethod.id },
                });
              } catch (error) {
                // Ignore if already deleted
              }
            }
          ),
          { numRuns: 100 }
        );
      },
      30000 // 30 second timeout
    );
  });

  /**
   * Property 51: Shipping method enabled filtering
   * Validates: Requirements 12.2
   * 
   * For any set of shipping methods with mixed enabled status, 
   * customer queries should return only methods where enabled is true
   */
  describe('Property 51: Shipping method enabled filtering', () => {
    it(
      'should return only enabled methods when enabledOnly is true',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.array(
              fc.record({
                code: codeArbitrary,
                name: nameArbitrary,
                price: priceArbitrary,
                enabled: enabledArbitrary,
              }),
              { minLength: 2, maxLength: 10 }
            ),
            async (methodsData) => {
              // Ensure unique codes
              const uniqueMethodsData = Array.from(
                new Map(methodsData.map(m => [m.code, m])).values()
              );

              // Skip if we don't have at least 2 unique methods
              fc.pre(uniqueMethodsData.length >= 2);

              // Create shipping methods
              const createdMethods = [];
              for (const data of uniqueMethodsData) {
                const method = await shippingMethodService.createShippingMethod(data);
                createdMethods.push(method);
              }

              // Query with enabledOnly = true
              const enabledMethods = await shippingMethodService.getShippingMethods({
                enabledOnly: true,
              });

              // Verify all returned methods are enabled
              for (const method of enabledMethods) {
                expect(method.enabled).toBe(true);
              }

              // Verify all enabled methods are returned
              const expectedEnabledCount = createdMethods.filter(m => m.enabled).length;
              expect(enabledMethods.length).toBe(expectedEnabledCount);

              // Query with enabledOnly = false (should return all)
              const allMethods = await shippingMethodService.getShippingMethods({
                enabledOnly: false,
              });

              // Verify all methods are returned
              expect(allMethods.length).toBe(createdMethods.length);

              // Clean up
              try {
                await prisma.shippingMethod.deleteMany({
                  where: {
                    id: { in: createdMethods.map(m => m.id) },
                  },
                });
              } catch (error) {
                // Ignore if already deleted
              }
            }
          ),
          { numRuns: 100 }
        );
      },
      30000 // 30 second timeout
    );

    it(
      'should return all methods when enabledOnly is not specified',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.array(
              fc.record({
                code: codeArbitrary,
                name: nameArbitrary,
                price: priceArbitrary,
                enabled: enabledArbitrary,
              }),
              { minLength: 2, maxLength: 10 }
            ),
            async (methodsData) => {
              // Ensure unique codes
              const uniqueMethodsData = Array.from(
                new Map(methodsData.map(m => [m.code, m])).values()
              );

              // Skip if we don't have at least 2 unique methods
              fc.pre(uniqueMethodsData.length >= 2);

              // Create shipping methods
              const createdMethods = [];
              for (const data of uniqueMethodsData) {
                const method = await shippingMethodService.createShippingMethod(data);
                createdMethods.push(method);
              }

              // Query without specifying enabledOnly (defaults to false)
              const allMethods = await shippingMethodService.getShippingMethods();

              // Verify all methods are returned
              expect(allMethods.length).toBe(createdMethods.length);

              // Clean up
              try {
                await prisma.shippingMethod.deleteMany({
                  where: {
                    id: { in: createdMethods.map(m => m.id) },
                  },
                });
              } catch (error) {
                // Ignore if already deleted
              }
            }
          ),
          { numRuns: 100 }
        );
      },
      30000 // 30 second timeout
    );

    it(
      'should filter correctly with mixed enabled/disabled methods',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 1, max: 5 }),
            fc.integer({ min: 1, max: 5 }),
            async (enabledCount, disabledCount) => {
              // Create enabled methods
              const enabledMethods = [];
              for (let i = 0; i < enabledCount; i++) {
                const method = await shippingMethodService.createShippingMethod({
                  code: `enabled-${Date.now()}-${i}`,
                  name: `Enabled Method ${i}`,
                  price: 1000,
                  enabled: true,
                });
                enabledMethods.push(method);
              }

              // Create disabled methods
              const disabledMethods = [];
              for (let i = 0; i < disabledCount; i++) {
                const method = await shippingMethodService.createShippingMethod({
                  code: `disabled-${Date.now()}-${i}`,
                  name: `Disabled Method ${i}`,
                  price: 1000,
                  enabled: false,
                });
                disabledMethods.push(method);
              }

              // Query with enabledOnly = true
              const filteredMethods = await shippingMethodService.getShippingMethods({
                enabledOnly: true,
              });

              // Verify only enabled methods are returned
              expect(filteredMethods.length).toBe(enabledCount);
              for (const method of filteredMethods) {
                expect(method.enabled).toBe(true);
              }

              // Verify no disabled methods are in the results
              const disabledIds = disabledMethods.map(m => m.id);
              for (const method of filteredMethods) {
                expect(disabledIds).not.toContain(method.id);
              }

              // Clean up
              try {
                await prisma.shippingMethod.deleteMany({
                  where: {
                    id: {
                      in: [...enabledMethods, ...disabledMethods].map(m => m.id),
                    },
                  },
                });
              } catch (error) {
                // Ignore if already deleted
              }
            }
          ),
          { numRuns: 100 }
        );
      },
      30000 // 30 second timeout
    );
  });
});
