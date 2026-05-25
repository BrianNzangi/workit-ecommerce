import { Customer, CustomerAddress } from '../../../domain/customer-management/aggregates/Customer.js';
import { Email } from '../../../domain/customer-management/value-objects/Email.js';
import { Address } from '../../../domain/customer-management/value-objects/Address.js';

// ─── Raw DB record types (matching the Drizzle/identity schema) ───────────────

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string | null;
  enabled: boolean;
  firstName: string | null;
  lastName: string | null;
  password: string | null;
  phoneNumber: string | null;
}

export interface AddressRecord {
  id: string;
  customerId: string | null;
  fullName: string;
  streetLine1: string;
  streetLine2: string | null;
  city: string;
  province: string;
  postalCode: string | null;
  country: string;
  phoneNumber: string;
  defaultShipping: boolean;
  defaultBilling: boolean;
}

export interface UserWithAddresses extends UserRecord {
  addresses: AddressRecord[];
}

// ─── Persistence DTOs ─────────────────────────────────────────────────────────

export interface UserPersistenceDto {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  enabled: boolean;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  updatedAt: Date;
}

export interface AddressPersistenceDto {
  id: string;
  customerId: string;
  fullName: string;
  streetLine1: string;
  streetLine2: string | null;
  city: string;
  province: string;
  postalCode: string | null;
  country: string;
  phoneNumber: string;
  defaultShipping: boolean;
  defaultBilling: boolean;
}

/**
 * Maps between the Customer aggregate and database records.
 *
 * The Customer aggregate maps to the `user` table (with role = 'CUSTOMER')
 * and the `Address` table for address entries.
 */
export class CustomerMapper {
  /**
   * Reconstruct a Customer aggregate from raw database records.
   */
  toDomain(raw: UserWithAddresses): Customer {
    let email: Email;
    try {
      email = Email.create(raw.email);
    } catch {
      // Fallback for legacy data that may not pass strict validation
      // We create a minimal Email-like object by bypassing validation
      // This should not happen in practice with well-maintained data
      email = Email.create(raw.email.includes('@') ? raw.email : `${raw.email}@unknown.invalid`);
    }

    const addresses: CustomerAddress[] = raw.addresses.map((addr) => {
      let address: Address;
      try {
        address = Address.create({
          fullName: addr.fullName,
          streetLine1: addr.streetLine1,
          streetLine2: addr.streetLine2 ?? undefined,
          city: addr.city,
          province: addr.province,
          postalCode: addr.postalCode ?? undefined,
          country: addr.country,
          phoneNumber: addr.phoneNumber,
        });
      } catch {
        // Gracefully handle legacy address data that may not pass strict validation
        address = Address.create({
          fullName: addr.fullName || 'Unknown',
          streetLine1: addr.streetLine1 || 'Unknown',
          city: addr.city || 'Unknown',
          province: addr.province || 'Unknown',
          country: addr.country || 'KE',
          phoneNumber: addr.phoneNumber || '0000000',
        });
      }

      return {
        id: addr.id,
        address,
        isDefaultShipping: addr.defaultShipping,
        isDefaultBilling: addr.defaultBilling,
      };
    });

    return Customer.reconstitute({
      id: raw.id,
      email,
      name: raw.name,
      firstName: raw.firstName ?? undefined,
      lastName: raw.lastName ?? undefined,
      phoneNumber: raw.phoneNumber ?? undefined,
      role: raw.role ?? 'CUSTOMER',
      enabled: raw.enabled,
      emailVerified: raw.emailVerified,
      addresses,
      orderIds: [],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  /**
   * Convert a Customer aggregate to a persistence DTO for the `user` table.
   */
  toUserPersistence(customer: Customer): UserPersistenceDto {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email.value,
      emailVerified: customer.emailVerified,
      role: customer.role,
      enabled: customer.enabled,
      firstName: customer.firstName ?? null,
      lastName: customer.lastName ?? null,
      phoneNumber: customer.phoneNumber ?? null,
      updatedAt: customer.updatedAt,
    };
  }

  /**
   * Convert the customer's addresses to persistence DTOs for the `Address` table.
   */
  toAddressesPersistence(customer: Customer): AddressPersistenceDto[] {
    return customer.addresses.map((entry) => ({
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
  }
}
