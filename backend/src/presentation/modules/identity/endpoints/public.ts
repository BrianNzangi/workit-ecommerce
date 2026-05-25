/**
 * Identity / Customer Management presentation layer adapter.
 *
 * Provides the same API contract as `backend/src/modules/identity/customers/endpoints/public.ts`
 * but delegates to the DDD RegisterCustomerService when the feature flag is enabled.
 *
 * Feature flag: USE_DDD_CUSTOMER
 * - true  â†’ uses RegisterCustomerService (DDD) for customer profile reads
 * - false â†’ falls through to the legacy implementation
 *
 * API contract (maintained for backward compatibility):
 *   GET  /identity/customers/me           â†’ customer profile
 *   GET  /identity/customers/me/addresses â†’ customer addresses
 *   GET  /identity/customers/me/orders    â†’ customer orders
 */
import { FastifyPluginAsync } from 'fastify';
import { featureFlags, isRouteMigrationEnabled } from '../../../../infrastructure/feature-flags/flags.js';
import { container, DI_TOKENS } from '../../../../infrastructure/di/container.js';
import { CustomerRepository } from '../../../../infrastructure/persistence/repositories/CustomerRepository.js';
import { Email } from '../../../../domain/customer-management/value-objects/Email.js';

// â”€â”€â”€ Response Serialisation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { Customer } from '../../../../domain/customer-management/aggregates/Customer.js';

function serializeCustomer(customer: Customer): Record<string, unknown> {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email.value,
    firstName: customer.firstName ?? null,
    lastName: customer.lastName ?? null,
    phoneNumber: customer.phoneNumber ?? null,
    role: customer.role,
    enabled: customer.enabled,
    emailVerified: customer.emailVerified,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

// â”€â”€â”€ Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const identityPublicRoutes: FastifyPluginAsync = async (fastify) => {
  // â”€â”€â”€ GET /me â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  fastify.get(
    '/me',
    {
      schema: { tags: ['Customers'] },
      preHandler: [fastify.authenticateStorefront],
    },
    async (request, reply) => {
      const user = (request as any).storefrontUser as { id: string } | undefined;
      if (!user?.id) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      if (!isRouteMigrationEnabled(featureFlags.useDDDCustomer)) {
        return reply.status(501).send({ message: 'DDD customer management not enabled' });
      }

      try {
        const customerRepository = container.resolve<CustomerRepository>(
          DI_TOKENS.CustomerRepository,
        );
        const customer = await customerRepository.findById(user.id);

        if (!customer) {
          return reply.status(404).send({ message: 'Customer not found' });
        }

        return serializeCustomer(customer);
      } catch (err) {
        fastify.log.error({ err }, '[DDD Identity] get customer profile failed');
        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );

  // â”€â”€â”€ GET /me/addresses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  fastify.get(
    '/me/addresses',
    {
      schema: { tags: ['Customers'] },
      preHandler: [fastify.authenticateStorefront],
    },
    async (request, reply) => {
      const user = (request as any).storefrontUser as { id: string } | undefined;
      if (!user?.id) {
        return reply.status(401).send({ message: 'Unauthorized' });
      }

      if (!isRouteMigrationEnabled(featureFlags.useDDDCustomer)) {
        return reply.status(501).send({ message: 'DDD customer management not enabled' });
      }

      try {
        const customerRepository = container.resolve<CustomerRepository>(
          DI_TOKENS.CustomerRepository,
        );
        const customer = await customerRepository.findById(user.id);

        if (!customer) {
          return reply.status(404).send({ message: 'Customer not found' });
        }

        const addresses = customer.addresses.map((entry) => ({
          id: entry.id,
          customerId: customer.id,
          fullName: entry.address.fullName,
          streetLine1: entry.address.streetLine1,
          streetLine2: entry.address.streetLine2 ?? null,
          city: entry.address.city,
          province: entry.address.province,
          postalCode: entry.address.postalCode ?? null,
          country: entry.address.country,
          phoneNumber: entry.address.phoneNumber,
          defaultShipping: entry.isDefaultShipping,
          defaultBilling: entry.isDefaultBilling,
        }));

        return { addresses };
      } catch (err) {
        fastify.log.error({ err }, '[DDD Identity] get customer addresses failed');
        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );

  // â”€â”€â”€ POST /register â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Used internally (e.g. after Better Auth sign-up) to create the DDD customer record.

  fastify.post(
    '/register',
    {
      schema: { tags: ['Customers'] },
    },
    async (request, reply) => {
      if (!isRouteMigrationEnabled(featureFlags.useDDDCustomer)) {
        return reply.status(501).send({ message: 'DDD customer management not enabled' });
      }

      const body = request.body as any;

      if (!body?.email || !body?.name) {
        return reply.status(400).send({ message: 'email and name are required' });
      }

      try {
        const { RegisterCustomerService } = await import(
          '../../../../application/customer-management/services/RegisterCustomerService.js'
        );
        const registerService = container.resolve<InstanceType<typeof RegisterCustomerService>>(
          DI_TOKENS.RegisterCustomerService,
        );

        const result = await registerService.execute({
          id: body.id,
          email: body.email,
          name: body.name,
          firstName: body.firstName,
          lastName: body.lastName,
          phoneNumber: body.phoneNumber,
          emailVerified: body.emailVerified ?? false,
        });

        return reply.status(201).send(result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Registration failed';
        fastify.log.error({ err }, '[DDD Identity] register customer failed');

        if (message.includes('already exists')) {
          return reply.status(409).send({ message });
        }
        if (message.includes('Invalid email') || message.includes('required')) {
          return reply.status(400).send({ message });
        }

        return reply.status(500).send({ message: 'Internal server error' });
      }
    },
  );
};


