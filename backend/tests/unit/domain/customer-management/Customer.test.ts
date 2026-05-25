import { describe, it, expect } from 'vitest';
import { Customer, CustomerAddress } from '../../../../src/domain/customer-management/aggregates/Customer.js';
import { Email } from '../../../../src/domain/customer-management/value-objects/Email.js';
import { Address } from '../../../../src/domain/customer-management/value-objects/Address.js';
import { CustomerRegistered } from '../../../../src/domain/customer-management/events/CustomerRegistered.js';
import { ValidationError } from '../../../../src/domain/customer-management/errors/ValidationError.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeEmail(value = 'alice@example.com'): Email {
  return Email.create(value);
}

function makeAddress(overrides: Partial<Parameters<typeof Address.create>[0]> = {}): Address {
  return Address.create({
    fullName: 'Alice Wanjiru',
    streetLine1: '123 Moi Avenue',
    city: 'Nairobi',
    province: 'Nairobi County',
    phoneNumber: '+254712345678',
    ...overrides,
  });
}

function makeCustomer(overrides: Partial<Parameters<typeof Customer.create>[0]> = {}): Customer {
  return Customer.create({
    id: 'cust-1',
    email: makeEmail(),
    name: 'Alice Wanjiru',
    ...overrides,
  });
}

