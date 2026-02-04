import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext, GraphQLContext } from './context';
import { GraphQLError } from 'graphql';
import { ErrorCode, internalError } from './errors';

/**
 * Create the GraphQL schema with resolvers for Storefront
 */
const schema = createSchema<GraphQLContext>({
    typeDefs,
    resolvers,
});

/**
 * Create and configure the GraphQL Yoga server for Storefront
 */
export const storefrontYoga = createYoga<GraphQLContext>({
    schema,
    context: async ({ request }) => createContext(request),
    graphqlEndpoint: '/api/store',

    cors: {
        origin: process.env.STOREFRONT_URL ? [process.env.STOREFRONT_URL] : ['http://localhost:3000'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['POST', 'GET', 'OPTIONS'],
    },

    // Error handling and formatting
    maskedErrors: {
        maskError(error: unknown, message: string, isDev?: boolean) {
            // Ensure all errors have proper structure
            if (error instanceof GraphQLError) {
                // Make sure extensions.code exists
                if (!error.extensions?.code) {
                    return new GraphQLError(error.message, {
                        extensions: {
                            code: ErrorCode.INTERNAL_ERROR,
                            ...error.extensions,
                        },
                    });
                }
                return error;
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
                console.debug('[Storefront GraphQL Debug]', ...args);
            }
        },
        info: (...args) => {
            console.info('[Storefront GraphQL Info]', ...args);
        },
        warn: (...args) => {
            console.warn('[Storefront GraphQL Warn]', ...args);
        },
        error: (...args) => {
            console.error('[Storefront GraphQL Error]', ...args);
        },
    },
});
