import { Customer } from '../aggregates/Customer.js';
import { Email } from '../value-objects/Email.js';

/**
 * Repository interface for the Customer aggregate.
 *
 * Defined in the Domain Layer; implemented in the Infrastructure Layer.
 * The domain layer never imports from infrastructure.
 */
export interface ICustomerRepository {
  /**
   * Find a customer by their unique ID.
   * Returns null if no customer with that ID exists.
   */
  findById(id: string): Promise<Customer | null>;

  /**
   * Find a customer by their email address.
   * Returns null if no customer with that email exists.
   */
  findByEmail(email: Email): Promise<Customer | null>;

  /**
   * Persist a Customer aggregate (insert or update).
   * Also persists all addresses belonging to the customer.
   */
  save(customer: Customer): Promise<void>;
}
