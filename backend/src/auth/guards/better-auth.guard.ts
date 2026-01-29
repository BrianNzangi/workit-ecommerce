import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { auth } from '../better-auth.config';

@Injectable()
export class BetterAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const sessionToken = request.cookies['better-auth.session_token'] ||
            request.cookies['__Secure-better-auth.session_token'];

        if (!sessionToken) {
            throw new UnauthorizedException('No session token');
        }

        try {
            // Better-auth expects Request object or Headers object
            // Here we pass the headers from the request
            const session = await auth.api.getSession({
                headers: request.headers,
            });

            if (!session?.user) {
                throw new UnauthorizedException('Invalid session');
            }

            request.user = session.user;
            return true;
        } catch (error) {
            console.error('Better Auth verification error:', error);
            throw new UnauthorizedException('Session verification failed');
        }
    }
}