import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext, GraphQLContext } from './context';
import { GraphQLError } from 'graphql';
import { ErrorCode, internalError } from './errors';
import { Prisma } from '@prisma/client';

/**
 * Transform Prisma errors into user-friendly GraphQL errors
 */
function handlePrismaError(error: any): GraphQLError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      const target = error.meta?.target as string[] | undefined;
      const field = target?.[0];
      return new GraphQLError(`Duplicate value for field: ${field || 'unknown'}`, {
        extensions: {
          code: ErrorCode.DUPLICATE_ERROR,
          field,
          details: error.meta,
        },
      });
    }

    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return new GraphQLError('Referenced record does not exist', {
        extensions: {
          code: ErrorCode.VALIDATION_ERROR,
          details: error.meta,
        },
      });
    }

    // Handle record not found
    if (error.code === 'P2025') {
      return new GraphQLError('Record not found', {
        extensions: {
          code: ErrorCode.NOT_FOUND,
          details: error.meta,
        },
      });
    }

    // Generic Prisma error
    return new GraphQLError('Database operation failed', {
      extensions: {
        code: ErrorCode.DATABASE_ERROR,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new GraphQLError('Invalid data provided', {
      extensions: {
        code: ErrorCode.VALIDATION_ERROR,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }

  // Return original error if it's already a GraphQLError
  if (error instanceof GraphQLError) {
    return error;
  }

  // Generic error
  return internalError(
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? error.message : undefined
  );
}

/**
 * Create the GraphQL schema with resolvers
 */
const schema = createSchema<GraphQLContext>({
  typeDefs,
  resolvers,
});

/**
 * Create and configure the GraphQL Yoga server for Admin
 */
export const yoga = createYoga<GraphQLContext>({
  schema,
  context: async ({ request }) => createContext(request),
  graphqlEndpoint: '/api/graphql',

  cors: {
    origin: process.env.ADMIN_URL ? [process.env.ADMIN_URL] : ['http://localhost:3001'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['POST', 'GET', 'OPTIONS'],
  },

  // Error handling and formatting
  maskedErrors: {
    maskError(error: unknown, message: string, isDev?: boolean) {
      // Transform Prisma errors
      const transformedError = handlePrismaError(error);

      // Ensure all errors have proper structure
      if (transformedError instanceof GraphQLError) {
        // Make sure extensions.code exists
        if (!transformedError.extensions?.code) {
          return new GraphQLError(transformedError.message, {
            extensions: {
              code: ErrorCode.INTERNAL_ERROR,
              ...transformedError.extensions,
            },
          });
        }
        return transformedError;
      }

      // Fallback for unexpected errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      return internalError(
        isDev ? message : 'An unexpected error occurred',
        isDev ? errorMessage : undefined
      );
    },
  },

  // Logging
  logging: {
    debug: (...args) => {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[GraphQL Debug]', ...args);
      }
    },
    info: (...args) => {
      console.info('[GraphQL Info]', ...args);
    },
    warn: (...args) => {
      console.warn('[GraphQL Warn]', ...args);
    },
    error: (...args) => {
      console.error('[GraphQL Error]', ...args);
    },
  },
});
