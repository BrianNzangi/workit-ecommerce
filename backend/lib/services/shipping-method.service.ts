import { PrismaClient, ShippingMethod, Prisma } from '@prisma/client';
import {
  validationError,
  notFoundError,
  duplicateError,
} from '@/lib/graphql/errors';

export interface CreateShippingMethodInput {
  code: string;
  name: string;
  description?: string | null;

  enabled?: boolean;
}

export interface UpdateShippingMethodInput {
  code?: string;
  name?: string;
  description?: string | null;

  enabled?: boolean;
}

export interface ShippingMethodListOptions {
  take?: number;
  skip?: number;
  enabledOnly?: boolean;
}

export class ShippingMethodService {
  constructor(private prisma: PrismaClient) { }

  /**
   * Create a new shipping method
   */
  async createShippingMethod(input: CreateShippingMethodInput): Promise<ShippingMethod> {
    // Validate required fields
    if (!input.code || input.code.trim().length === 0) {
      throw validationError('Shipping method code is required', 'code');
    }

    if (!input.name || input.name.trim().length === 0) {
      throw validationError('Shipping method name is required', 'name');
    }



    try {
      const shippingMethod = await this.prisma.shippingMethod.create({
        data: {
          code: input.code.trim(),
          name: input.name.trim(),
          description: input.description?.trim() || null,

          enabled: input.enabled ?? true,
        },
      });

      return shippingMethod;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A shipping method with this code already exists', 'code');
        }
      }
      throw error;
    }
  }

  /**
   * Update an existing shipping method
   */
  async updateShippingMethod(
    id: string,
    input: UpdateShippingMethodInput
  ): Promise<ShippingMethod> {
    // Check if shipping method exists
    const existingMethod = await this.prisma.shippingMethod.findUnique({
      where: { id },
    });

    if (!existingMethod) {
      throw notFoundError('Shipping method not found');
    }

    // Prepare update data
    const updateData: Prisma.ShippingMethodUpdateInput = {};

    if (input.code !== undefined) {
      if (!input.code || input.code.trim().length === 0) {
        throw validationError('Shipping method code cannot be empty', 'code');
      }
      updateData.code = input.code.trim();
    }

    if (input.name !== undefined) {
      if (!input.name || input.name.trim().length === 0) {
        throw validationError('Shipping method name cannot be empty', 'name');
      }
      updateData.name = input.name.trim();
    }

    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
    }



    if (input.enabled !== undefined) {
      updateData.enabled = input.enabled;
    }

    try {
      const shippingMethod = await this.prisma.shippingMethod.update({
        where: { id },
        data: updateData,
      });

      return shippingMethod;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw duplicateError('A shipping method with this code already exists', 'code');
        }
        if (error.code === 'P2025') {
          throw notFoundError('Shipping method not found');
        }
      }
      throw error;
    }
  }

  /**
   * Get a single shipping method by ID
   */
  async getShippingMethod(id: string): Promise<ShippingMethod | null> {
    const shippingMethod = await this.prisma.shippingMethod.findUnique({
      where: { id },
    });

    return shippingMethod;
  }

  /**
   * Get a list of shipping methods with optional filtering
   */
  async getShippingMethods(
    options: ShippingMethodListOptions = {}
  ): Promise<ShippingMethod[]> {
    const { take = 50, skip = 0, enabledOnly = false } = options;

    const where: Prisma.ShippingMethodWhereInput = {};

    // Filter by enabled status if requested
    if (enabledOnly) {
      where.enabled = true;
    }

    const shippingMethods = await this.prisma.shippingMethod.findMany({
      where,
      take,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return shippingMethods;
  }

  /**
   * Delete a shipping method
   */
  async deleteShippingMethod(id: string): Promise<boolean> {
    try {
      await this.prisma.shippingMethod.delete({
        where: { id },
      });

      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw notFoundError('Shipping method not found');
        }
      }
      throw error;
    }
  }
}
