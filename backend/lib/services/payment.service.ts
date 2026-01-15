import { PrismaClient, Payment, PaymentState, OrderState } from '@prisma/client';
import crypto from 'crypto';
import {
  validationError,
  notFoundError,
  externalServiceError,
} from '@/lib/graphql/errors';

// Define Paystack response types
interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface InitializePaymentInput {
  orderId: string;
  email: string;
  amount: number; // In cents
  callbackUrl?: string;
}

export interface InitializePaymentResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface WebhookPayload {
  event: string;
  data: {
    reference: string;
    status: string;
    amount: number;
    customer: {
      email: string;
    };
    metadata?: any;
  };
}

export class PaymentService {
  private paystackSecretKey: string;
  private paystackBaseUrl = 'https://api.paystack.co';

  constructor(private prisma: PrismaClient) {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY || '';
    
    if (!this.paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY environment variable is not set');
    }
  }

  /**
   * Make authenticated HTTP requests to Paystack API
   */
  private async callPaystackAPI<T>(
    endpoint: string,
    method: string,
    body?: any
  ): Promise<T> {
    try {
      const response = await fetch(`${this.paystackBaseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        // Extract error message from Paystack response
        const errorMessage = data.message || `HTTP ${response.status}: ${response.statusText}`;
        throw externalServiceError(`Paystack API error: ${errorMessage}`);
      }

      return data as T;
    } catch (error: any) {
      // If it's already one of our custom errors, rethrow it
      if (error.extensions?.code) {
        throw error;
      }

      // Otherwise, wrap it as an external service error
      throw externalServiceError(
        `Failed to call Paystack API: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Initialize a payment with Paystack
   */
  async initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResponse> {
    // Validate required fields
    if (!input.orderId) {
      throw validationError('Order ID is required', 'orderId');
    }

    if (!input.email) {
      throw validationError('Email is required', 'email');
    }

    if (!input.amount || input.amount <= 0) {
      throw validationError('Amount must be greater than 0', 'amount');
    }

    // Verify order exists
    const order = await this.prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        customer: true,
      },
    });

    if (!order) {
      throw notFoundError('Order not found');
    }

    // Verify order amount matches
    if (order.total !== input.amount) {
      throw validationError(
        `Amount mismatch. Order total: ${order.total}, Payment amount: ${input.amount}`,
        'amount'
      );
    }

    try {
      // Initialize payment with Paystack
      // Amount should be in kobo (smallest currency unit) for Paystack
      // Since we store in cents, we need to convert: 1 KES = 100 cents
      const amountInKobo = input.amount;

      const response: PaystackInitializeResponse = await this.callPaystackAPI<PaystackInitializeResponse>(
        '/transaction/initialize',
        'POST',
        {
          email: input.email,
          amount: amountInKobo,
          currency: 'KES',
          callback_url: input.callbackUrl,
          metadata: {
            orderId: input.orderId,
            orderCode: order.code,
          },
        }
      );

      if (!response.status || !response.data) {
        throw externalServiceError('Failed to initialize payment with Paystack');
      }

      const { authorization_url, access_code, reference } = response.data;

      // Create payment record
      await this.prisma.payment.create({
        data: {
          orderId: input.orderId,
          method: 'paystack',
          amount: input.amount,
          state: PaymentState.PENDING,
          paystackRef: reference,
          metadata: {
            accessCode: access_code,
            authorizationUrl: authorization_url,
          },
        },
      });

      // Update order status to PAYMENT_PENDING
      await this.prisma.order.update({
        where: { id: input.orderId },
        data: {
          state: OrderState.PAYMENT_PENDING,
        },
      });

      return {
        authorizationUrl: authorization_url,
        accessCode: access_code,
        reference,
      };
    } catch (error: any) {
      // Log error for debugging
      console.error('Paystack initialization error:', error);

      // If it's already one of our custom errors, rethrow it
      if (error.extensions?.code) {
        throw error;
      }

      // Otherwise, wrap it as an external service error
      throw externalServiceError(
        `Failed to initialize payment: ${error.message || 'Unknown error'}`
      );
    }
  }

  /**
   * Verify webhook signature from Paystack
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!signature) {
      return false;
    }

    const hash = crypto
      .createHmac('sha512', this.paystackSecretKey)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Handle payment confirmation from webhook
   */
  async handlePaymentConfirmation(reference: string, transactionId: string): Promise<Payment> {
    // Find payment by reference
    const payment = await this.prisma.payment.findUnique({
      where: { paystackRef: reference },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw notFoundError(`Payment with reference ${reference} not found`);
    }

    // Update payment and order in a transaction
    const updatedPayment = await this.prisma.$transaction(async (tx) => {
      // Update payment status
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          state: PaymentState.SETTLED,
          transactionId,
          updatedAt: new Date(),
        },
        include: {
          order: true,
        },
      });

      // Update order status to PAYMENT_SETTLED
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          state: OrderState.PAYMENT_SETTLED,
          updatedAt: new Date(),
        },
      });

      return updated;
    });

    return updatedPayment;
  }

  /**
   * Handle payment failure from webhook
   */
  async handlePaymentFailure(reference: string, errorMessage: string): Promise<Payment> {
    // Find payment by reference
    const payment = await this.prisma.payment.findUnique({
      where: { paystackRef: reference },
      include: {
        order: true,
      },
    });

    if (!payment) {
      throw notFoundError(`Payment with reference ${reference} not found`);
    }

    // Update payment and order in a transaction
    const updatedPayment = await this.prisma.$transaction(async (tx) => {
      // Update payment status
      const updated = await tx.payment.update({
        where: { id: payment.id },
        data: {
          state: PaymentState.DECLINED,
          errorMessage,
          updatedAt: new Date(),
        },
        include: {
          order: true,
        },
      });

      // Keep order in PAYMENT_PENDING state (don't change to DECLINED)
      // This allows customer to retry payment
      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          updatedAt: new Date(),
        },
      });

      return updated;
    });

    return updatedPayment;
  }

  /**
   * Process webhook event
   */
  async processWebhook(payload: WebhookPayload): Promise<void> {
    const { event, data } = payload;

    if (event === 'charge.success') {
      // Payment was successful
      await this.handlePaymentConfirmation(
        data.reference,
        data.reference // Using reference as transaction ID
      );
    } else if (event === 'charge.failed') {
      // Payment failed
      await this.handlePaymentFailure(
        data.reference,
        data.status || 'Payment failed'
      );
    }
    // Ignore other events
  }

  /**
   * Get payment by reference
   */
  async getPaymentByReference(reference: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findUnique({
      where: { paystackRef: reference },
      include: {
        order: {
          include: {
            customer: true,
            lines: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return payment;
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<Payment | null> {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        order: {
          include: {
            customer: true,
          },
        },
      },
    });

    return payment;
  }
}
