import pkg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config();

const { Client } = pkg;

async function runMigration() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:##@Scottish!@localhost:5433/workit_backed_db?schema=public';
    console.log('🔗 Connecting to database...');
    const client = new Client({
        connectionString
    });

    try {
        await client.connect();
        console.log('🔄 Running marketing module migration...');

        // Create enums
        await client.query(`
            DO $$ BEGIN
                CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'SENT', 'PAUSED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await client.query(`
            DO $$ BEGIN
                CREATE TYPE "SubscriberStatus" AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await client.query(`
            DO $$ BEGIN
                CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await client.query(`
            DO $$ BEGIN
                CREATE TYPE "AutomationType" AS ENUM ('ABANDONED_CHECKOUT', 'ABANDONED_CART', 'ABANDONED_BROWSE', 'WELCOME_SUBSCRIBER', 'POST_PURCHASE', 'WIN_BACK', 'BIRTHDAY', 'PRODUCT_RECOMMENDATION');
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        // Create MarketingCampaign table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "MarketingCampaign" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "subject" TEXT NOT NULL,
                "content" TEXT NOT NULL,
                "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
                "recipientSegment" TEXT,
                "openRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "clickRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "sentAt" TIMESTAMP(3),
                "scheduledAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id")
            );
        `);

        // Create MarketingSubscriber table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "MarketingSubscriber" (
                "id" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "firstName" TEXT,
                "lastName" TEXT,
                "status" "SubscriberStatus" NOT NULL DEFAULT 'SUBSCRIBED',
                "source" TEXT,
                "tags" TEXT[],
                "customerId" TEXT,
                "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "unsubscribedAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "MarketingSubscriber_pkey" PRIMARY KEY ("id")
            );
        `);

        // Create MarketingEmail table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "MarketingEmail" (
                "id" TEXT NOT NULL,
                "campaignId" TEXT NOT NULL,
                "subscriberId" TEXT NOT NULL,
                "subject" TEXT NOT NULL,
                "content" TEXT NOT NULL,
                "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
                "openedAt" TIMESTAMP(3),
                "clickedAt" TIMESTAMP(3),
                "openRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "clickRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
                "revenue" INTEGER NOT NULL DEFAULT 0,
                "sentAt" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "MarketingEmail_pkey" PRIMARY KEY ("id")
            );
        `);

        // Create MarketingAutomation table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "MarketingAutomation" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "type" "AutomationType" NOT NULL,
                "trigger" TEXT NOT NULL,
                "enabled" BOOLEAN NOT NULL DEFAULT false,
                "emailTemplate" TEXT NOT NULL,
                "subject" TEXT NOT NULL,
                "delayMinutes" INTEGER NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "MarketingAutomation_pkey" PRIMARY KEY ("id")
            );
        `);

        // Create indexes
        await client.query(`CREATE INDEX IF NOT EXISTS "MarketingCampaign_status_idx" ON "MarketingCampaign"("status");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "MarketingCampaign_createdAt_idx" ON "MarketingCampaign"("createdAt");`);
        await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "MarketingSubscriber_email_key" ON "MarketingSubscriber"("email");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "MarketingSubscriber_email_idx" ON "MarketingSubscriber"("email");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "MarketingSubscriber_status_idx" ON "MarketingSubscriber"("status");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "MarketingEmail_campaignId_idx" ON "MarketingEmail"("campaignId");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "MarketingEmail_subscriberId_idx" ON "MarketingEmail"("subscriberId");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "MarketingEmail_status_idx" ON "MarketingEmail"("status");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "MarketingAutomation_type_idx" ON "MarketingAutomation"("type");`);
        await client.query(`CREATE INDEX IF NOT EXISTS "MarketingAutomation_enabled_idx" ON "MarketingAutomation"("enabled");`);

        // Add foreign keys
        await client.query(`
            DO $$ BEGIN
                ALTER TABLE "MarketingEmail" ADD CONSTRAINT "MarketingEmail_campaignId_fkey" 
                FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await client.query(`
            DO $$ BEGIN
                ALTER TABLE "MarketingEmail" ADD CONSTRAINT "MarketingEmail_subscriberId_fkey" 
                FOREIGN KEY ("subscriberId") REFERENCES "MarketingSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        console.log('✅ Marketing module migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await client.end();
    }
}

runMigration();
