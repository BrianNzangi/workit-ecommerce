import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./index.js";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.warn("DATABASE_URL is not defined, skipping help center seeding.");
    process.exit(0);
}

const SETTING_KEY = "page_help_center";

const articles = [
    // ===== ORDERS (5 articles) =====
    {
        id: "hc-order-tracking",
        title: "How do I track my order?",
        category: "Orders",
        content: `<p>Once your order is placed and shipped, you will receive a confirmation email with a tracking number. You can also track your order directly from your account dashboard under "My Orders" at any time.</p>
<p>If you did not receive a tracking email, check your spam folder or contact our support team with your order number and we will resend the tracking details.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-order-modify-cancel",
        title: "Can I change or cancel my order?",
        category: "Orders",
        content: `<p>Orders can be modified or canceled within 1 hour of placement, provided they have not entered the processing stage. Contact our support team immediately with your order number to request changes.</p>
<p>Once an order has entered processing or shipping, we cannot cancel or modify it. In this case, you may initiate a return after delivery following our return policy.</p>
<p>To request a change: reach out to us via the contact form below or through your account help options. Include your order number and the changes you need.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-order-delivery-issues",
        title: "My order arrived damaged or is missing items",
        category: "Orders",
        content: `<p>We are sorry to hear that your order arrived in less than perfect condition. Please contact us within 48 hours of delivery with the following information:</p>
<ul>
  <li>Your order number</li>
  <li>Photos of the damaged item and packaging</li>
  <li>A description of what is damaged or missing</li>
</ul>
<p>We will arrange a replacement or full refund at no extra cost to you. Missing items will be shipped out promptly once confirmed.</p>
<p>Our support team typically responds within 24 hours during business days.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-order-delivery-times",
        title: "How long does delivery take and what are the options?",
        category: "Orders",
        content: `<p>We offer the following delivery options:</p>
<ul>
  <li><strong>Standard Delivery:</strong> 3–5 business days within Nairobi, 5–7 business days for other regions</li>
  <li><strong>Express Delivery:</strong> 1–2 business days (available at checkout)</li>
  <li><strong>Same-Day Delivery:</strong> Available in select Nairobi areas for orders placed before 12 PM</li>
</ul>
<p>Delivery times start counting from the moment your order is shipped, not from when it is placed. You will receive SMS updates with tracking information once your package is on its way.</p>
<p>If your order is delayed beyond the estimated timeframe, please contact our support team and we will investigate.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-order-address-missed",
        title: "Can I change my delivery address or what if I miss my delivery?",
        category: "Orders",
        content: `<h3>Changing your delivery address</h3>
<p>Yes — if the order has not yet been shipped. Contact us immediately with your order number and the corrected address. Once shipped, we cannot redirect packages.</p>
<h3>Missed delivery</h3>
<p>Our courier will attempt delivery twice. If both attempts fail, the package will be held at the nearest pickup station for 7 days. You will receive SMS updates with pickup instructions and location details.</p>
<p>If you do not collect your package within 7 days, it will be returned to us. Refunds for uncollected items are processed minus the original shipping cost.</p>`,
        lastUpdated: new Date().toISOString(),
    },

    // ===== PAYMENTS (5 articles) =====
    {
        id: "hc-payment-methods",
        title: "What payment methods do you accept and is it secure?",
        category: "Payments",
        content: `<p>We accept the following payment methods:</p>
<ul>
  <li><strong>M-Pesa</strong> — Pay directly from your mobile money account</li>
  <li><strong>Visa & Mastercard</strong> — Credit and debit cards accepted</li>
  <li><strong>American Express</strong></li>
  <li><strong>Mobile Money Transfers</strong></li>
</ul>
<p>All payments are processed securely through our encrypted payment gateway. Your card details are never stored on our servers — we use industry-standard SSL encryption and PCI-compliant payment processors to keep your information safe.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-payment-declined",
        title: "Why was my payment declined and what can I do?",
        category: "Payments",
        content: `<p>Payments can be declined for several reasons. Here is what to check:</p>
<ul>
  <li><strong>Insufficient funds</strong> — Ensure your account or card has enough balance</li>
  <li><strong>Incorrect card details</strong> — Double-check the card number, expiry date, and CVV</li>
  <li><strong>Expired card</strong> — Make sure your card has not expired</li>
  <li><strong>Bank security block</strong> — Your bank may have flagged the transaction. Contact them to authorize it</li>
</ul>
<p>If the issue persists, try an alternative payment method such as M-Pesa. You can also try clearing your browser cache or using a different device. Contact our support team if you continue to experience issues.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-payment-refunds",
        title: "How do refunds work and when will I receive mine?",
        category: "Payments",
        content: `<p>Refunds are processed within 5–7 business days after we receive and inspect your returned item. The refund will be credited to your original payment method.</p>
<p>Refund timelines by method:</p>
<ul>
  <li><strong>M-Pesa:</strong> Instant once initiated by our team</li>
  <li><strong>Card (Visa/Mastercard/Amex):</strong> 5–7 business days to reflect in your account</li>
</ul>
<p>Partial refunds are issued when only part of your order is returned or if an item arrives with a minor defect. Contact our support team with your order number and details, and we will process the partial refund within 3 business days.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-payment-invoices-billing",
        title: "How do I get an invoice and why was I overcharged?",
        category: "Payments",
        content: `<h3>Getting an invoice</h3>
<p>A digital invoice is attached to your order confirmation email. You can also download invoices from your account dashboard under "My Orders" at any time. If you need a specific invoice format, contact our support team.</p>
<h3>Overcharged or unexpected charges</h3>
<p>If you were charged more than the order total, this may include:</p>
<ul>
  <li>Delivery fees</li>
  <li>Taxes</li>
  <li>Express shipping surcharges</li>
  <li>Remote area location surcharges</li>
</ul>
<p>Review your order summary at checkout before completing the purchase. If you believe it is an error, contact our support team with your order number and we will investigate.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-payment-installments",
        title: "Can I pay in installments or use foreign currency?",
        category: "Payments",
        content: `<h3>Installments (Buy Now, Pay Later)</h3>
<p>Yes, we offer buy-now-pay-later options through select partners. This option is available at checkout for orders above KES 5,000. Subject to partner approval. Look for the installment payment option when checking out.</p>
<h3>Currency</h3>
<p>All prices are listed in Kenyan Shillings (KES). If you are using a foreign card, your bank will handle the currency conversion at their prevailing exchange rate. We currently deliver within Kenya only, so no customs or import duties apply.</p>`,
        lastUpdated: new Date().toISOString(),
    },

    // ===== TECHNICAL (5 articles) =====
    {
        id: "hc-technical-login",
        title: "I cannot log in to my account — what should I do?",
        category: "Technical",
        content: `<p>If you are having trouble logging in, try the following steps:</p>
<ol>
  <li>Click the "Forgot Password" link on the login page to reset your password</li>
  <li>Clear your browser cache and cookies</li>
  <li>Try using an incognito or private browsing window</li>
  <li>Try a different browser or device</li>
</ol>
<p>If you still cannot log in, your account may be locked due to multiple failed attempts. Wait 15 minutes and try again. If the issue persists, contact our support team with your registered email address and we will assist you.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-technical-password",
        title: "How do I reset my password or update my account details?",
        category: "Technical",
        content: `<h3>Resetting your password</h3>
<p>Go to the login page and click "Forgot Password". Enter your registered email address, and we will send you a password reset link. The link expires after 1 hour for security reasons. If you do not receive the email, check your spam folder.</p>
<h3>Updating account details</h3>
<p>Log in to your account and navigate to "Account Settings". From there, you can update:</p>
<ul>
  <li>Your name</li>
  <li>Email address (verification required)</li>
  <li>Phone number</li>
  <li>Delivery addresses</li>
</ul>
<p>Changes to your email address will require you to verify the new address before it takes effect.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-technical-website-issues",
        title: "The website is slow or not working correctly",
        category: "Technical",
        content: `<p>If you are experiencing website issues, try the following troubleshooting steps:</p>
<ul>
  <li><strong>Slow loading:</strong> Refresh the page, clear your browser cache, or switch to a different browser. Check your internet connection speed.</li>
  <li><strong>Pages not displaying correctly:</strong> Clear your browsing data (cache and cookies) and restart your browser.</li>
  <li><strong>Payment errors:</strong> Refresh the page and try again, use a different payment method, or try a different device.</li>
</ul>
<p>To clear your browsing data, go to your browser settings, navigate to "Privacy & Security", select "Clear Browsing Data", and check "Cookies" and "Cached images and files". Restart your browser afterwards.</p>
<p>If problems persist, contact our support team with a screenshot of the issue and details about your browser and device.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-technical-emails-notifications",
        title: "Why am I not receiving emails or notifications?",
        category: "Technical",
        content: `<p>If you are not receiving our emails, here is what to check:</p>
<ol>
  <li>Check your spam or promotions folder — our emails may have been filtered there</li>
  <li>Add our sending email address to your contacts list to prevent future filtering</li>
  <li>Verify that your email address is correct in your account settings</li>
  <li>Update your email preferences in your account settings to ensure notifications are enabled</li>
</ol>
<p>If you still do not receive emails after trying the above, contact our support team. We can verify your email address on our end and check if there are any delivery failures from our mail system.</p>`,
        lastUpdated: new Date().toISOString(),
    },
    {
        id: "hc-technical-privacy-account",
        title: "Is my data safe and how do I delete my account?",
        category: "Technical",
        content: `<h3>Data privacy and security</h3>
<p>Yes, we take data protection seriously. We comply with Kenya's Data Protection Act. Your personal information is encrypted and never shared with third parties without your explicit consent. Read our Privacy Policy for more details on how we handle your data.</p>
<h3>Deleting your account</h3>
<p>To delete your account, contact our support team with your account email and a request for deletion. Please be aware that:</p>
<ul>
  <li>Account deletion is irreversible</li>
  <li>It will remove your order history, saved addresses, and preferences</li>
  <li>Processing takes up to 48 hours</li>
</ul>
<p>If you only want to unsubscribe from marketing emails, you can do this from your account settings without deleting your account.</p>`,
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
