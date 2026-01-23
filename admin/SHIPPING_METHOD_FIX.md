## 🚨 CRITICAL: Shipping Method Database Issue

### Problem
Your product imports are failing because the `ShippingMethod` table is missing the required `'standard'` and `'express'` records.

### Solution Steps

#### Option 1: Using Prisma Studio (EASIEST - Recommended)
1. **Prisma Studio is already running** at `http://localhost:51212`
2. Open it in your browser
3. Click on **ShippingMethod** table
4. Click **Add record** and create:
   - **Record 1:**
     - id: `standard`
     - code: `standard`
     - name: `Standard Shipping`
     - description: `Regular delivery within 3-5 business days`
     - enabled: `true` (checked)
     - isExpress: `false` (unchecked)
   - **Record 2:**
     - id: `express`
     - code: `express`
     - name: `Express Shipping`
     - description: `Fast delivery within 1-2 business days`
     - enabled: `true` (checked)
     - isExpress: `true` (checked)
5. **Save both records**

#### Option 2: Using SQL (if you have database access)
Run the SQL script at: `scripts/fix-shipping-methods.sql`

#### Option 3: Re-run the seed
```bash
npx prisma db seed
```

### After Adding the Records

**IMPORTANT:** You MUST restart your dev server to clear Next.js cache:

1. Stop the dev server (press `Ctrl+C` in the terminal running `npm run dev`)
2. Start it again: `npm run dev`
3. Try your product import again

### Why This Happened
- The `Product` table has a foreign key constraint requiring `shippingMethodId` to reference an existing `ShippingMethod.id`
- The seed file was updated to use `id` instead of `code` for upserts, but the database wasn't re-seeded
- Next.js caches the compiled code, so even after fixing the import route, it still uses the old version

### Verification
After restarting, you can verify the shipping methods exist by:
1. Opening Prisma Studio
2. Checking the ShippingMethod table
3. Confirming both `standard` and `express` records exist with those exact IDs
