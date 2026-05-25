type Constructor<T> = new (...args: unknown[]) => T;
type Factory<T> = () => T;
type Token<T> = string | symbol | Constructor<T>;

interface Registration<T> {
  factory: Factory<T>;
  singleton: boolean;
  instance?: T;
}

/**
 * Simple dependency injection container.
 * Supports singleton and transient registrations.
 */
export class Container {
  private readonly registrations = new Map<Token<unknown>, Registration<unknown>>();

  /**
   * Register a singleton service. The same instance is returned on every resolve.
   */
  registerSingleton<T>(token: Token<T>, factory: Factory<T>): void {
    this.registrations.set(token as Token<unknown>, {
      factory: factory as Factory<unknown>,
      singleton: true,
    });
  }

  /**
   * Register a transient service. A new instance is created on every resolve.
   */
  registerTransient<T>(token: Token<T>, factory: Factory<T>): void {
    this.registrations.set(token as Token<unknown>, {
      factory: factory as Factory<unknown>,
      singleton: false,
    });
  }

  /**
   * Resolve a registered service by token.
   * Throws if the token has not been registered.
   */
  resolve<T>(token: Token<T>): T {
    const registration = this.registrations.get(token as Token<unknown>) as Registration<T> | undefined;

    if (!registration) {
      const tokenName = typeof token === 'function' ? token.name : String(token);
      throw new Error(`No registration found for token: ${tokenName}`);
    }

    if (registration.singleton) {
      if (registration.instance === undefined) {
        registration.instance = registration.factory();
      }
      return registration.instance as T;
    }

    return registration.factory();
  }

  /**
   * Check if a token has been registered.
   */
  has<T>(token: Token<T>): boolean {
    return this.registrations.has(token as Token<unknown>);
  }

  /**
   * Clear all registrations. Useful for testing.
   */
  clear(): void {
    this.registrations.clear();
  }
}

/**
 * The global application DI container instance.
 */
export const container = new Container();

// ─── DI Tokens ───────────────────────────────────────────────────────────────
// Centralised token definitions to avoid magic strings scattered across the app.

export const DI_TOKENS = {
  // Infrastructure
  EventBus: 'IEventBus',
  UnitOfWork: 'IUnitOfWork',

  // Order Management - Repositories
  OrderRepository: 'IOrderRepository',
  CartRepository: 'ICartRepository',

  // Order Management - Mappers
  OrderMapper: 'OrderMapper',
  CartMapper: 'CartMapper',

  // Order Management - Domain Services
  PricingService: 'PricingService',
  OrderStateService: 'OrderStateService',
  PaymentVerificationService: 'PaymentVerificationService',

  // Order Management - Application Services
  PlaceOrderService: 'PlaceOrderService',
  VerifyPaymentService: 'VerifyPaymentService',
  AddToCartService: 'AddToCartService',

  // Catalog - Repositories
  ProductRepository: 'IProductRepository',

  // Catalog - Mappers
  ProductMapper: 'ProductMapper',

  // Catalog - Domain Services
  StockAllocationService: 'StockAllocationService',

  // Catalog - Application Services
  SearchProductsService: 'SearchProductsService',

  // Customer Management - Repositories
  CustomerRepository: 'ICustomerRepository',

  // Customer Management - Mappers
  CustomerMapper: 'CustomerMapper',

  // Customer Management - Application Services
  RegisterCustomerService: 'RegisterCustomerService',

  // Marketing - Repositories
  CampaignRepository: 'ICampaignRepository',

  // Marketing - Mappers
  CampaignMapper: 'CampaignMapper',

  // Fulfillment - Repositories
  ShippingMethodRepository: 'IShippingMethodRepository',
} as const;
