/**
 * Customer Management Property-Based Tests
 * Feature: workit-admin-backend
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fc from 'fast-check';
import { CustomerService } from '@/lib/services/customer.service';
import { OrderService } from '@/lib/services/order.service';
import { ProductService } from '@/lib/services/product.service';
import bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: ['error'],
});

// Arbitraries for generating test data
const emailArbitrary = fc
  .tuple(
    fc.stringMatching(/^[a-z0-9]+$/),
    fc.stringMatching(/^[a-z0-9]+$/),
    fc.constantFrom('com', 'org', 'net', 'io')
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

const passwordArbitrary = fc
  .string({ minLength: 8, maxLength: 50 })
  .filter((s) => s.trim().length >= 8);

const nameArbitrary = fc
  .string({ minLength: 1, maxLength: 50 })
  .filter((s) => s.trim().length >= 1);

const phoneArbitrary = fc
  .tuple(
    fc.constantFrom('+254', '+1', '+44'),
    fc.stringMatching(/^[0-9]{9,10}$/)
  )
  .map(([code, number]) => `${code}${number}`);

const addressArbitrary = fc.record({
  fullName: nameArbitrary,
  streetLine1: fc.string({ minLength: 5, maxLength: 100 }),
  streetLine2: fc.option(fc.string({ minLength: 5, maxLength: 100 }), { nil: undefined }),
  city: fc.string({ minLength: 2, maxLength: 50 }),
  province: fc.string({ minLength: 2, maxLength: 50 }),
  postalCode: fc.stringMatching(/^[0-9]{5}$/),
  country: fc.constantFrom('KE', 'US', 'GB'),
  phoneNumber: phoneArbitrary,
});

describe('Customer Management Property Tests', () => {
  let customerService: CustomerService;
  let orderService: OrderService;
  let productService: ProductService;

  beforeAll(async () => {
    await prisma.$connect();
    customerService = new CustomerService(prisma);
    orderService = new OrderService(prisma);
    productService = new ProductService(prisma);
  });

  afterAll(async () => {
    // Clean up all test data before disconnecting
    await prisma.orderLine.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up after each test
    try {
      await prisma.orderLine.deleteMany({});
      await prisma.order.deleteMany({});
      await prisma.address.deleteMany({});
      await prisma.customer.deleteMany({});
      await prisma.productVariant.deleteMany({});
      await prisma.product.deleteMany({});
    } catch (error) {
      // Ignore errors during cleanup
    }
  });

  /**
   * Property 19: Customer registration data persistence
   * Validates: Requirements 4.1
   * 
   * For any valid registration data (email, password, firstName, lastName), 
   * registering a customer should create a record with all fields stored and 
   * password properly hashed
   */
  describe('Property 19: Customer registration data persistence', () => {
    it(
      'should persist all registration data with hashed password',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.option(phoneArbitrary, { nil: undefined }),
            async (email, password, firstName, lastName, phoneNumber) => {
              // Register a customer
              const customer = await customerService.registerCustomer({
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
              });

              // Verify all fields are persisted
              expect(customer.id).toBeDefined();
              expect(customer.email).toBe(email);
              expect(customer.firstName).toBe(firstName);
              expect(customer.lastName).toBe(lastName);
              expect(customer.phoneNumber).toBe(phoneNumber || null);
              expect(customer.enabled).toBe(true);
              expect(customer.createdAt).toBeInstanceOf(Date);
              expect(customer.updatedAt).toBeInstanceOf(Date);

              // Verify password is hashed (not stored in plain text)
              expect(customer.passwordHash).toBeDefined();
              expect(customer.passwordHash).not.toBe(password);
              expect(customer.passwordHash.length).toBeGreaterThan(password.length);

              // Verify password hash is valid
              const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);
              expect(isPasswordValid).toBe(true);

              // Verify customer can be retrieved from database
              const retrievedCustomer = await prisma.customer.findUnique({
                where: { id: customer.id },
              });

              expect(retrievedCustomer).not.toBeNull();
              expect(retrievedCustomer?.email).toBe(email);
              expect(retrievedCustomer?.firstName).toBe(firstName);
              expect(retrievedCustomer?.lastName).toBe(lastName);
              expect(retrievedCustomer?.phoneNumber).toBe(phoneNumber || null);

              // Clean up
              try {
                await prisma.customer.delete({
                  where: { id: customer.id },
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
      'should reject duplicate email addresses',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            emailArbitrary,
            passwordArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            nameArbitrary,
            nameArbitrary,
            async (email, password1, password2, firstName1, lastName1, firstName2, lastName2) => {
              // Register first customer
              const customer1 = await customerService.registerCustomer({
                email,
                password: password1,
                firstName: firstName1,
                lastName: lastName1,
              });

              expect(customer1.email).toBe(email);

              // Attempt to register second customer with same email should fail
              await expect(
                customerService.registerCustomer({
                  email,
                  password: password2,
                  firstName: firstName2,
                  lastName: lastName2,
                })
              ).rejects.toThrow('Customer with this email already exists');

              // Clean up
              try {
                await prisma.customer.delete({
                  where: { id: customer1.id },
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
      'should reject invalid email formats',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('@')),
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            async (invalidEmail, password, firstName, lastName) => {
              // Attempt to register with invalid email should fail
              await expect(
                customerService.registerCustomer({
                  email: invalidEmail,
                  password,
                  firstName,
                  lastName,
                })
              ).rejects.toThrow('Invalid email format');
            }
          ),
          { numRuns: 100 }
        );
      },
      15000 // 15 second timeout
    );

    it(
      'should reject passwords shorter than 8 characters',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            emailArbitrary,
            fc.string({ minLength: 1, maxLength: 7 }),
            nameArbitrary.filter(s => s.trim().length > 0),
            nameArbitrary.filter(s => s.trim().length > 0),
            async (email, shortPassword, firstName, lastName) => {
              // Attempt to register with short password should fail
              await expect(
                customerService.registerCustomer({
                  email,
                  password: shortPassword,
                  firstName,
                  lastName,
                })
              ).rejects.toThrow('Password must be at least 8 characters');
            }
          ),
          { numRuns: 100 }
        );
      },
      15000 // 15 second timeout
    );
  });

  /**
   * Property 20: Customer search multi-field matching
   * Validates: Requirements 4.3
   * 
   * For any search term that matches a customer's name, email, or phone number, 
   * the search results should include that customer
   */
  describe('Property 20: Customer search multi-field matching', () => {
    it(
      'should find customers by firstName',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 0, max: 1000000 }),
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.option(phoneArbitrary, { nil: undefined }),
            async (uniqueId, password, firstName, lastName, phoneNumber) => {
              // Skip if names are too short, empty, or contain problematic characters for search
              const trimmedFirstName = firstName.trim();
              const trimmedLastName = lastName.trim();
              fc.pre(
                trimmedFirstName.length >= 3 && 
                trimmedLastName.length > 0 &&
                !/[\\%_]/.test(trimmedFirstName) // Skip names with SQL wildcards or backslashes
              );

              // Use timestamp + unique ID to ensure unique email
              const email = `test-${Date.now()}-${uniqueId}@example.com`;

              // Register a customer
              const customer = await customerService.registerCustomer({
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
              });

              // Search by firstName (use substring to test partial matching)
              const searchTerm = trimmedFirstName.substring(0, Math.max(3, Math.floor(trimmedFirstName.length / 2)));
              const results = await customerService.searchCustomers(searchTerm);

              // Verify customer is in results
              const found = results.some(c => c.id === customer.id);
              expect(found).toBe(true);

              // Clean up
              try {
                await prisma.customer.delete({
                  where: { id: customer.id },
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
      'should find customers by lastName',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.integer({ min: 0, max: 1000000 }),
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.option(phoneArbitrary, { nil: undefined }),
            async (uniqueId, password, firstName, lastName, phoneNumber) => {
              // Skip if names are too short, empty, or contain problematic characters for search
              const trimmedFirstName = firstName.trim();
              const trimmedLastName = lastName.trim();
              fc.pre(
                trimmedFirstName.length > 0 && 
                trimmedLastName.length >= 3 &&
                !/[\\%_]/.test(trimmedLastName) // Skip names with SQL wildcards or backslashes
              );

              // Use timestamp + unique ID to ensure unique email
              const email = `test-${Date.now()}-${uniqueId}@example.com`;

              // Register a customer
              const customer = await customerService.registerCustomer({
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
              });

              // Search by lastName (use substring to test partial matching)
              const searchTerm = trimmedLastName.substring(0, Math.max(3, Math.floor(trimmedLastName.length / 2)));
              const results = await customerService.searchCustomers(searchTerm);

              // Verify customer is in results
              const found = results.some(c => c.id === customer.id);
              expect(found).toBe(true);

              // Clean up
              try {
                await prisma.customer.delete({
                  where: { id: customer.id },
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
      'should find customers by email',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            async (email, password, firstName, lastName) => {
              // Register a customer
              const customer = await customerService.registerCustomer({
                email,
                password,
                firstName,
                lastName,
              });

              // Search by email (use local part before @)
              const searchTerm = email.split('@')[0];
              const results = await customerService.searchCustomers(searchTerm);

              // Verify customer is in results
              const found = results.some(c => c.id === customer.id);
              expect(found).toBe(true);

              // Clean up
              try {
                await prisma.customer.delete({
                  where: { id: customer.id },
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
      'should find customers by phone number',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            phoneArbitrary,
            async (email, password, firstName, lastName, phoneNumber) => {
              // Register a customer with phone number
              const customer = await customerService.registerCustomer({
                email,
                password,
                firstName,
                lastName,
                phoneNumber,
              });

              // Search by phone number (use last 4 digits)
              const searchTerm = phoneNumber.slice(-4);
              const results = await customerService.searchCustomers(searchTerm);

              // Verify customer is in results
              const found = results.some(c => c.id === customer.id);
              expect(found).toBe(true);

              // Clean up
              try {
                await prisma.customer.delete({
                  where: { id: customer.id },
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
   * Property 21: Customer address update completeness
   * Validates: Requirements 4.4
   * 
   * For any customer and valid address data, updating the billing address should 
   * store all required fields (fullName, streetLine1, city, province, postalCode, 
   * country, phoneNumber)
   */
  describe('Property 21: Customer address update completeness', () => {
    it(
      'should store all required address fields',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            addressArbitrary,
            async (email, password, firstName, lastName, addressData) => {
              // Register a customer
              const customer = await customerService.registerCustomer({
                email,
                password,
                firstName,
                lastName,
              });

              // Create an address for the customer
              const address = await customerService.createAddress({
                customerId: customer.id,
                ...addressData,
              });

              // Verify all required fields are stored
              expect(address.id).toBeDefined();
              expect(address.customerId).toBe(customer.id);
              expect(address.fullName).toBe(addressData.fullName);
              expect(address.streetLine1).toBe(addressData.streetLine1);
              expect(address.streetLine2).toBe(addressData.streetLine2 || null);
              expect(address.city).toBe(addressData.city);
              expect(address.province).toBe(addressData.province);
              expect(address.postalCode).toBe(addressData.postalCode);
              expect(address.country).toBe(addressData.country);
              expect(address.phoneNumber).toBe(addressData.phoneNumber);

              // Verify address can be retrieved from database
              const retrievedAddress = await prisma.address.findUnique({
                where: { id: address.id },
              });

              expect(retrievedAddress).not.toBeNull();
              expect(retrievedAddress?.fullName).toBe(addressData.fullName);
              expect(retrievedAddress?.streetLine1).toBe(addressData.streetLine1);
              expect(retrievedAddress?.city).toBe(addressData.city);
              expect(retrievedAddress?.province).toBe(addressData.province);
              expect(retrievedAddress?.postalCode).toBe(addressData.postalCode);
              expect(retrievedAddress?.country).toBe(addressData.country);
              expect(retrievedAddress?.phoneNumber).toBe(addressData.phoneNumber);

              // Clean up
              try {
                await prisma.address.delete({
                  where: { id: address.id },
                });
                await prisma.customer.delete({
                  where: { id: customer.id },
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
      'should update existing addresses with all fields',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            addressArbitrary,
            addressArbitrary,
            async (uuid, password, firstName, lastName, addressData1, addressData2) => {
              // Skip if names are empty
              fc.pre(firstName.trim().length > 0 && lastName.trim().length > 0);

              // Use UUID to ensure unique email
              const email = `test-${uuid}@example.com`;

              // Register a customer
              const customer = await customerService.registerCustomer({
                email,
                password,
                firstName,
                lastName,
              });

              // Create initial address
              const address = await customerService.createAddress({
                customerId: customer.id,
                ...addressData1,
              });

              // Update the address with new data
              const updatedAddress = await customerService.updateAddress(address.id, addressData2);

              // Verify all fields are updated
              expect(updatedAddress.id).toBe(address.id);
              expect(updatedAddress.fullName).toBe(addressData2.fullName);
              expect(updatedAddress.streetLine1).toBe(addressData2.streetLine1);
              expect(updatedAddress.streetLine2).toBe(addressData2.streetLine2 || null);
              expect(updatedAddress.city).toBe(addressData2.city);
              expect(updatedAddress.province).toBe(addressData2.province);
              expect(updatedAddress.postalCode).toBe(addressData2.postalCode);
              expect(updatedAddress.country).toBe(addressData2.country);
              expect(updatedAddress.phoneNumber).toBe(addressData2.phoneNumber);

              // Verify updated address in database
              const retrievedAddress = await prisma.address.findUnique({
                where: { id: address.id },
              });

              expect(retrievedAddress).not.toBeNull();
              expect(retrievedAddress?.fullName).toBe(addressData2.fullName);
              expect(retrievedAddress?.streetLine1).toBe(addressData2.streetLine1);
              expect(retrievedAddress?.city).toBe(addressData2.city);
              expect(retrievedAddress?.province).toBe(addressData2.province);
              expect(retrievedAddress?.postalCode).toBe(addressData2.postalCode);
              expect(retrievedAddress?.country).toBe(addressData2.country);
              expect(retrievedAddress?.phoneNumber).toBe(addressData2.phoneNumber);

              // Clean up
              try {
                await prisma.address.delete({
                  where: { id: address.id },
                });
                await prisma.customer.delete({
                  where: { id: customer.id },
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
      'should handle default shipping and billing flags',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            emailArbitrary,
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            addressArbitrary,
            addressArbitrary,
            fc.boolean(),
            fc.boolean(),
            async (email, password, firstName, lastName, addressData1, addressData2, defaultShipping, defaultBilling) => {
              // Register a customer
              const customer = await customerService.registerCustomer({
                email,
                password,
                firstName,
                lastName,
              });

              // Create first address with default flags
              const address1 = await customerService.createAddress({
                customerId: customer.id,
                ...addressData1,
                defaultShipping: true,
                defaultBilling: true,
              });

              expect(address1.defaultShipping).toBe(true);
              expect(address1.defaultBilling).toBe(true);

              // Create second address with potentially different default flags
              const address2 = await customerService.createAddress({
                customerId: customer.id,
                ...addressData2,
                defaultShipping,
                defaultBilling,
              });

              // If second address is set as default, first should no longer be default
              if (defaultShipping) {
                const updatedAddress1 = await prisma.address.findUnique({
                  where: { id: address1.id },
                });
                expect(updatedAddress1?.defaultShipping).toBe(false);
                expect(address2.defaultShipping).toBe(true);
              }

              if (defaultBilling) {
                const updatedAddress1 = await prisma.address.findUnique({
                  where: { id: address1.id },
                });
                expect(updatedAddress1?.defaultBilling).toBe(false);
                expect(address2.defaultBilling).toBe(true);
              }

              // Clean up
              try {
                await prisma.address.deleteMany({
                  where: { customerId: customer.id },
                });
                await prisma.customer.delete({
                  where: { id: customer.id },
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
   * Property 22: Customer order association
   * Feature: workit-admin-backend, Property 22: Customer order association
   * Validates: Requirements 4.5
   * 
   * For any customer with orders, querying the customer's orders should return 
   * all orders where customerId matches the customer's ID
   */
  describe('Property 22: Customer order association', () => {
    it(
      'should return all orders for a customer',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            fc.array(
              fc.record({
                productName: nameArbitrary,
                variantName: nameArbitrary,
                sku: fc.stringMatching(/^[A-Z0-9]{6,10}$/),
                price: fc.integer({ min: 100, max: 1000000 }),
                quantity: fc.integer({ min: 1, max: 10 }),
                stock: fc.integer({ min: 10, max: 100 }),
              }),
              { minLength: 1, maxLength: 5 }
            ),
            async (uuid, password, firstName, lastName, orderItems) => {
              // Skip if names are empty
              fc.pre(firstName.trim().length > 0 && lastName.trim().length > 0);

              // Use UUID + timestamp to ensure unique email
              const uniqueEmail = `test-${uuid}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

              // Register a customer
              const customer = await customerService.registerCustomer({
                email: uniqueEmail,
                password,
                firstName,
                lastName,
              });

              // Create multiple orders for the customer
              const createdOrderIds: string[] = [];

              for (const item of orderItems) {
                // Create product and variant
                const product = await productService.createProduct({
                  name: item.productName,
                  enabled: true,
                });

                const variant = await productService.addVariantToProduct({
                  productId: product.id,
                  name: item.variantName,
                  sku: `${item.sku}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  price: item.price,
                  stockOnHand: item.stock,
                  enabled: true,
                });

                // Create order
                const order = await orderService.createOrder({
                  customerId: customer.id,
                  lines: [
                    {
                      variantId: variant.id,
                      quantity: item.quantity,
                    },
                  ],
                });

                createdOrderIds.push(order.id);

                // Small delay to ensure different timestamps
                await new Promise(resolve => setTimeout(resolve, 10));
              }

              // Query customer orders using the service method
              const customerOrders = await customerService.getCustomerOrders(customer.id);

              // Verify all created orders are returned
              expect(customerOrders.length).toBe(createdOrderIds.length);

              for (const orderId of createdOrderIds) {
                const foundOrder = customerOrders.find(o => o.id === orderId);
                expect(foundOrder).toBeDefined();
                expect(foundOrder?.customerId).toBe(customer.id);
              }

              // Verify orders are sorted by createdAt descending (newest first)
              for (let i = 0; i < customerOrders.length - 1; i++) {
                expect(customerOrders[i].createdAt.getTime()).toBeGreaterThanOrEqual(
                  customerOrders[i + 1].createdAt.getTime()
                );
              }

              // Verify each order has complete data
              for (const order of customerOrders) {
                expect(order.id).toBeDefined();
                expect(order.code).toBeDefined();
                expect(order.customerId).toBe(customer.id);
                expect(order.lines).toBeDefined();
                expect(order.lines.length).toBeGreaterThan(0);
                expect(order.total).toBeGreaterThan(0);
              }
            }
          ),
          { numRuns: 50 } // Reduced runs due to complexity
        );
      },
      90000 // 90 second timeout
    );

    it(
      'should return empty array for customer with no orders',
      async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.uuid(),
            passwordArbitrary,
            nameArbitrary,
            nameArbitrary,
            async (uuid, password, firstName, lastName) => {
              // Skip if names are empty
              fc.pre(firstName.trim().length > 0 && lastName.trim().length > 0);

              // Use UUID + timestamp to ensure unique email
              const uniqueEmail = `test-${uuid}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}@example.com`;

              // Register a customer
              const customer = await customerService.registerCustomer({
                email: uniqueEmail,
                password,
                firstName,
                lastName,
              });

              // Query customer orders (should be empty)
              const customerOrders = await customerService.getCustomerOrders(customer.id);

              // Verify no orders are returned
              expect(customerOrders).toBeDefined();
              expect(customerOrders.length).toBe(0);
            }
          ),
          { numRuns: 100 }
        );
      },
      30000 // 30 second timeout
    );
  });
});
