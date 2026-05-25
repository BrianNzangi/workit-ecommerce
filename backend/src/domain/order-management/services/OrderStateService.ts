import { Order, OrderState } from '../aggregates/Order.js';
import { InvalidStateTransitionError } from '../errors/InvalidStateTransitionError.js';

/**
 * Domain service for validating and performing Order state transitions.
 *
 * While the Order aggregate enforces transitions internally, this service
 * provides a higher-level API for use cases that need to query or validate
 * transitions without actually performing them.
 */
export class OrderStateService {
  /** All valid state transitions: from → [allowed to states] */
  private static readonly VALID_TRANSITIONS: Record<OrderState, OrderState[]> = {
    CREATED: ['PAYMENT_PENDING', 'PAYMENT_SETTLED', 'CANCELLED'],
    PAYMENT_PENDING: ['PAYMENT_AUTHORIZED', 'PAYMENT_SETTLED', 'CANCELLED'],
    PAYMENT_AUTHORIZED: ['PAYMENT_SETTLED', 'CANCELLED'],
    PAYMENT_SETTLED: ['SHIPPED', 'DELIVERED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
  };

  /**
   * Check whether a transition from one state to another is valid.
   */
  isValidTransition(from: OrderState, to: OrderState): boolean {
    const allowed = OrderStateService.VALID_TRANSITIONS[from];
    return allowed?.includes(to) ?? false;
  }

  /**
   * Return all states that an order in the given state can transition to.
   */
  getAllowedTransitions(from: OrderState): OrderState[] {
    return [...(OrderStateService.VALID_TRANSITIONS[from] ?? [])];
  }

  /**
   * Validate that a transition is allowed and throw if not.
   *
   * @throws {InvalidStateTransitionError} if the transition is not allowed
   */
  validateTransition(from: OrderState, to: OrderState): void {
    if (!this.isValidTransition(from, to)) {
      const allowed = this.getAllowedTransitions(from);
      throw new InvalidStateTransitionError(
        `Cannot transition Order from '${from}' to '${to}'. ` +
          `Allowed transitions: [${allowed.join(', ') || 'none'}]`,
      );
    }
  }

  /**
   * Transition an order to a new state after validating the transition.
   *
   * @throws {InvalidStateTransitionError} if the transition is not allowed
   */
  transition(order: Order, newState: OrderState): void {
    this.validateTransition(order.state, newState);
    order.transitionTo(newState);
  }
}
