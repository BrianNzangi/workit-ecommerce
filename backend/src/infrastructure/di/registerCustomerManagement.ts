import { Container, DI_TOKENS } from './container.js';
import { CustomerMapper } from '../persistence/mappers/CustomerMapper.js';
import { CustomerRepository } from '../persistence/repositories/CustomerRepository.js';
import { RegisterCustomerService } from '../../application/customer-management/services/RegisterCustomerService.js';
import { IEventBus } from '../../application/shared/IEventBus.js';

/**
 * Register all Customer Management bounded context services in the DI container.
 *
 * Prerequisites: EventBus must already be registered.
 */
export function registerCustomerManagement(container: Container): void {
  // ─── Mappers ────────────────────────────────────────────────────────────────
  container.registerSingleton(DI_TOKENS.CustomerMapper, () => new CustomerMapper());

  // ─── Repositories ────────────────────────────────────────────────────────────
  container.registerSingleton(
    DI_TOKENS.CustomerRepository,
    () => new CustomerRepository(),
  );

  // ─── Application Services ────────────────────────────────────────────────────
  container.registerSingleton(
    DI_TOKENS.RegisterCustomerService,
    () =>
      new RegisterCustomerService(
        container.resolve(DI_TOKENS.CustomerRepository),
        container.resolve<IEventBus>(DI_TOKENS.EventBus),
      ),
  );
}
