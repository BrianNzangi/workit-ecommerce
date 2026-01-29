import { CanActivate, ExecutionContext, Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { DRIZZLE } from '../../database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
import { eq, and, gt } from 'drizzle-orm';

@Injectable()
export class BetterAuthGuard implements CanActivate {
    constructor(
        @Inject(DRIZZLE) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // 1. Extract session token from cookie
        const sessionToken = request.cookies['better-auth.session_token'] ||
            request.cookies['__Secure-better-auth.session_token'] ||
            request.headers['authorization']?.replace('Bearer ', '');

        console.log('Debug - All cookies:', request.cookies);
        console.log('Debug - Session token:', sessionToken);

        if (!sessionToken) {
            console.log('No session token found');
            throw new UnauthorizedException('No session token found');
        }

        // 2. Query the session table
        const session = await this.db.query.session.findFirst({
            where: and(
                eq(schema.session.token, sessionToken),
                gt(schema.session.expiresAt, new Date())
            ),
            with: {
                user: true
            }
        });

        console.log('Debug - Session found:', !!session);
        console.log('Debug - Session data:', session ? 'yes' : 'no');

        if (!session || !session.userId) {
            console.log('Invalid or expired session');
            throw new UnauthorizedException('Invalid or expired session');
        }

        // 3. Attach user to request
        request.user = session.user;
        console.log('User authenticated:', session.user.email);
        return true;
    }
}