import { AggregateRoot } from '../../shared/AggregateRoot.js';
import { Address } from '../value-objects/Address.js';
import { Email } from '../value-objects/Email.js';
import { CustomerRegistered } from '../events/CustomerRegistered.js';
import { ValidationError } from '../errors/ValidationError.js';

/**
 * Represents a stored address entry for a customer.
 * Wraps an Address value object with an ID and default flags.
 */
export interface CustomerAddress {
  id: string;
  address: Address;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

interface CustomerProps {
  email: Email;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role: string;
  enabled: boolean;
  emailVerified: boolean;
  addresses: CustomerAddress[];
  /** References to orders placed by this customer (IDs only — cross-aggregate). */
  orderIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Aggregate root for the Customer Management bounded context.
 *
 * A Customer represents a registered storefront user. It manages:
 * - Profile information (name, email, phone)
 * - Address book with default shipping/billing designations
 * - References to order history (IDs only — orders live in Order Management)
 *
 * Domain events raised:
 * - CustomerRegistered: on creation via Customer.create()
 *
 * Invariants:
 * - Email must be a valid Email value object
 * - Name must be non-empty
 * - At most one address can be the default shipping address
 * - At most one address can be the default billing address
 */
export class Customer extends AggregateRoot<string> {
  private props: CustomerProps;

  private constructor(id: string, props: CustomerProps) {
    super(id);
    this.props = props;
  }

  /**
   * Create a brand-new Customer.
   * Raises a CustomerRegistered domain event.
   *
   * @throws {ValidationError} if name is empty
   */
  static create(params: {
    id: string;
    email: Email;
    name: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role?: string;
    enabled?: boolean;
    emailVerified?: boolean;
  }): Customer {
    if (!params.name || params.name.trim().length === 0) {
      throw new ValidationError('Customer name must be non-empty');
    }

    const customer = new Customer(params.id, {
      email: params.email,
      name: params.name.trim(),
      firstName: params.firstName?.trim(),
      lastName: params.lastName?.trim(),
      phoneNumber: params.phoneNumber?.trim(),
      role: params.role ?? 'CUSTOMER',
      enabled: params.enabled ?? true,
      emailVerified: params.emailVerified ?? false,
      addresses: [],
      orderIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    customer.addDomainEvent(
      new CustomerRegistered(customer.id, params.email.value, params.name.trim()),
    );

    return customer;
  }

  /**
   * Reconstitute a Customer from persisted data.
   * Does NOT raise domain events.
   */
  static reconstitute(params: {
    id: string;
    email: Email;
    name: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    role: string;
    enabled: boolean;
    emailVerified: boolean;
    addresses: CustomerAddress[];
    orderIds: string[];
    createdAt: Date;
    updatedAt: Date;
  }): Customer {
    return new Customer(params.id, {
      email: params.email,
      name: params.name,
      firstName: params.firstName,
      lastName: params.lastName,
      phoneNumber: params.phoneNumber,
      role: params.role,
      enabled: params.enabled,
      emailVerified: params.emailVerified,
      addresses: [...params.addresses],
      orderIds: [...params.orderIds],
      createdAt: params.createdAt,
      updatedAt: params.updatedAt,
    });
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get email(): Email {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get firstName(): string | undefined {
    return this.props.firstName;
  }

  get lastName(): string | undefined {
    return this.props.lastName;
  }

  get phoneNumber(): string | undefined {
    return this.props.phoneNumber;
  }

  get role(): string {
    return this.props.role;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get addresses(): ReadonlyArray<CustomerAddress> {
    return this.props.addresses;
  }

  get orderIds(): ReadonlyArray<string> {
    return this.props.orderIds;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // ─── Business Methods ────────────────────────────────────────────────────────

  /**
   * Add a new address to the customer's address book.
   *
   * If this is the first address, it is automatically set as both the default
   * shipping and billing address.
   *
   * @throws {ValidationError} if an address with the same ID already exists
   */
  addAddress(entry: CustomerAddress): void {
    const existing = this.props.addresses.find((a) => a.id === entry.id);
    if (existing) {
      throw new ValidationError(`Address with id '${entry.id}' already exists`);
    }

    // Auto-set as default if this is the first address
    const isFirst = this.props.addresses.length === 0;
    const addressEntry: CustomerAddress = {
      ...entry,
      isDefaultShipping: isFirst || entry.isDefaultShipping,
      isDefaultBilling: isFirst || entry.isDefaultBilling,
    };

    // If this address is being set as default, clear the existing defaults
    if (addressEntry.isDefaultShipping) {
      this.props.addresses.forEach((a) => {
        (a as CustomerAddress).isDefaultShipping = false;
      });
    }
    if (addressEntry.isDefaultBilling) {
      this.props.addresses.forEach((a) => {
        (a as CustomerAddress).isDefaultBilling = false;
      });
    }

    this.props.addresses.push(addressEntry);
    this.props.updatedAt = new Date();
  }

  /**
   * Set an existing address as the default shipping address.
   *
   * @throws {ValidationError} if the address ID is not found
   */
  setDefaultShippingAddress(addressId: string): void {
    const target = this.props.addresses.find((a) => a.id === addressId);
    if (!target) {
      throw new ValidationError(`Address with id '${addressId}' not found`);
    }

    this.props.addresses.forEach((a) => {
      (a as CustomerAddress).isDefaultShipping = a.id === addressId;
    });

    this.props.updatedAt = new Date();
  }

  /**
   * Set an existing address as the default billing address.
   *
   * @throws {ValidationError} if the address ID is not found
   */
  setDefaultBillingAddress(addressId: string): void {
    const target = this.props.addresses.find((a) => a.id === addressId);
    if (!target) {
      throw new ValidationError(`Address with id '${addressId}' not found`);
    }

    this.props.addresses.forEach((a) => {
      (a as CustomerAddress).isDefaultBilling = a.id === addressId;
    });

    this.props.updatedAt = new Date();
  }

  /**
   * Remove an address from the customer's address book.
   *
   * @throws {ValidationError} if the address ID is not found
   */
  removeAddress(addressId: string): void {
    const index = this.props.addresses.findIndex((a) => a.id === addressId);
    if (index === -1) {
      throw new ValidationError(`Address with id '${addressId}' not found`);
    }
    this.props.addresses.splice(index, 1);
    this.props.updatedAt = new Date();
  }

  /**
   * Add an order ID reference to this customer's order history.
   */
  addOrderReference(orderId: string): void {
    if (!this.props.orderIds.includes(orderId)) {
      this.props.orderIds.push(orderId);
      this.props.updatedAt = new Date();
    }
  }

  /** Returns the default shipping address, or undefined if none is set. */
  get defaultShippingAddress(): CustomerAddress | undefined {
    return this.props.addresses.find((a) => a.isDefaultShipping);
  }

  /** Returns the default billing address, or undefined if none is set. */
  get defaultBillingAddress(): CustomerAddress | undefined {
    return this.props.addresses.find((a) => a.isDefaultBilling);
  }
}
