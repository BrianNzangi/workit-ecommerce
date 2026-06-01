CREATE TYPE "public"."ReviewStatus" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "Review" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"customerId" text NOT NULL,
	"orderId" text NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(255),
	"comment" text NOT NULL,
	"status" "ReviewStatus" DEFAULT 'PENDING' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_customerId_user_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_Order_id_fk" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Review_product_idx" ON "Review" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "Review_customer_idx" ON "Review" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "Review_status_idx" ON "Review" USING btree ("status");--> statement-breakpoint
CREATE INDEX "Review_product_status_idx" ON "Review" USING btree ("productId","status");