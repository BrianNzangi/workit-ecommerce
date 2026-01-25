ALTER TABLE "Address" DROP CONSTRAINT "Address_customerId_Customer_id_fk";
--> statement-breakpoint
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_Customer_id_fk";
--> statement-breakpoint
ALTER TABLE "Address" ADD CONSTRAINT "Address_customerId_user_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_user_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;