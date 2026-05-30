CREATE TABLE "customer_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"customerId" text NOT NULL,
	"emailNotifications" boolean DEFAULT true NOT NULL,
	"smsNotifications" boolean DEFAULT false NOT NULL,
	"promoNotifications" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "customer_preferences_customerId_unique" UNIQUE("customerId")
);
--> statement-breakpoint
ALTER TABLE "customer_preferences" ADD CONSTRAINT "customer_preferences_customerId_user_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "customer_preferences_customer_idx" ON "customer_preferences" USING btree ("customerId");