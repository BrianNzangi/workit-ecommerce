import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        // In production, this MUST be set in environment variables
        const internalApiKey = this.configService.get<string>('INTERNAL_API_KEY');

        // If no key is configured in dev, we can allow for easier development
        // but in production, we should be strict
        if (!internalApiKey) {
            if (process.env.NODE_ENV === 'production') {
                throw new UnauthorizedException('API Key not configured on server');
            }
            return true;
        }

        if (apiKey !== internalApiKey) {
            throw new UnauthorizedException('Invalid API Key');
        }

        return true;
    }
}
