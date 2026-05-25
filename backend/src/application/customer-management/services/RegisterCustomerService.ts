import { v4 as uuidv4 } from 'uuid';
import { ICustomerRepository } from '../../../domain/customer-management/repositories/ICustomerRepository.js';
import { Customer } from '../../../domain/customer-management/aggregates/Customer.js';
import { Email } from '../../../domain/customer-management/value-objects/Email.js';
import { DuplicateEmailError } from '../../../domain/customer-management/errors/DuplicateEmailError.js';
import { IEventBus } from '../../shared/IEventBus.js';

export interface RegisterCustomerRequest {
  /** Optional ID — generated if not provided. */
  id?: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  /** Whether the email has already been verified (e.g. via OAuth). Defaults to false. */
  emailVerified?: boolean;
}

export interface RegisterCustomerResult {
  customerId: string;
  email: string;
  name: string;
}

/**
 * Application service that orchestrates the customer registration use case.
 *
 * Workflow:
 * 1. Validate and create the Email value object
 * 2. Check for duplicate email
 * 3. Create the Customer aggregate
 * 4. Persist the customer
 * 5. Publish domain events (CustomerRegistered)
 *
 * This service does NOT handle password hashing — authentication is managed
 * by Better Auth in the existing infrastructure. This service is responsible
 * for creating the domain Customer record that mirrors the auth user.
 */
export class RegisterCustomerService {
  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly eventBus: IEventBus,
  ) {}

  async execute(request: RegisterCustomerRequest): Promise<RegisterCustomerResult> {
    // 1. Validate email
    const email = Email.create(request.email);

    // 2. Check for duplicate email
    const existing = await this.customerRepository.findByEmail(email);
    if (existing) {
      throw new DuplicateEmailError(email.value);
    }

    // 3. Create Customer aggregate
    const customer = Customer.create({
      id: request.id ?? uuidv4(),
      email,
      name: request.name,
      firstName: request.firstName,
      lastName: request.lastName,
      phoneNumber: request.phoneNumber,
      emailVerified: request.emailVerified ?? false,
    });

    // 4. Persist
    await this.customerRepository.save(customer);

    // 5. Publish domain events
    await this.eventBus.publish(customer.domainEvents as any[]);
    customer.clearEvents();

    return {
      customerId: customer.id,
      email: customer.email.value,
      name: customer.name,
    };
  }
}
