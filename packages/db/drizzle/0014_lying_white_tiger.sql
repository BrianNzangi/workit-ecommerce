CREATE TABLE "ProductView" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"sessionId" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ProductView" ADD CONSTRAINT "ProductView_productId_Product_id_fk" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE cascade ON UPDATE no action;