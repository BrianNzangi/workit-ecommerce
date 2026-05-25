import { eq } from 'drizzle-orm';
import { db, schema } from '@workit/db';
import { ICustomerRepository } from '../../../domain/customer-management/repositories/ICustomerRepository.js';
import { Customer } from '../../../domain/customer-management/aggregates/Customer.js';
import { Email } from '../../../domain/customer-management/value-objects/Email.js';
import {
  CustomerMapper,
  UserWithAddresses,
  AddressRecord,
} from '../mappers/CustomerMapper.js';

/**
 * Drizzle ORM implementation of ICustomerRepository.
 *
 * Maps to the `user` table (role = 'CUSTOMER') and the `Address` table.
 * Uses the shared @workit/db connection and schema.
 */
export class CustomerRepository implements ICustomerRepository {
  private readonly mapper = new CustomerMapper();

  async findById(id: string): Promise<Customer | null> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id),
    });

    if (!user) return null;

    const addresses = await db.query.addresses.findMany({
      where: eq(schema.addresses.customerId, id),
    });

    const raw: UserWithAddresses = {
      ...user,
      role: user.role ?? 'CUSTOMER',
      enabled: user.enabled ?? true,
      addresses: addresses as AddressRecord[],
    };

    return this.mapper.toDomain(raw);
  }

  async findByEmail(email: Email): Promise<Customer | null> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email.value),
    });

    if (!user) return null;

    const addresses = await db.query.addresses.findMany({
      where: eq(schema.addresses.customerId, user.id),
    });

    const raw: UserWithAddresses = {
      ...user,
      role: user.role ?? 'CUSTOMER',
      enabled: user.enabled ?? true,
      addresses: addresses as AddressRecord[],
    };

    return this.mapper.toDomain(raw);
  }

  async save(customer: Customer): Promise<void> {
    const userDto = this.mapper.toUserPersistence(customer);
    const addressDtos = this.mapper.toAddressesPersistence(customer);

    // Upsert the user record
    await db
      .insert(schema.users as any)
      .values({
        ...userDto,
        image: null,
        password: null,
        createdAt: customer.createdAt,
      } as any)
      .onConflictDoUpdate({
        target: (schema.users as any).id,
        set: {
          name: userDto.name,
          email: userDto.email,
          emailVerified: userDto.emailVerified,
          role: userDto.role,
          enabled: userDto.enabled,
          firstName: userDto.firstName,
          lastName: userDto.lastName,
          phoneNumber: userDto.phoneNumber,
          updatedAt: userDto.updatedAt,
        },
      });

    // Upsert each address
    for (const addrDto of addressDtos) {
      await db
        .insert(schema.addresses as any)
        .values(addrDto as any)
        .onConflictDoUpdate({
          target: (schema.addresses as any).id,
          set: {
            fullName: addrDto.fullName,
            streetLine1: addrDto.streetLine1,
            streetLine2: addrDto.streetLine2,
            city: addrDto.city,
            province: addrDto.province,
            postalCode: addrDto.postalCode,
            country: addrDto.country,
            phoneNumber: addrDto.phoneNumber,
            defaultShipping: addrDto.defaultShipping,
            defaultBilling: addrDto.defaultBilling,
          },
        });
    }
  }
}
