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

        console.log('Debug - Session token:', sessionToken);

        if (!sessionToken) {
            console.log('No session token found');
            throw new UnauthorizedException('No session token found');
        }

        // 2. Query the session table - Better Auth uses 'id' not 'token'
        const [session] = await this.db
            .select()
            .from(schema.session)
            .where(
                and(
                    eq(schema.session.id, sessionToken),  // Changed from token to id
                    gt(schema.session.expiresAt, new Date())
                )
            )
            .limit(1);

        console.log('Debug - Session found:', !!session);

        if (!session || !session.userId) {
            console.log('Invalid or expired session');
            throw new UnauthorizedException('Invalid or expired session');
        }

        // 3. Get the user
        const [user] = await this.db
            .select()
            .from(schema.user)
            .where(eq(schema.user.id, session.userId))
            .limit(1);

        if (!user) {
            console.log('User not found');
            throw new UnauthorizedException('User not found');
        }

        // 4. Attach user to request
        request.user = user;
        console.log('User authenticated:', user.email);
        return true;
    }
}