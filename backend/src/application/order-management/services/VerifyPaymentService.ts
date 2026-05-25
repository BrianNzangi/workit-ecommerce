import { v4 as uuidv4 } from 'uuid';
import { IOrderRepository } from '../../../domain/order-management/repositories/IOrderRepository.js';
import { ICartRepository } from '../../../domain/order-management/repositories/ICartRepository.js';
import { PaymentVerificationService } from '../../../domain/order-management/services/PaymentVerificationService.js';
import { IEventBus } from '../../shared/IEventBus.js';
import { IUnitOfWork } from '../../shared/IUnitOfWork.js';

export interface VerifyPaymentRequest {
  orderId: string;
  paymentReference: string;
  /** Optional: the authenticated user ID for authorization checks. */
  userId?: string;
}

export interface VerifyPaymentResult {
  orderId: string;
  message: string;
  tracking: {
    orderId: string;
    code: string;
    total: number;
    currencyCode: string;
    customerId: string;
  };
}

/**
 * Application service that orchestrates the payment verification use case.
 *
 * Workflow:
 * 1. Load the order
 * 2. Authorize the requesting user (if provided)
 * 3. Check if already verified (idempotent)
 * 4. Verify the payment with Paystack via PaymentVerificationService
 * 5. Settle the payment on the Order aggregate
 * 6. Persist the updated order
 * 7. Clear the customer's cart
 * 8. Publish domain events
 */
export class VerifyPaymentService {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly cartRepository: ICartRepository,
    private readonly paymentVerificationService: PaymentVerificationService,
    private readonly eventBus: IEventBus,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(request: VerifyPaymentRequest): Promise<VerifyPaymentResult> {
    return this.unitOfWork.transaction(async () => {
      // 1. Load order
      const order = await this.orderRepository.findById(request.orderId);
      if (!order) {
        throw new Error(`Order not found: ${request.orderId}`);
      }

      // 2. Authorization check
      if (request.userId && order.customerId !== request.userId) {
        throw new Error('Not authorized to verify this order');
      }

      // 3. Idempotency: already settled
      if (order.state === 'PAYMENT_SETTLED') {
        return {
          orderId: order.id,
          message: 'Order already verified',
          tracking: {
            orderId: order.id,
            code: order.code.value,
            total: order.total.amount,
            currencyCode: order.currencyCode,
            customerId: order.customerId,
          },
        };
      }

      // 4. Verify payment with Paystack
      const payment = await this.paymentVerificationService.verifyPayment({
        paymentId: uuidv4(),
        order,
        paymentReference: request.paymentReference,
      });

      // 5. Settle payment on the Order aggregate
      order.settlePayment(payment);

      // 6. Persist updated order
      await this.orderRepository.save(order);

      // 7. Clear the customer's cart
      const cart = await this.cartRepository.findByCustomerId(order.customerId);
      if (cart) {
        await this.cartRepository.delete(cart.id);
      }

      // 8. Publish domain events
      await this.eventBus.publish(order.domainEvents as any[]);
      order.clearEvents();

      return {
        orderId: order.id,
        message: 'Order verified',
        tracking: {
          orderId: order.id,
          code: order.code.value,
          total: order.total.amount,
          currencyCode: order.currencyCode,
          customerId: order.customerId,
        },
      };
    });
  }
}
