-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'SENT', 'PAUSED');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "AutomationType" AS ENUM ('ABANDONED_CHECKOUT', 'ABANDONED_CART', 'ABANDONED_BROWSE', 'WELCOME_SUBSCRIBER', 'POST_PURCHASE', 'WIN_BACK', 'BIRTHDAY', 'PRODUCT_RECOMMENDATION');

-- CreateTable
CREATE TABLE "MarketingCampaign" (
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

-- CreateTable
CREATE TABLE "MarketingSubscriber" (
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

-- CreateTable
CREATE TABLE "MarketingEmail" (
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

-- CreateTable
CREATE TABLE "MarketingAutomation" (
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

-- CreateIndex
CREATE INDEX "MarketingCampaign_status_idx" ON "MarketingCampaign"("status");

-- CreateIndex
CREATE INDEX "MarketingCampaign_createdAt_idx" ON "MarketingCampaign"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingSubscriber_email_key" ON "MarketingSubscriber"("email");

-- CreateIndex
CREATE INDEX "MarketingSubscriber_email_idx" ON "MarketingSubscriber"("email");

-- CreateIndex
CREATE INDEX "MarketingSubscriber_status_idx" ON "MarketingSubscriber"("status");

-- CreateIndex
CREATE INDEX "MarketingEmail_campaignId_idx" ON "MarketingEmail"("campaignId");

-- CreateIndex
CREATE INDEX "MarketingEmail_subscriberId_idx" ON "MarketingEmail"("subscriberId");

-- CreateIndex
CREATE INDEX "MarketingEmail_status_idx" ON "MarketingEmail"("status");

-- CreateIndex
CREATE INDEX "MarketingAutomation_type_idx" ON "MarketingAutomation"("type");

-- CreateIndex
CREATE INDEX "MarketingAutomation_enabled_idx" ON "MarketingAutomation"("enabled");

-- AddForeignKey
ALTER TABLE "MarketingEmail" ADD CONSTRAINT "MarketingEmail_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingEmail" ADD CONSTRAINT "MarketingEmail_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "MarketingSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
