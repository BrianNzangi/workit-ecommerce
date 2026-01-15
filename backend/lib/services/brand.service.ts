import { PrismaClient } from '@prisma/client';

export interface CreateBrandInput {
    name: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
    enabled?: boolean;
}

export interface UpdateBrandInput {
    name?: string;
    slug?: string;
    description?: string;
    logoUrl?: string;
    enabled?: boolean;
}

export interface GetBrandsOptions {
    take?: number;
    skip?: number;
    enabled?: boolean;
}

export class BrandService {
    constructor(private prisma: PrismaClient) { }

    async createBrand(input: CreateBrandInput) {
        const slug = input.slug || this.generateSlug(input.name);

        return this.prisma.brand.create({
            data: {
                name: input.name,
                slug,
                description: input.description,
                logoUrl: input.logoUrl,
                enabled: input.enabled ?? true,
            },
        });
    }

    async getBrands(options: GetBrandsOptions = {}) {
        const where: any = {};

        if (options.enabled !== undefined) {
            where.enabled = options.enabled;
        }

        return this.prisma.brand.findMany({
            where,
            take: options.take,
            skip: options.skip,
            orderBy: {
                name: 'asc',
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
    }

    async getBrandById(id: string) {
        return this.prisma.brand.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
    }

    async getBrandBySlug(slug: string) {
        return this.prisma.brand.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });
    }

    async updateBrand(id: string, input: UpdateBrandInput) {
        return this.prisma.brand.update({
            where: { id },
            data: input,
        });
    }

    async deleteBrand(id: string) {
        return this.prisma.brand.delete({
            where: { id },
        });
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
}
