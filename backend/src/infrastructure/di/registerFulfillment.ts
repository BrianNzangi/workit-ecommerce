import { Container, DI_TOKENS } from './container.js';
import { ShippingMethodRepository } from '../persistence/repositories/ShippingMethodRepository.js';

/**
 * Register all Fulfillment bounded context services in the DI container.
 *
 * No prerequisites required — the Fulfillment context is self-contained.
 */
export function registerFulfillment(container: Container): void {
  // ─── Repositories ────────────────────────────────────────────────────────────
  container.registerSingleton(
    DI_TOKENS.ShippingMethodRepository,
    () => new ShippingMethodRepository(),
  );
}
