import { CanActivate, ExecutionContext } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '@workit/db';
export declare class BetterAuthGuard implements CanActivate {
    private db;
    constructor(db: PostgresJsDatabase<typeof schema>);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
