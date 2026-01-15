import { PrismaClient, Order, OrderLine, OrderState, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface CreateOrderLineInput {
  variantId: string;
  quantity: number;
}

export interface OrderAddressInput {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  country?: string;
  phoneNumber: string;
}

export interface CreateOrderInput {
  // Option 1: Existing customer with saved addresses
  customerId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;

  // Option 2: New customer or guest checkout with inline data
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  password?: string; // Optional - if provided, creates account; if not, creates guest customer

  // Inline address data (required if addressIds not provided)
  shippingAddress?: OrderAddressInput;
  billingAddress?: OrderAddressInput; // Optional - uses shipping address if not provided

  // Order details
  lines: CreateOrderLineInput[];
  shippingMethodId?: string; // For reference only
  shippingCost?: number; // Actual shipping cost in cents
  tax?: number;
}

export interface OrderListOptions {
  take?: number;
  skip?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'total';
  sortOrder?: 'asc' | 'desc';
  state?: OrderState;
}

export interface OrderSearchOptions {
  take?: number;
  skip?: number;
}

export class OrderService {
  constructor(private prisma: PrismaClient) { }

  /**
   * Generate a unique order code
   */
  private async generateOrderCode(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `ORD-${timestamp}-${random}`;

    // Ensure uniqueness
    const existing = await this.prisma.order.findUnique({
      where: { code },
    });

    if (existing) {
      // Recursively try again if collision (very unlikely)
      return this.generateOrderCode();
    }

    return code;
  }

  /**
   * Calculate order totals
   */
  private async calculateOrderTotals(
    lines: CreateOrderLineInput[],
    shippingCost?: number,
    tax?: number
  ): Promise<{ subTotal: number; shipping: number; tax: number; total: number }> {
    // Calculate subtotal from line items
    let subTotal = 0;

    for (const line of lines) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: line.variantId },
      });

      if (!variant) {
        throw notFoundError(`Variant with ID ${line.variantId} not found`);
      }

      // Convert price from Float to cents (Int)
      const priceInCents = Math.round(variant.price * 100);
      subTotal += priceInCents * line.quantity;
    }

    // Use provided shipping cost (already in cents) or default to 0
    const shipping = shippingCost ?? 0;

    // Calculate tax (default to 0 if not provided)
    const taxAmount = tax ?? 0;

    // Calculate total
    const total = subTotal + shipping + taxAmount;

    return {
      subTotal,
      shipping,
      tax: taxAmount,
      total,
    };
  }

  /**
   * Create a new order from checkout data
   * Supports both existing customers and new customer creation
   */
  async createOrder(input: CreateOrderInput): Promise<Order> {
    // Validate that we have either customerId OR email+name
    if (!input.customerId && !input.email) {
      throw validationError('Either customerId or email is required', 'customerId');
    }

    if (!input.lines || input.lines.length === 0) {
      throw validationError('Order must have at least one line item', 'lines');
    }

    let customerId: string;
    let shippingAddressId: string | undefined;
    let billingAddressId: string | undefined;

    // Handle customer creation/lookup
    if (input.customerId) {
      // Option 1: Existing customer
      customerId = input.customerId;

      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw notFoundError('Customer not found');
      }

      // Use provided address IDs
      shippingAddressId = input.shippingAddressId;
      billingAddressId = input.billingAddressId;

      // Validate addresses if provided
      if (shippingAddressId) {
        const shippingAddress = await this.prisma.address.findUnique({
          where: { id: shippingAddressId },
        });

        if (!shippingAddress) {
          throw notFoundError('Shipping address not found');
        }
      }

      if (billingAddressId) {
        const billingAddress = await this.prisma.address.findUnique({
          where: { id: billingAddressId },
        });

        if (!billingAddress) {
          throw notFoundError('Billing address not found');
        }
      }
    } else {
      // Option 2: New customer or guest checkout
      if (!input.email || !input.firstName || !input.lastName) {
        throw validationError(
          'Email, firstName, and lastName are required for new customers',
          'email'
        );
      }

      if (!input.shippingAddress) {
        throw validationError(
          'Shipping address is required for new customers',
          'shippingAddress'
        );
      }

      // Check if customer already exists by email
      let customer = await this.prisma.customer.findUnique({
        where: { email: input.email },
      });

      if (customer) {
        // Customer exists, use their ID
        customerId = customer.id;
      } else {
        // Create new customer
        const passwordHash = input.password
          ? await bcrypt.hash(input.password, 10)
          : await bcrypt.hash(Math.random().toString(36), 10); // Random password for guest

        customer = await this.prisma.customer.create({
          data: {
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
            phoneNumber: input.phoneNumber,
            passwordHash,
            enabled: true,
          },
        });

        customerId = customer.id;
      }

      // Create shipping address
      const shippingAddress = await this.prisma.address.create({
        data: {
          customerId,
          fullName: input.shippingAddress.fullName,
          streetLine1: input.shippingAddress.streetLine1,
          streetLine2: input.shippingAddress.streetLine2,
          city: input.shippingAddress.city,
          province: input.shippingAddress.province,
          postalCode: input.shippingAddress.postalCode,
          country: input.shippingAddress.country || 'Kenya',
          phoneNumber: input.shippingAddress.phoneNumber,
          defaultShipping: true,
          defaultBilling: false,
        },
      });

      shippingAddressId = shippingAddress.id;

      // Create billing address (or use shipping address)
      if (input.billingAddress) {
        const billingAddress = await this.prisma.address.create({
          data: {
            customerId,
            fullName: input.billingAddress.fullName,
            streetLine1: input.billingAddress.streetLine1,
            streetLine2: input.billingAddress.streetLine2,
            city: input.billingAddress.city,
            province: input.billingAddress.province,
            postalCode: input.billingAddress.postalCode,
            country: input.billingAddress.country || 'Kenya',
            phoneNumber: input.billingAddress.phoneNumber,
            defaultShipping: false,
            defaultBilling: true,
          },
        });

        billingAddressId = billingAddress.id;
      } else {
        // Use shipping address as billing address
        billingAddressId = shippingAddressId;
      }
    }

    // Validate line items
    for (const line of input.lines) {
      if (!line.variantId) {
        throw validationError('Variant ID is required for each line item', 'variantId');
      }

      if (!line.quantity || line.quantity <= 0) {
        throw validationError('Quantity must be greater than 0', 'quantity');
      }

      // Check variant exists and has sufficient stock
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: line.variantId },
      });

      if (!variant) {
        throw notFoundError(`Variant with ID ${line.variantId} not found`);
      }

      if (variant.stockOnHand < line.quantity) {
        throw validationError(
          `Insufficient stock for variant ${variant.sku}. Available: ${variant.stockOnHand}, Requested: ${line.quantity}`,
          'quantity'
        );
      }
    }

    // Generate order code
    const code = await this.generateOrderCode();

    // Calculate totals
    const totals = await this.calculateOrderTotals(
      input.lines,
      input.shippingCost,
      input.tax
    );

    // Validate shipping method if provided
    let validatedShippingMethodId: string | null = null;
    if (input.shippingMethodId) {
      const shippingMethod = await this.prisma.shippingMethod.findUnique({
        where: { id: input.shippingMethodId },
      });

      if (shippingMethod) {
        validatedShippingMethodId = input.shippingMethodId;
      }
      // If shipping method doesn't exist, set to null instead of throwing error
    }

    // Create order with lines in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          code,
          customerId,
          state: OrderState.CREATED,
          subTotal: totals.subTotal,
          shipping: totals.shipping,
          tax: totals.tax,
          total: totals.total,
          currencyCode: 'KES',
          shippingAddressId,
          billingAddressId,
          shippingMethodId: validatedShippingMethodId,
        },
        include: {
          lines: true,
          customer: true,
          shippingAddress: true,
          billingAddress: true,
          payments: true,
        },
      });

      // Create order lines and decrement stock
      for (const line of input.lines) {
        const variant = await tx.productVariant.findUnique({
          where: { id: line.variantId },
        });

        if (!variant) {
          throw notFoundError(`Variant with ID ${line.variantId} not found`);
        }

        const linePrice = Math.round(variant.price * 100) * line.quantity;

        await tx.orderLine.create({
          data: {
            orderId: newOrder.id,
            variantId: line.variantId,
            quantity: line.quantity,
            linePrice,
          },
        });

        // Decrement stock quantity
        const newStockLevel = variant.stockOnHand - line.quantity;
        await tx.productVariant.update({
          where: { id: line.variantId },
          data: {
            stockOnHand: newStockLevel,
          },
        });
      }

      // Fetch the complete order with all relations
      const completeOrder = await tx.order.findUnique({
        where: { id: newOrder.id },
        include: {
          lines: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
          customer: true,
          shippingAddress: true,
          billingAddress: true,
          payments: true,
          shippingMethod: true,
        },
      });

      return completeOrder!;
    });

    return order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, state: OrderState): Promise<Order> {
    // Check if order exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { id },
      include: {
        lines: true,
      },
    });

    if (!existingOrder) {
      throw notFoundError('Order not found');
    }

    // Validate state transition (basic validation)
    if (!Object.values(OrderState).includes(state)) {
      throw validationError('Invalid order state', 'state');
    }

    // If transitioning to CANCELLED, restore stock
    const shouldRestoreStock =
      state === OrderState.CANCELLED &&
      existingOrder.state !== OrderState.CANCELLED;

    // Update order in a transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          state,
          updatedAt: new Date(),
        },
        include: {
          lines: {
            include: {
              variant: {
                include: {
                  product: true,
                },
              },
            },
          },
          customer: true,
          shippingAddress: true,
          billingAddress: true,
          payments: true,
          shippingMethod: true,
        },
      });

      // Restore stock if order is being cancelled
      if (shouldRestoreStock) {
        for (const line of existingOrder.lines) {
          const variant = await tx.productVariant.findUnique({
            where: { id: line.variantId },
          });

          if (variant) {
            await tx.productVariant.update({
              where: { id: line.variantId },
              data: {
                stockOnHand: variant.stockOnHand + line.quantity,
              },
            });
          }
        }
      }

      return updatedOrder;
    });

    return order;
  }

  /**
   * Get a single order by ID
   */
  async getOrder(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        customer: true,
        shippingAddress: true,
        billingAddress: true,
        payments: true,
        shippingMethod: true,
      },
    });

    return order;
  }

  /**
   * Get a list of orders with pagination and sorting
   */
  async getOrders(options: OrderListOptions = {}): Promise<Order[]> {
    const {
      take = 50,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      state,
    } = options;

    const where: Prisma.OrderWhereInput = {};

    // Filter by state if provided
    if (state) {
      where.state = state;
    }

    const orders = await this.prisma.order.findMany({
      where,
      take,
      skip,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        lines: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        customer: true,
        shippingAddress: true,
        billingAddress: true,
        payments: true,
        shippingMethod: true,
      },
    });

    return orders;
  }

  /**
   * Search orders by code, customer name, or email
   */
  async searchOrders(
    searchTerm: string,
    options: OrderSearchOptions = {}
  ): Promise<Order[]> {
    const { take = 50, skip = 0 } = options;

    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { code: { contains: searchTerm, mode: 'insensitive' } },
          {
            customer: {
              firstName: { contains: searchTerm, mode: 'insensitive' },
            },
          },
          {
            customer: {
              lastName: { contains: searchTerm, mode: 'insensitive' },
            },
          },
          {
            customer: {
              email: { contains: searchTerm, mode: 'insensitive' },
            },
          },
        ],
      },
      take,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        lines: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        customer: true,
        shippingAddress: true,
        billingAddress: true,
        payments: true,
        shippingMethod: true,
      },
    });

    return orders;
  }

  /**
   * Get inventory levels for all variants
   */
  async getInventory(options: { lowStockThreshold?: number } = {}) {
    const { lowStockThreshold } = options;

    const where: Prisma.ProductVariantWhereInput = {
      product: {
        deletedAt: null,
      },
    };

    // Filter by low stock if threshold provided
    if (lowStockThreshold !== undefined) {
      where.stockOnHand = { lte: lowStockThreshold };
    }

    const variants = await this.prisma.productVariant.findMany({
      where,
      include: {
        product: true,
        asset: true,
      },
      orderBy: {
        stockOnHand: 'asc',
      },
    });

    return variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      productName: variant.product.name,
      stockOnHand: variant.stockOnHand,
      price: variant.price,
      enabled: variant.enabled,
    }));
  }
}
