import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./index.js";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.warn("DATABASE_URL is not defined, skipping seeding.");
    process.exit(0);
}

interface CatalogSeed {
    name: string;
    slug: string;
    parentSlug: string | null;
    mostShoppedSortOrder: number;
    showInMenuHeader: boolean;
    showInMostShopped: boolean;
    sortOrder: number;
}

const catalogCollections: CatalogSeed[] = [
    // ── Categories (top-level) ──
    { name: "Mobile & Tablets", slug: "mobile-tablets", parentSlug: null, mostShoppedSortOrder: 0, showInMenuHeader: false, showInMostShopped: false, sortOrder: 3 },
    { name: "Electronics", slug: "electronics", parentSlug: null, mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: true, sortOrder: 2 },
    { name: "Laptops & Accessories", slug: "laptops-accessories", parentSlug: null, mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Desktop & Monitors", slug: "desktop-monitors", parentSlug: null, mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: true, sortOrder: 2 },
    { name: "Gaming", slug: "gaming", parentSlug: null, mostShoppedSortOrder: 5, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Appliances", slug: "appliances", parentSlug: null, mostShoppedSortOrder: 6, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Networking", slug: "networking", parentSlug: null, mostShoppedSortOrder: 7, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Mobile & Tablets ── Groups ──
    { name: "Mobile Phones", slug: "mobile-phones", parentSlug: "mobile-tablets", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 3 },
    { name: "iPads & Tablets", slug: "ipads-tablets", parentSlug: "mobile-tablets", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Accessories", slug: "accessories", parentSlug: "mobile-tablets", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Wearable", slug: "wearable", parentSlug: "mobile-tablets", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Mobile Phones ── Subs ──
    { name: "iPhones", slug: "iphones", parentSlug: "mobile-phones", mostShoppedSortOrder: 1, showInMenuHeader: true, showInMostShopped: false, sortOrder: 3 },
    { name: "Xiaomi Phones", slug: "xiaomi-phones", parentSlug: "mobile-phones", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 3 },
    { name: "OnePlus Phones", slug: "oneplus-phones", parentSlug: "mobile-phones", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 3 },
    { name: "Samsung Phones", slug: "samsung-phones", parentSlug: "mobile-phones", mostShoppedSortOrder: 4, showInMenuHeader: true, showInMostShopped: false, sortOrder: 3 },
    { name: "Android Phones", slug: "android-phones", parentSlug: "mobile-phones", mostShoppedSortOrder: 5, showInMenuHeader: false, showInMostShopped: false, sortOrder: 3 },

    // ── iPads & Tablets ── Subs ──
    { name: "iPads", slug: "ipads", parentSlug: "ipads-tablets", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Samsung Tablets", slug: "samsung-tablets", parentSlug: "ipads-tablets", mostShoppedSortOrder: 2, showInMenuHeader: true, showInMostShopped: false, sortOrder: 2 },
    { name: "Microsoft Surface", slug: "microsoft-surface", parentSlug: "ipads-tablets", mostShoppedSortOrder: 3, showInMenuHeader: true, showInMostShopped: false, sortOrder: 2 },
    { name: "Tablets", slug: "tablets", parentSlug: "ipads-tablets", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Accessories (under Mobile & Tablets) ── Subs ──
    { name: "Headsets & Earphones", slug: "headsets-earphones", parentSlug: "accessories", mostShoppedSortOrder: 1, showInMenuHeader: true, showInMostShopped: false, sortOrder: 2 },
    { name: "Cases & Protectors", slug: "cases-protectors", parentSlug: "accessories", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Chargers & Cables", slug: "chargers-cables", parentSlug: "accessories", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Power Banks", slug: "power-banks", parentSlug: "accessories", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Bluetooth Speakers", slug: "bluetooth-speakers", parentSlug: "accessories", mostShoppedSortOrder: 5, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Wearable ── Subs ──
    { name: "Wearables", slug: "wearables", parentSlug: "wearable", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Smart Watches", slug: "smart-watches", parentSlug: "wearable", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Smart Rings & Accessories", slug: "smart-rings-accessories", parentSlug: "wearable", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Apple Watches", slug: "apple-watches", parentSlug: "wearable", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Xiaomi Watches", slug: "xiaomi-watches", parentSlug: "wearable", mostShoppedSortOrder: 5, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Samsung Watches", slug: "samsung-watches", parentSlug: "wearable", mostShoppedSortOrder: 6, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Electronics ── Groups ──
    { name: "Television & Video", slug: "television-video", parentSlug: "electronics", mostShoppedSortOrder: 1, showInMenuHeader: true, showInMostShopped: false, sortOrder: 2 },
    { name: "Home Audio", slug: "home-audio", parentSlug: "electronics", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Cameras", slug: "cameras", parentSlug: "electronics", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Surveillance & Security", slug: "surveillance-security", parentSlug: "electronics", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Television & Video ── Subs ──
    { name: "Smart TVs", slug: "smart-tvs", parentSlug: "television-video", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Projectors", slug: "projectors", parentSlug: "television-video", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Home Audio ── Subs ──
    { name: "Sound Bar Speakers", slug: "sound-bar-speakers", parentSlug: "home-audio", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Cameras ── Subs ──
    { name: "DSLR Cameras", slug: "dslr-cameras", parentSlug: "cameras", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Action Cameras", slug: "action-cameras", parentSlug: "cameras", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Surveillance & Security ── Subs ──
    { name: "Security Cameras", slug: "security-cameras", parentSlug: "surveillance-security", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Dashcams", slug: "dashcams", parentSlug: "surveillance-security", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Security Camera Accessories", slug: "security-camera-accessories", parentSlug: "surveillance-security", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Laptops & Accessories ── Groups ──
    { name: "Laptop", slug: "laptop", parentSlug: "laptops-accessories", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Laptop Accessories", slug: "laptop-accessories", parentSlug: "laptops-accessories", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Laptop ── Subs ──
    { name: "HP Laptops", slug: "hp-laptops", parentSlug: "laptop", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Asus Laptops", slug: "asus-laptops", parentSlug: "laptop", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Dell Laptops", slug: "dell-laptops", parentSlug: "laptop", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Lenovo Laptops", slug: "lenovo-laptops", parentSlug: "laptop", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Apple Laptops", slug: "apple-laptops", parentSlug: "laptop", mostShoppedSortOrder: 5, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Gaming Laptops", slug: "gaming-laptops", parentSlug: "laptop", mostShoppedSortOrder: 6, showInMenuHeader: true, showInMostShopped: false, sortOrder: 2 },
    { name: "Home & Office", slug: "home-office", parentSlug: "laptop", mostShoppedSortOrder: 7, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Workstation", slug: "workstation", parentSlug: "laptop", mostShoppedSortOrder: 8, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Laptop Accessories ── Subs ──
    { name: "Laptop Chargers", slug: "laptop-chargers", parentSlug: "laptop-accessories", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Laptop Batteries", slug: "laptop-batteries", parentSlug: "laptop-accessories", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Laptop Bags", slug: "laptop-bags", parentSlug: "laptop-accessories", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Docking Stations", slug: "docking-stations", parentSlug: "laptop-accessories", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Desktop & Monitors ── Groups ──
    { name: "Desktops", slug: "desktops", parentSlug: "desktop-monitors", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Computer Accessories", slug: "computer-accessories", parentSlug: "desktop-monitors", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Computer Monitors", slug: "computer-monitors", parentSlug: "desktop-monitors", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Computer Hardware", slug: "computer-hardware", parentSlug: "desktop-monitors", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Desktops ── Subs ──
    { name: "Desktops & Mini PCs", slug: "desktops-mini-pcs", parentSlug: "desktops", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Apple Desktops", slug: "apple-desktops", parentSlug: "desktops", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Gaming Desktops", slug: "gaming-desktops", parentSlug: "desktops", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Computer Accessories (under Desktop & Monitors) ── Subs ──
    { name: "Keyboards & Mice", slug: "keyboards-mice", parentSlug: "computer-accessories", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Webcams", slug: "webcams", parentSlug: "computer-accessories", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Drives & Storage", slug: "drives-storage", parentSlug: "computer-accessories", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Printers & Scanners", slug: "printers-scanners", parentSlug: "computer-accessories", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Laptop Stands", slug: "laptop-stands", parentSlug: "computer-accessories", mostShoppedSortOrder: 5, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Computer Monitors ── Subs ──
    { name: "Curved Monitors", slug: "curved-monitors", parentSlug: "computer-monitors", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Gaming Monitors", slug: "gaming-monitors", parentSlug: "computer-monitors", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Office Monitors", slug: "office-monitors", parentSlug: "computer-monitors", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Monitor Mounts & Stands", slug: "monitor-mounts-stands", parentSlug: "computer-monitors", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Computer Hardware ── Subs ──
    { name: "Graphics Cards", slug: "graphics-cards", parentSlug: "computer-hardware", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Internal Hard Drives", slug: "internal-hard-drives", parentSlug: "computer-hardware", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "RAM", slug: "ram", parentSlug: "computer-hardware", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Gaming ── Groups ──
    { name: "PC Gaming", slug: "pc-gaming", parentSlug: "gaming", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Consoles", slug: "consoles", parentSlug: "gaming", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── PC Gaming ── Subs ──
    { name: "Gaming Keyboards", slug: "gaming-keyboards", parentSlug: "pc-gaming", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Gaming Mice", slug: "gaming-mice", parentSlug: "pc-gaming", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Gaming Headsets", slug: "gaming-headsets", parentSlug: "pc-gaming", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Consoles ── Subs ──
    { name: "Gaming Consoles", slug: "gaming-consoles", parentSlug: "consoles", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Game Controllers", slug: "game-controllers", parentSlug: "consoles", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Appliances ── Groups ──
    { name: "Small Appliances", slug: "small-appliances", parentSlug: "appliances", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Large Appliances", slug: "large-appliances", parentSlug: "appliances", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Kitchen Appliances", slug: "kitchen-appliances", parentSlug: "appliances", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Small Appliances ── Subs ──
    { name: "Vacuums & Floor Care", slug: "vacuums-floor-care", parentSlug: "small-appliances", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Irons & Steamers", slug: "irons-steamers", parentSlug: "small-appliances", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Blenders", slug: "blenders", parentSlug: "small-appliances", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Coffee Machines", slug: "coffee-machines", parentSlug: "small-appliances", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Air Purifiers", slug: "air-purifiers", parentSlug: "small-appliances", mostShoppedSortOrder: 5, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Air Fryers", slug: "air-fryers", parentSlug: "small-appliances", mostShoppedSortOrder: 6, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Deep Fryers", slug: "deep-fryers", parentSlug: "small-appliances", mostShoppedSortOrder: 7, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Pressure Cookers", slug: "pressure-cookers", parentSlug: "small-appliances", mostShoppedSortOrder: 8, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Large Appliances ── Subs ──
    { name: "Washing Machines", slug: "washing-machines", parentSlug: "large-appliances", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 1 },
    { name: "Refrigerators", slug: "refrigerators", parentSlug: "large-appliances", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Freezers", slug: "freezers", parentSlug: "large-appliances", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Dishwashers", slug: "dishwashers", parentSlug: "large-appliances", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Kitchen Appliances ── Subs ──
    { name: "Ovens", slug: "ovens", parentSlug: "kitchen-appliances", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Cooktops", slug: "cooktops", parentSlug: "kitchen-appliances", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Microwaves", slug: "microwaves", parentSlug: "kitchen-appliances", mostShoppedSortOrder: 3, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Networking ── Groups ──
    { name: "Networking Devices", slug: "networking-devices", parentSlug: "networking", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },

    // ── Networking Devices ── Subs ──
    { name: "Routers", slug: "routers", parentSlug: "networking-devices", mostShoppedSortOrder: 1, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Wireless Adapters", slug: "wireless-adapters", parentSlug: "networking-devices", mostShoppedSortOrder: 2, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Access Points", slug: "access-points", parentSlug: "networking-devices", mostShoppedSortOrder: 3, showInMenuHeader: true, showInMostShopped: false, sortOrder: 2 },
    { name: "Switches", slug: "switches", parentSlug: "networking-devices", mostShoppedSortOrder: 4, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "IP Cameras", slug: "ip-cameras", parentSlug: "networking-devices", mostShoppedSortOrder: 5, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
    { name: "Range Extenders", slug: "range-extenders", parentSlug: "networking-devices", mostShoppedSortOrder: 6, showInMenuHeader: false, showInMostShopped: false, sortOrder: 2 },
];

interface HomepageSeed {
    title: string;
    slug: string;
    sortOrder: number;
}

const homepageCollections: HomepageSeed[] = [
    { title: "DAILY OFFERS", slug: "daily-offers", sortOrder: 0 },
    { title: "BEST SELLING LAPTOPS", slug: "best-selling-laptops", sortOrder: 1 },
    { title: "BLUETOOTH SPEAKERS", slug: "bluetooth-speakers", sortOrder: 2 },
    { title: "TOP MONITORS", slug: "top-monitors", sortOrder: 3 },
    { title: "FEATURED TELEVISIONS", slug: "featured-televisions", sortOrder: 4 },
    { title: "HOME AUDIO", slug: "home-audio", sortOrder: 5 },
    { title: "FEATURED HOME & KITCHEN APPLIANCES", slug: "featured-home-kitchen-appliances", sortOrder: 6 },
    { title: "POPULAR NETWORKING DEVICES", slug: "popular-networking-devices", sortOrder: 7 },
    { title: "FEATURED SMARTPHONES", slug: "featured-smartphones", sortOrder: 8 },
];

function makeId(prefix: string, slug: string): string {
    return `${prefix}-${slug}`;
}

async function upsertCollection(database: any, item: CatalogSeed, slugToId: Record<string, string>) {
    const existing = await database.query.collections.findFirst({
        where: eq(schema.collections.slug, item.slug),
    });

    const now = new Date();
    const values = {
        id: existing?.id ?? makeId("collection", item.slug),
        name: item.name,
        slug: item.slug,
        description: `${item.name} at Workit`,
        parentId: item.parentSlug ? (slugToId[item.parentSlug] ?? null) : null,
        enabled: true,
        showInMostShopped: item.showInMostShopped,
        showInMenuHeader: item.showInMenuHeader,
        mostShoppedSortOrder: item.mostShoppedSortOrder,
        sortOrder: item.sortOrder,
        assetId: null,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
    };

    if (existing) {
        await database
            .update(schema.collections)
            .set({
                name: values.name,
                slug: values.slug,
                description: values.description,
                parentId: values.parentId,
                enabled: values.enabled,
                showInMostShopped: values.showInMostShopped,
                showInMenuHeader: values.showInMenuHeader,
                mostShoppedSortOrder: values.mostShoppedSortOrder,
                sortOrder: values.sortOrder,
                assetId: values.assetId,
                updatedAt: values.updatedAt,
            })
            .where(eq(schema.collections.id, existing.id));
        return existing.id;
    }

    await database.insert(schema.collections).values(values as any);
    return values.id;
}

async function upsertHomepageCollection(database: any, item: HomepageSeed, sortOrder: number) {
    const existing = await database.query.homepageCollections.findFirst({
        where: eq(schema.homepageCollections.slug, item.slug),
    });

    const now = new Date();
    const values = {
        id: existing?.id ?? makeId("homepage-collection", item.slug),
        title: item.title,
        slug: item.slug,
        enabled: true,
        sortOrder,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
    };

    if (existing) {
        await database
            .update(schema.homepageCollections)
            .set({
                title: values.title,
                slug: values.slug,
                enabled: values.enabled,
                sortOrder: values.sortOrder,
                updatedAt: values.updatedAt,
            })
            .where(eq(schema.homepageCollections.id, existing.id));
        return existing.id;
    }

    await database.insert(schema.homepageCollections).values(values as any);
    return values.id;
}

async function seed() {
    console.log("--- Starting Database Seeding ---");

    const client = postgres(connectionString!);
    const database = drizzle(client, { schema });

    try {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@workit.co.ke";
        const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

        console.log(`Checking for admin user: ${adminEmail}`);

        const existingAdmin = await database.query.users.findFirst({
            where: eq(schema.users.email, adminEmail),
        });

        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        let adminId: string;

        if (!existingAdmin) {
            adminId = "admin-" + Math.random().toString(36).substring(7);
            await database.insert(schema.users).values({
                id: adminId,
                email: adminEmail,
                name: "Super Admin",
                emailVerified: true,
                role: "SUPER_ADMIN",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log("Admin user created.");
        } else {
            adminId = existingAdmin.id;
            if (existingAdmin.role !== "SUPER_ADMIN") {
                await database
                    .update(schema.users)
                    .set({
                        role: "SUPER_ADMIN",
                        updatedAt: new Date(),
                    })
                    .where(eq(schema.users.id, adminId));
                console.log("Promoted existing admin user to SUPER_ADMIN.");
            }
            console.log("Admin user already exists.");
        }

        const existingAccount = await database.query.account.findFirst({
            where: eq(schema.account.userId, adminId),
        });

        if (!existingAccount) {
            await database.insert(schema.account).values({
                id: "acc-" + Math.random().toString(36).substring(7),
                userId: adminId,
                accountId: adminId,
                providerId: "credential",
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log("✅ Linked auth account created.");
        }

        console.log("Seeding default shipping methods...");
        const shippingMethods = [
            {
                id: "standard",
                code: "STANDARD",
                name: "Standard Shipping",
                description: "Reliable delivery within 3-5 business days",
                enabled: true,
                isExpress: false,
            },
            {
                id: "express",
                code: "EXPRESS",
                name: "Express Shipping",
                description: "Fast delivery within 1-2 business days",
                enabled: true,
                isExpress: true,
            },
        ];

        for (const method of shippingMethods) {
            const existing = await database.query.shippingMethods.findFirst({
                where: eq(schema.shippingMethods.id, method.id),
            });

            if (!existing) {
                await database.insert(schema.shippingMethods).values({
                    ...method,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                console.log(`✅ Created shipping method: ${method.name}`);
            }
        }

        console.log("Seeding catalog collections...");
        const slugToId: Record<string, string> = {};
        for (const collection of catalogCollections) {
            const id = await upsertCollection(database, collection, slugToId);
            slugToId[collection.slug] = id;
        }
        console.log(`✅ Seeded ${catalogCollections.length} collections.`);

        console.log("Seeding homepage collections...");
        for (const collection of homepageCollections) {
            await upsertHomepageCollection(database, collection, collection.sortOrder);
        }
        console.log(`✅ Seeded ${homepageCollections.length} homepage collections.`);

        console.log("--- Seeding Completed Successfully ---");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        throw error;
    } finally {
        await client.end();
    }
}

seed().then(() => process.exit(0)).catch(() => process.exit(1));
