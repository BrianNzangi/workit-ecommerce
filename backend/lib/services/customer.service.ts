import { PrismaClient, Customer, Address } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';
import {
  validateRequiredFields,
  validateEmail,
  validateForeignKey,
  validateNonEmptyString,
} from '@/lib/validation';

const SALT_ROUNDS = 10;

export interface RegisterCustomerInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UpdateCustomerInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  enabled?: boolean;
}

export interface CreateAddressInput {
  customerId: string;
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
  phoneNumber: string;
  defaultShipping?: boolean;
  defaultBilling?: boolean;
}

export interface UpdateAddressInput {
  fullName?: string;
  streetLine1?: string;
  streetLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  defaultShipping?: boolean;
  defaultBilling?: boolean;
}

export interface CustomerSearchOptions {
  take?: number;
  skip?: number;
}

export class CustomerService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Register a new customer
   */
  async registerCustomer(input: RegisterCustomerInput): Promise<Customer> {
    // Validate required fields
    validateRequiredFields(input, ['email', 'password', 'firstName', 'lastName']);

    // Validate email format
    validateEmail(input.email, 'email');

    // Validate password strength (minimum 8 characters)
    if (input.password.length < 8) {
      throw validationError('Password must be at least 8 characters', 'password');
    }

    // Check if customer already exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email: input.email },
    });

    if (existingCustomer) {
      throw duplicateError('Customer with this email already exists', 'email');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    // Create customer
    const customer = await this.prisma.customer.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
      },
    });

    return customer;
  }

  /**
   * Update customer information
   */
  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
    // Check if customer exists
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      throw notFoundError('Customer not found');
    }

    // If email is being updated, check for duplicates
    if (input.email && input.email !== existingCustomer.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw validationError('Invalid email format', 'email');
      }

      const duplicateCustomer = await this.prisma.customer.findUnique({
        where: { email: input.email },
      });

      if (duplicateCustomer) {
        throw duplicateError('Customer with this email already exists', 'email');
      }
    }

    // Update customer
    const customer = await this.prisma.customer.update({
      where: { id },
      data: input,
    });

    return customer;
  }

  /**
   * Get customer by ID
   */
  async getCustomer(id: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return customer;
  }

  /**
   * Search customers by name, email, or phone number
   */
  async searchCustomers(
    searchTerm: string,
    options: CustomerSearchOptions = {}
  ): Promise<Customer[]> {
    const { take = 50, skip = 0 } = options;

    const customers = await this.prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phoneNumber: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    });

    return customers;
  }

  /**
   * Create a new address for a customer
   */
  async createAddress(input: CreateAddressInput): Promise<Address> {
    // Validate required fields
    if (
      !input.customerId ||
      !input.fullName ||
      !input.streetLine1 ||
      !input.city ||
      !input.province ||
      !input.postalCode ||
      !input.phoneNumber
    ) {
      throw validationError(
        'customerId, fullName, streetLine1, city, province, postalCode, and phoneNumber are required'
      );
    }

    // Check if customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: input.customerId },
    });

    if (!customer) {
      throw notFoundError('Customer not found');
    }

    // If this is set as default, unset other defaults
    if (input.defaultShipping) {
      await this.prisma.address.updateMany({
        where: {
          customerId: input.customerId,
          defaultShipping: true,
        },
        data: { defaultShipping: false },
      });
    }

    if (input.defaultBilling) {
      await this.prisma.address.updateMany({
        where: {
          customerId: input.customerId,
          defaultBilling: true,
        },
        data: { defaultBilling: false },
      });
    }

    // Create address
    const address = await this.prisma.address.create({
      data: {
        customerId: input.customerId,
        fullName: input.fullName,
        streetLine1: input.streetLine1,
        streetLine2: input.streetLine2,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        country: input.country || 'KE',
        phoneNumber: input.phoneNumber,
        defaultShipping: input.defaultShipping || false,
        defaultBilling: input.defaultBilling || false,
      },
    });

    return address;
  }

  /**
   * Update an address
   */
  async updateAddress(id: string, input: UpdateAddressInput): Promise<Address> {
    // Check if address exists
    const existingAddress = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      throw notFoundError('Address not found');
    }

    // If this is being set as default, unset other defaults
    if (input.defaultShipping && existingAddress.customerId) {
      await this.prisma.address.updateMany({
        where: {
          customerId: existingAddress.customerId,
          defaultShipping: true,
          id: { not: id },
        },
        data: { defaultShipping: false },
      });
    }

    if (input.defaultBilling && existingAddress.customerId) {
      await this.prisma.address.updateMany({
        where: {
          customerId: existingAddress.customerId,
          defaultBilling: true,
          id: { not: id },
        },
        data: { defaultBilling: false },
      });
    }

    // Prepare update data, converting undefined to null for optional fields
    const updateData: any = { ...input };
    if (input.streetLine2 === undefined) {
      updateData.streetLine2 = null;
    }

    // Update address
    const address = await this.prisma.address.update({
      where: { id },
      data: updateData,
    });

    return address;
  }

  /**
   * Delete an address
   */
  async deleteAddress(id: string): Promise<boolean> {
    // Check if address exists
    const existingAddress = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!existingAddress) {
      throw notFoundError('Address not found');
    }

    // Delete address
    await this.prisma.address.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        lines: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        shippingAddress: true,
        billingAddress: true,
        payments: true,
      },
    });

    return orders;
  }
}
