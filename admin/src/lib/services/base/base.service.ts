import { apiClient, adminClient } from '@/lib/clients';

export abstract class BaseService {
    protected readonly apiClient = apiClient;
    protected readonly adminClient = adminClient;

    protected handleNotFoundError(message: string): never {
        throw new Error(message);
    }

    protected handleValidationError(message: string): never {
        throw new Error(message);
    }

    protected handleUnauthorizedError(message: string): never {
        throw new Error(message);
    }
}