function makeAddressEntry(id = 'addr-1', overrides: Partial<CustomerAddress> = {}): CustomerAddress {
  return {
    id,
    address: makeAddress(),
    isDefaultShipping: false,
    isDefaultBilling: false,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Customer', () => {
  // ─── Creation ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a customer with valid parameters', () => {
      const customer = makeCustomer();
      expect(customer.id).toBe('cust-1');
      expect(customer.name).toBe('Alice Wanjiru');
      expect(customer.email.value).toBe('alice@example.com');
      expect(customer.role).toBe('CUSTOMER');
      expect(customer.enabled).toBe(true);
      expect(customer.emailVerified).toBe(false);
    });

    it('should default role to CUSTOMER', () => {
      const customer = makeCustomer();
      expect(customer.role).toBe('CUSTOMER');
    });

    it('should default enabled to true', () => {
      const customer = makeCustomer();
      expect(customer.enabled).toBe(true);
    });

    it('should default emailVerified to false', () => {
      const customer = makeCustomer();
      expect(customer.emailVerified).toBe(false);
    });

    it('should start with an empty address list', () => {
      const customer = makeCustomer();
      expect(customer.addresses).toHaveLength(0);
    });

    it('should start with an empty order ID list', () => {
      const customer = makeCustomer();
      expect(customer.orderIds).toHaveLength(0);
    });

    it('should trim the name', () => {
      const customer = makeCustomer({ name: '  Alice  ' });
      expect(customer.name).toBe('Alice');
    });

    it('should accept optional firstName and lastName', () => {
      const customer = makeCustomer({ firstName: 'Alice', lastName: 'Wanjiru' });
      expect(customer.firstName).toBe('Alice');
      expect(customer.lastName).toBe('Wanjiru');
    });

    it('should throw ValidationError when name is empty', () => {
      expect(() => makeCustomer({ name: '' })).toThrow(ValidationError);
    });

    it('should throw ValidationError when name is whitespace-only', () => {
      expect(() => makeCustomer({ name: '   ' })).toThrow(ValidationError);
    });
  });

  // ─── CustomerRegistered event ─────────────────────────────────────────────

  describe('CustomerRegistered event', () => {
    it('should raise a CustomerRegistered event on creation', () => {
      const customer = makeCustomer();
      expect(customer.domainEvents).toHaveLength(1);
      expect(customer.domainEvents[0]).toBeInstanceOf(CustomerRegistered);
    });

    it('should include correct data in the CustomerRegistered event', () => {
      const customer = makeCustomer();
      const event = customer.domainEvents[0] as CustomerRegistered;
      expect(event.customerId).toBe('cust-1');
      expect(event.email).toBe('alice@example.com');
      expect(event.name).toBe('Alice Wanjiru');
      expect(event.eventType).toBe('CustomerRegistered');
    });

    it('should NOT raise events when reconstituting', () => {
      const customer = Customer.reconstitute({
        id: 'cust-1',
        email: makeEmail(),
        name: 'Alice',
        role: 'CUSTOMER',
        enabled: true,
        emailVerified: false,
        addresses: [],
        orderIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expect(customer.domainEvents).toHaveLength(0);
    });

    it('should clear events after clearEvents()', () => {
      const customer = makeCustomer();
      customer.clearEvents();
      expect(customer.domainEvents).toHaveLength(0);
    });
  });

  // ─── addAddress ───────────────────────────────────────────────────────────

  describe('addAddress', () => {
    it('should add an address to the address book', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      expect(customer.addresses).toHaveLength(1);
    });

    it('should auto-set the first address as default shipping and billing', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1', { isDefaultShipping: false, isDefaultBilling: false }));
      expect(customer.addresses[0].isDefaultShipping).toBe(true);
      expect(customer.addresses[0].isDefaultBilling).toBe(true);
    });

    it('should allow adding multiple addresses', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      customer.addAddress(makeAddressEntry('addr-2'));
      expect(customer.addresses).toHaveLength(2);
    });

    it('should not auto-set second address as default', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      customer.addAddress(makeAddressEntry('addr-2'));
      expect(customer.addresses[1].isDefaultShipping).toBe(false);
      expect(customer.addresses[1].isDefaultBilling).toBe(false);
    });

    it('should clear existing default shipping when new address is added as default', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      customer.addAddress(makeAddressEntry('addr-2', { isDefaultShipping: true, isDefaultBilling: false }));
      expect(customer.addresses[0].isDefaultShipping).toBe(false);
      expect(customer.addresses[1].isDefaultShipping).toBe(true);
    });

    it('should throw ValidationError when adding an address with a duplicate ID', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      expect(() => customer.addAddress(makeAddressEntry('addr-1'))).toThrow(ValidationError);
    });

    it('should update updatedAt when an address is added', () => {
      const customer = makeCustomer();
      const before = customer.updatedAt;
      customer.addAddress(makeAddressEntry('addr-1'));
      expect(customer.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });
  });

  // ─── setDefaultShippingAddress ────────────────────────────────────────────

  describe('setDefaultShippingAddress', () => {
    it('should set the specified address as default shipping', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      customer.addAddress(makeAddressEntry('addr-2'));
      customer.setDefaultShippingAddress('addr-2');
      expect(customer.addresses.find((a) => a.id === 'addr-2')?.isDefaultShipping).toBe(true);
    });

    it('should clear the previous default shipping address', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      customer.addAddress(makeAddressEntry('addr-2'));
      customer.setDefaultShippingAddress('addr-2');
      expect(customer.addresses.find((a) => a.id === 'addr-1')?.isDefaultShipping).toBe(false);
    });

    it('should throw ValidationError when address ID is not found', () => {
      const customer = makeCustomer();
      expect(() => customer.setDefaultShippingAddress('nonexistent')).toThrow(ValidationError);
    });

    it('should expose the default shipping address via defaultShippingAddress getter', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      customer.addAddress(makeAddressEntry('addr-2'));
      customer.setDefaultShippingAddress('addr-2');
      expect(customer.defaultShippingAddress?.id).toBe('addr-2');
    });
  });

  // ─── setDefaultBillingAddress ─────────────────────────────────────────────

  describe('setDefaultBillingAddress', () => {
    it('should set the specified address as default billing', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      customer.addAddress(makeAddressEntry('addr-2'));
      customer.setDefaultBillingAddress('addr-2');
      expect(customer.addresses.find((a) => a.id === 'addr-2')?.isDefaultBilling).toBe(true);
    });

    it('should clear the previous default billing address', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      customer.addAddress(makeAddressEntry('addr-2'));
      customer.setDefaultBillingAddress('addr-2');
      expect(customer.addresses.find((a) => a.id === 'addr-1')?.isDefaultBilling).toBe(false);
    });

    it('should throw ValidationError when address ID is not found', () => {
      const customer = makeCustomer();
      expect(() => customer.setDefaultBillingAddress('nonexistent')).toThrow(ValidationError);
    });

    it('should expose the default billing address via defaultBillingAddress getter', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      customer.addAddress(makeAddressEntry('addr-2'));
      customer.setDefaultBillingAddress('addr-2');
      expect(customer.defaultBillingAddress?.id).toBe('addr-2');
    });
  });

  // ─── removeAddress ────────────────────────────────────────────────────────

  describe('removeAddress', () => {
    it('should remove an address from the address book', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      customer.addAddress(makeAddressEntry('addr-2'));
      customer.removeAddress('addr-1');
      expect(customer.addresses).toHaveLength(1);
      expect(customer.addresses[0].id).toBe('addr-2');
    });

    it('should throw ValidationError when address ID is not found', () => {
      const customer = makeCustomer();
      expect(() => customer.removeAddress('nonexistent')).toThrow(ValidationError);
    });
  });

  // ─── addOrderReference ────────────────────────────────────────────────────

  describe('addOrderReference', () => {
    it('should add an order ID reference', () => {
      const customer = makeCustomer();
      customer.addOrderReference('order-1');
      expect(customer.orderIds).toContain('order-1');
    });

    it('should not add duplicate order IDs', () => {
      const customer = makeCustomer();
      customer.addOrderReference('order-1');
      customer.addOrderReference('order-1');
      expect(customer.orderIds).toHaveLength(1);
    });
  });

  // ─── defaultShippingAddress / defaultBillingAddress ───────────────────────

  describe('default address getters', () => {
    it('should return undefined when no addresses exist', () => {
      const customer = makeCustomer();
      expect(customer.defaultShippingAddress).toBeUndefined();
      expect(customer.defaultBillingAddress).toBeUndefined();
    });

    it('should return the first address as default after adding it', () => {
      const customer = makeCustomer();
      customer.addAddress(makeAddressEntry('addr-1'));
      expect(customer.defaultShippingAddress?.id).toBe('addr-1');
      expect(customer.defaultBillingAddress?.id).toBe('addr-1');
    });
  });

  // ─── reconstitute ─────────────────────────────────────────────────────────

  describe('reconstitute', () => {
    it('should reconstitute a customer with addresses', () => {
      const address = makeAddress();
      const customer = Customer.reconstitute({
        id: 'cust-1',
        email: makeEmail(),
        name: 'Alice',
        role: 'CUSTOMER',
        enabled: true,
        emailVerified: true,
        addresses: [
          { id: 'addr-1', address, isDefaultShipping: true, isDefaultBilling: true },
        ],
        orderIds: ['order-1'],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });

      expect(customer.id).toBe('cust-1');
      expect(customer.addresses).toHaveLength(1);
      expect(customer.orderIds).toContain('order-1');
      expect(customer.emailVerified).toBe(true);
    });
  });
});
