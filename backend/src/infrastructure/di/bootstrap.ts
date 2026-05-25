/**
 * DI Container Bootstrap
 *
 * Initialises the global DI container by registering all bounded context
 * services. Called once at application startup before any routes are served.
 */
import { container, DI_TOKENS } from './container.js';
import { registerOrderManagement } from './registerOrderManagement.js';
import { registerCatalog } from './registerCatalog.js';
import { registerCustomerManagement } from './registerCustomerManagement.js';
import { registerFulfillment } from './registerFulfillment.js';
import { registerMarketing } from './registerMarketing.js';
import { EventBus } from '../events/EventBus.js';
import { DrizzleUnitOfWork } from '../persistence/unit-of-work/DrizzleUnitOfWork.js';
import { IPaystackClient, PaystackVerificationData } from '../../domain/order-management/services/PaymentVerificationService.js';
import { db } from '../../lib/db.js';

/**
 * Paystack HTTP client implementation.
 * Calls the Paystack verify endpoint and returns normalised data.
 */
const paystackClient: IPaystackClient = {
  async verifyTransaction(reference: string): Promise<PaystackVerificationData> {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      throw new Error('PAYSTACK_SECRET_KEY is not configured');
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secret}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Paystack API error ${response.status}: ${text}`);
    }

    const payload = JSON.parse(text);
    const data = payload?.data;

    return {
      status: data?.status ?? 'failed',
      amount: Number(data?.amount ?? 0),
      currency: String(data?.currency ?? 'KES'),
      reference: String(data?.reference ?? reference),
      id: data?.id,
      metadata: data?.metadata ?? {},
    };
  },
};

/**
 * Bootstrap the DI container.
 * Safe to call multiple times — registrations are idempotent via singleton caching.
 */
export function bootstrapContainer(): void {
  // ─── Infrastructure ──────────────────────────────────────────────────────────
  container.registerSingleton(DI_TOKENS.EventBus, () => new EventBus());
  container.registerSingleton(DI_TOKENS.UnitOfWork, () => new DrizzleUnitOfWork(db as any));

  // ─── Bounded Contexts ────────────────────────────────────────────────────────
  registerCatalog(container);
  registerCustomerManagement(container);
  registerFulfillment(container);
  registerMarketing(container);
  registerOrderManagement(container, paystackClient);
}
