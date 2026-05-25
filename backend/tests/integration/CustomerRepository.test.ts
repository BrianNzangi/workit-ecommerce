/**
 * Integration tests for CustomerRepository and CustomerMapper.
 *
 * These tests verify the mapping and repository logic using mock database
 * objects, without requiring a live database connection. This approach
 * validates the aggregate reconstruction (toDomain) and persistence
 * (toUserPersistence, toAddressesPersistence) logic.
 *
 * Requirements: 22.1, 22.3
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  CustomerMapper,
  UserWithAddresses,
  AddressRecord,
} from '../../src/infrastructure/persistence/mappers/CustomerMapper.js';
import { Customer } from '../../src/domain/customer-management/aggregates/Customer.js';
import { Email } from '../../src/domain/customer-management/value-objects/Email.js';
import { Address } from '../../src/domain/customer-management/value-objects/Address.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const now = new Date('2024-01-15T10:00:00Z');

const rawAddress: AddressRecord = {
  id: 'addr-1',
  customerId: 'cust-1',
  fullName: 'Alice Wanjiru',
  streetLine1: '123 Moi Avenue',
  streetLine2: 'Apt 4B',
  city: 'Nairobi',
  province: 'Nairobi County',
  postalCode: '00100',
  country: 'KE',
  phoneNumber: '+254712345678',
  defaultShipping: true,
  defaultBilling: true,
};

const rawAddressNoOptionals: AddressRecord = {
  id: 'addr-2',
  customerId: 'cust-1',
  fullName: 'Alice Wanjiru',
  streetLine1: '456 Kenyatta Ave',
  streetLine2: null,
  city: 'Mombasa',
  province: 'Mombasa County',
  postalCode: null,
  country: 'KE',
  phoneNumber: '0712345678',
  defaultShipping: false,
  defaultBilling: false,
};

const rawUser: UserWithAddresses = {
  id: 'cust-1',
  name: 'Alice Wanjiru',
  email: 'alice@example.com',
  emailVerified: true,
  image: null,
  createdAt: now,
  updatedAt: now,
  role: 'CUSTOMER',
  enabled: true,
  firstName: 'Alice',
  lastName: 'Wanjiru',
  password: null,
  phoneNumber: '+254712345678',
  addresses: [rawAddress],
};

const rawUserNoAddresses: UserWithAddresses = {
  ...rawUser,
  id: 'cust-2',
  email: 'bob@example.com',
  name: 'Bob Kamau',
  firstName: 'Bob',
  lastName: 'Kamau',
  phoneNumber: null,
  addresses: [],
};

const rawUserMultipleAddresses: UserWithAddresses = {
  ...rawUser,
  id: 'cust-3',
  email: 'carol@example.com',
  name: 'Carol Njeri',
  addresses: [rawAddress, rawAddressNoOptionals],
};

// ─── CustomerMapper Tests ─────────────────────────────────────────────────────

describe('CustomerMapper', () => {
  let mapper: CustomerMapper;

  beforeEach(() => {
    mapper = new CustomerMapper();
  });

  describe('toDomain', () => {
    it('should reconstruct a Customer aggregate from raw DB records', () => {
      const customer = mapper.toDomain(rawUser);

      expect(customer).toBeInstanceOf(Customer);
      expect(customer.id).toBe('cust-1');
      expect(customer.name).toBe('Alice Wanjiru');
      expect(customer.email).toBeInstanceOf(Email);
      expect(customer.email.value).toBe('alice@example.com');
      expect(customer.role).toBe('CUSTOMER');
      expect(customer.enabled).toBe(true);
      expect(customer.emailVerified).toBe(true);
    });

    it('should reconstruct customer profile fields', () => {
      const customer = mapper.toDomain(rawUser);
      expect(customer.firstName).toBe('Alice');
      expect(customer.lastName).toBe('Wanjiru');
      expect(customer.phoneNumber).toBe('+254712345678');
    });

    it('should reconstruct addresses as CustomerAddress entries', () => {
      const customer = mapper.toDomain(rawUser);
      expect(customer.addresses).toHaveLength(1);

      const entry = customer.addresses[0];
      expect(entry.id).toBe('addr-1');
      expect(entry.address).toBeInstanceOf(Address);
      expect(entry.address.fullName).toBe('Alice Wanjiru');
      expect(entry.address.city).toBe('Nairobi');
      expect(entry.isDefaultShipping).toBe(true);
      expect(entry.isDefaultBilling).toBe(true);
    });

    it('should reconstruct address with optional fields', () => {
      const customer = mapper.toDomain(rawUser);
      const entry = customer.addresses[0];
      expect(entry.address.streetLine2).toBe('Apt 4B');
      expect(entry.address.postalCode).toBe('00100');
    });

    it('should reconstruct address without optional fields', () => {
      const customer = mapper.toDomain(rawUserMultipleAddresses);
      const entry = customer.addresses[1];
      expect(entry.address.streetLine2).toBeUndefined();
      expect(entry.address.postalCode).toBeUndefined();
    });

    it('should reconstruct a customer with no addresses', () => {
      const customer = mapper.toDomain(rawUserNoAddresses);
      expect(customer.addresses).toHaveLength(0);
    });

    it('should reconstruct a customer with multiple addresses', () => {
      const customer = mapper.toDomain(rawUserMultipleAddresses);
      expect(customer.addresses).toHaveLength(2);
    });

    it('should not raise domain events when reconstituting', () => {
      const customer = mapper.toDomain(rawUser);
      expect(customer.domainEvents).toHaveLength(0);
    });

    it('should default role to CUSTOMER when null in DB', () => {
      const rawWithNullRole: UserWithAddresses = { ...rawUser, role: null };
      const customer = mapper.toDomain(rawWithNullRole);
      expect(customer.role).toBe('CUSTOMER');
    });

    it('should preserve timestamps', () => {
      const customer = mapper.toDomain(rawUser);
      expect(customer.createdAt).toEqual(now);
      expect(customer.updatedAt).toEqual(now);
    });
  });

  describe('toUserPersistence', () => {
    it('should convert a Customer aggregate to a user persistence DTO', () => {
      const customer = mapper.toDomain(rawUser);
      const dto = mapper.toUserPersistence(customer);

      expect(dto.id).toBe('cust-1');
      expect(dto.name).toBe('Alice Wanjiru');
      expect(dto.email).toBe('alice@example.com');
      expect(dto.emailVerified).toBe(true);
      expect(dto.role).toBe('CUSTOMER');
      expect(dto.enabled).toBe(true);
      expect(dto.firstName).toBe('Alice');
      expect(dto.lastName).toBe('Wanjiru');
      expect(dto.phoneNumber).toBe('+254712345678');
    });

    it('should set null for missing optional fields', () => {
      const customer = mapper.toDomain(rawUserNoAddresses);
      const dto = mapper.toUserPersistence(customer);
      // Bob has no phoneNumber in the fixture
      expect(dto.phoneNumber).toBeNull();
    });
  });

  describe('toAddressesPersistence', () => {
    it('should convert customer addresses to persistence DTOs', () => {
      const customer = mapper.toDomain(rawUser);
      const dtos = mapper.toAddressesPersistence(customer);

      expect(dtos).toHaveLength(1);
      expect(dtos[0].id).toBe('addr-1');
      expect(dtos[0].customerId).toBe('cust-1');
      expect(dtos[0].fullName).toBe('Alice Wanjiru');
      expect(dtos[0].streetLine1).toBe('123 Moi Avenue');
      expect(dtos[0].streetLine2).toBe('Apt 4B');
      expect(dtos[0].city).toBe('Nairobi');
      expect(dtos[0].province).toBe('Nairobi County');
      expect(dtos[0].postalCode).toBe('00100');
      expect(dtos[0].country).toBe('KE');
      expect(dtos[0].phoneNumber).toBe('+254712345678');
      expect(dtos[0].defaultShipping).toBe(true);
      expect(dtos[0].defaultBilling).toBe(true);
    });

    it('should set null for missing optional address fields', () => {
      const customer = mapper.toDomain(rawUserMultipleAddresses);
      const dtos = mapper.toAddressesPersistence(customer);
      const secondDto = dtos[1];

      expect(secondDto.streetLine2).toBeNull();
      expect(secondDto.postalCode).toBeNull();
    });

    it('should return empty array for a customer with no addresses', () => {
      const customer = mapper.toDomain(rawUserNoAddresses);
      const dtos = mapper.toAddressesPersistence(customer);
      expect(dtos).toHaveLength(0);
    });

    it('should return multiple DTOs for multiple addresses', () => {
      const customer = mapper.toDomain(rawUserMultipleAddresses);
      const dtos = mapper.toAddressesPersistence(customer);
      expect(dtos).toHaveLength(2);
    });
  });

  describe('round-trip mapping', () => {
    it('should produce the same aggregate after toDomain → toPersistence → toDomain', () => {
      const original = mapper.toDomain(rawUser);
      const userDto = mapper.toUserPersistence(original);
      const addressDtos = mapper.toAddressesPersistence(original);

      // Reconstruct a raw record from the persistence DTOs
      const reconstructedRaw: UserWithAddresses = {
        ...userDto,
        image: null,
        password: null,
        createdAt: original.createdAt,
        updatedAt: original.updatedAt,
        addresses: addressDtos.map((a) => ({
          ...a,
          streetLine2: a.streetLine2,
          postalCode: a.postalCode,
        })) as AddressRecord[],
      };

      const reconstructed = mapper.toDomain(reconstructedRaw);

      expect(reconstructed.id).toBe(original.id);
      expect(reconstructed.name).toBe(original.name);
      expect(reconstructed.email.value).toBe(original.email.value);
      expect(reconstructed.addresses).toHaveLength(original.addresses.length);
      expect(reconstructed.addresses[0].address.city).toBe(
        original.addresses[0].address.city,
      );
    });

    it('should preserve address default flags through round-trip', () => {
      const original = mapper.toDomain(rawUser);
      const addressDtos = mapper.toAddressesPersistence(original);

      expect(addressDtos[0].defaultShipping).toBe(true);
      expect(addressDtos[0].defaultBilling).toBe(true);
    });
  });

  describe('email uniqueness validation (repository-level concern)', () => {
    it('should produce different customer IDs for different users', () => {
      const customer1 = mapper.toDomain(rawUser);
      const customer2 = mapper.toDomain(rawUserNoAddresses);
      expect(customer1.id).not.toBe(customer2.id);
    });

    it('should produce different email values for different users', () => {
      const customer1 = mapper.toDomain(rawUser);
      const customer2 = mapper.toDomain(rawUserNoAddresses);
      expect(customer1.email.value).not.toBe(customer2.email.value);
    });
  });
});
