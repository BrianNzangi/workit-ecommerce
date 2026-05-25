import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./index.js";
import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../../.env") });
dotenv.config({ path: resolve(__dirname, "../.env") });
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.warn("DATABASE_URL is not defined, skipping help center seeding.");
    process.exit(0);
}

const SETTING_KEY = "page_help_center";

const articles = [
    {
        id: "hc-order-tracking",
        title: "Order Tracking, Changes & Delivery Issues",
        category: "Orders",
        content: `<h2>How do I track my order?</h2>
<p>Once your order is placed and shipped, you will receive a confirmation email with a tracking number. You can also track your order directly from your account dashboard under "My Orders".</p>

<h2>Can I change or cancel my order?</h2>
<p>Orders can be modified or canceled within 1 hour of placement, provided they have not entered the processing stage. Contact our support team immediately with your order number to request changes.</p>

<h2>What should I do if my order arrives damaged?</h2>
<p>We are sorry to hear that. Please contact us within 48 hours of delivery with photos of the damaged item and packaging. We will arrange a replacement or full refund at no extra cost to you.</p>

<h2>My order is missing items — what now?</h2>
<p>Check your packing slip against the items received. If something is missing, reach out to our support team with your order number and a description of the missing item. We will ship the missing items promptly.</p>

<h2>How long does delivery take?</h2>
<p>Standard delivery takes 3–5 business days within Nairobi and 5–7 business days for other regions. Express delivery is available at checkout for 1–2 business day delivery.</p>

<h2>Can I change my delivery address after placing an order?</h2>
<p>Yes — if the order has not yet been shipped. Contact us immediately with your order number and the corrected address. Once shipped, we cannot redirect packages.</p>

<h2>What happens if I am not home at the time of delivery?</h2>
<p>Our courier will attempt delivery twice. If both attempts fail, the package will be held at the nearest pickup station for 7 days. You will receive SMS updates with pickup instructions.</p>

<h2>Do you offer same-day delivery?</h2>
<p>Same-day delivery is available in select areas within Nairobi for orders placed before 12 PM. Look for the "Same-Day Delivery" option at checkout.</p>

<h2>How do I know my order is confirmed?</h2>
<p>After placing your order, you will receive an order confirmation email with your order number and a summary of your purchase. If you do not receive this email within 15 minutes, check your spam folder or contact support.</p>

<h2>Can I combine shipping for multiple orders?</h2>
<p>Unfortunately, we cannot combine shipping for separate orders. Each order is processed and shipped independently.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-payments",
        title: "Payment Methods, Billing & Refunds",
        category: "Payments",
        content: `<h2>What payment methods do you accept?</h2>
<p>We accept M-Pesa, Visa, Mastercard, American Express, and mobile money transfers. All payments are processed securely through our encrypted payment gateway.</p>

<h2>Is my payment information secure?</h2>
<p>Absolutely. We use industry-standard SSL encryption and PCI-compliant payment processors. Your card details are never stored on our servers.</p>

<h2>Why was my payment declined?</h2>
<p>Payments can be declined due to insufficient funds, incorrect card details, expired cards, or bank security blocks. Try double-checking your payment details or contact your bank to authorize the transaction. If the issue persists, try an alternative payment method.</p>

<h2>When will my refund be processed?</h2>
<p>Refunds are processed within 5–7 business days after we receive and inspect your returned item. The refund will be credited to your original payment method. M-Pesa refunds are instant once initiated.</p>

<h2>How do I get an invoice for my purchase?</h2>
<p>A digital invoice is attached to your order confirmation email. You can also download invoices from your account dashboard under "My Orders" at any time.</p>

<h2>Can I pay in installments?</h2>
<p>Yes, we offer buy-now-pay-later options through select partners. This option is available at checkout for orders above KES 5,000. Subject to approval.</p>

<h2>What currency are prices listed in?</h2>
<p>All prices are listed in Kenyan Shillings (KES). If you are using a foreign card, your bank will handle the currency conversion at their prevailing exchange rate.</p>

<h2>Why was I charged more than the order total?</h2>
<p>This may include delivery fees, taxes, or additional charges for express shipping. Review your order summary at checkout. If you believe it is an error, contact our support team with your order number.</p>

<h2>Do you charge customs fees for international orders?</h2>
<p>We currently deliver within Kenya only, so no customs or import duties apply. If you are shipping to a remote area, a small location surcharge may apply and will be shown at checkout.</p>

<h2>How do I get a partial refund?</h2>
<p>Partial refunds are issued when only part of your order is returned or if an item arrives with a minor defect. Contact our support team with your order number and details, and we will process the partial refund within 3 business days.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-technical",
        title: "Account Access, Technical Issues & Troubleshooting",
        category: "Technical",
        content: `<h2>I cannot log in to my account — what should I do?</h2>
<p>Click the "Forgot Password" link on the login page to reset your password. If you still cannot log in, clear your browser cache and cookies, or try using an incognito/private browsing window. If the issue persists, contact our support team.</p>

<h2>How do I reset my password?</h2>
<p>Go to the login page and click "Forgot Password". Enter your registered email address, and we will send you a password reset link. The link expires after 1 hour for security reasons.</p>

<h2>Why is the website loading slowly?</h2>
<p>Slow loading can be caused by your internet connection, browser cache, or temporary server issues. Try refreshing the page, clearing your browser cache, or switching to a different browser. If the problem continues, check your internet speed or contact us.</p>

<h2>I am seeing a payment error message — what does it mean?</h2>
<p>Payment errors are usually temporary. Try the following steps: refresh the page and try again, use a different payment method, clear your browser cache, or try a different device or browser. If the error persists, contact our support team with a screenshot of the error message.</p>

<h2>How do I update my account details?</h2>
<p>Log in to your account and navigate to "Account Settings". From there, you can update your name, email address, phone number, and delivery addresses. Changes to your email address will require verification.</p>

<h2>Why am I not receiving email notifications?</h2>
<p>Check your spam or promotions folder. Add our email address to your contacts list. If you still do not receive emails, update your email preferences in your account settings or contact support to verify your email address is correct.</p>

<h2>The mobile app is not working — what can I do?</h2>
<p>First, ensure you have the latest version of the app installed. Try force-closing the app and reopening it. If that does not work, uninstall and reinstall the app. Make sure your device has a stable internet connection.</p>

<h2>How do I clear my browsing data?</h2>
<p>In your browser settings, navigate to "Privacy & Security" and select "Clear Browsing Data". Make sure to check "Cookies and other site data" and "Cached images and files". Restart your browser after clearing.</p>

<h2>Is my personal data safe with you?</h2>
<p>Yes, we take data protection seriously. We comply with Kenya's Data Protection Act. Your personal information is encrypted and never shared with third parties without your consent. Read our Privacy Policy for more details.</p>

<h2>How do I delete my account?</h2>
<p>To delete your account, contact our support team with your account email and a request for deletion. Account deletion is irreversible and will remove your order history, saved addresses, and preferences. Processing takes up to 48 hours.</p>`,
        lastUpdated: new Date().toISOString(),
    },
];

async function seedHelpCenter() {
    console.log("--- Seeding Help Center Articles ---");

    const client = postgres(connectionString!);
    const db = drizzle(client, { schema });

    try {
        const existing = await db.query.settings.findFirst({
            where: eq(schema.settings.key, SETTING_KEY),
        });

        const value = JSON.stringify({
            articles,
            updatedAt: new Date().toISOString(),
        });

        if (existing) {
            await db
                .update(schema.settings)
                .set({ value, updatedAt: new Date() })
                .where(eq(schema.settings.key, SETTING_KEY));
            console.log("Updated existing help center articles.");
        } else {
            await db.insert(schema.settings).values({
                id: "setting-" + Math.random().toString(36).substring(7),
                key: SETTING_KEY,
                value,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log("Created help center articles.");
        }

        console.log(`Seeded ${articles.length} articles:`);
        for (const article of articles) {
            console.log(`  - [${article.category}] ${article.title}`);
        }
        console.log("--- Help Center Seeding Completed ---");
    } catch (error) {
        console.error("Failed to seed help center:", error);
        throw error;
    } finally {
        await client.end();
    }
}

seedHelpCenter().then(() => process.exit(0)).catch(() => process.exit(1));
