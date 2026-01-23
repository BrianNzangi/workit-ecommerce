import { apiClient } from '@/lib/api-client';
import {
  validationError,
  externalServiceError,
  notFoundError,
} from '@/lib/graphql/errors';

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

export class PaymentService {
  constructor() { }

  /**
   * Initialize a payment via NestJS API
   */
  async initializePayment(input: InitializePaymentInput): Promise<InitializePaymentResponse> {
    try {
      const response = await apiClient.post<any>('/payments/initialize', input);
      return {
        authorizationUrl: response.authorizationUrl,
        accessCode: response.accessCode,
        reference: response.reference,
      };
    } catch (error: any) {
      throw validationError(error.message || 'Failed to initialize payment');
    }
  }

  /**
   * Get payment by reference via NestJS API
   */
  async getPaymentByReference(reference: string): Promise<any | null> {
    try {
      const response = await apiClient.get<any>(`/payments/reference/${reference}`);
      return response;
    } catch (error: any) {
      if (error.message && error.message.includes('404')) return null;
      throw error;
    }
  }

  /**
   * Get payment by order ID via NestJS API
   */
  async getPaymentByOrderId(orderId: string): Promise<any | null> {
    try {
      const response = await apiClient.get<any>(`/payments/order/${orderId}`);
      return response;
    } catch (error: any) {
      if (error.message && error.message.includes('404')) return null;
      throw error;
    }
  }
}
