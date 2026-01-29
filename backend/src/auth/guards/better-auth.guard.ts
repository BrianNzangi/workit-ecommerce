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
        let sessionToken = request.cookies['better-auth.session_token'] ||
            request.cookies['__Secure-better-auth.session_token'] ||
            request.headers['authorization']?.replace('Bearer ', '');

        if (!sessionToken) {
            throw new UnauthorizedException('No session token found');
        }

        // 2. Better Auth uses signed tokens: "sessionId.signature"
        // Extract just the sessionId part (before the dot)
        const sessionId = sessionToken.split('.')[0];

        console.log('🔍 Full token:', sessionToken);
        console.log('🔍 Session ID:', sessionId);

        // 3. Query the session table
        const [session] = await this.db
            .select()
            .from(schema.session)
            .where(
                and(
                    eq(schema.session.id, sessionId),
                    gt(schema.session.expiresAt, new Date())
                )
            )
            .limit(1);

        console.log('🔍 Session found:', !!session);

        if (!session || !session.userId) {
            throw new UnauthorizedException('Invalid or expired session');
        }

        // 4. Get the user
        const [user] = await this.db
            .select()
            .from(schema.user)
            .where(eq(schema.user.id, session.userId))
            .limit(1);

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // 5. Attach user to request
        request.user = user;
        console.log('✅ Authenticated:', user.email);
        return true;
    }
}