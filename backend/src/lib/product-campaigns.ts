export const normalizeCampaignDate = (value: unknown): Date | null => {
    if (!value) return null;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const fromKesMinorUnits = (value?: number | null) => {
    if (value === null || value === undefined) return 0;
    return Number(value) / 100;
};

const roundCurrency = (value: number) => Number(value.toFixed(2));

const formatKesAmount = (value: number) =>
    value.toLocaleString("en-US", {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    });

const isCampaignActiveNow = (campaign: any, now = new Date()) => {
    if (!campaign) return false;
    if (campaign.status !== "ACTIVE") return false;

    const startsAt = normalizeCampaignDate(campaign.startDate);
    const endsAt = normalizeCampaignDate(campaign.endDate);

    if (startsAt && startsAt > now) return false;
    if (endsAt && endsAt < now) return false;
    return true;
};

const getBaseProductPrice = (product: any) => {
    const rawValue = product?.salePrice ?? product?.price ?? 0;
    const numericValue = Number(rawValue);
    return Number.isFinite(numericValue) ? numericValue : 0;
};

const buildPromotionBadgeText = (campaign: any) => {
    const couponCode = typeof campaign?.couponCode === "string"
        ? campaign.couponCode.trim().toUpperCase()
        : "";
    const discountType = String(campaign?.discountType || "").toUpperCase();

    let label = "";

    if (discountType === "PERCENTAGE") {
        label = `${Math.max(0, Math.round(Number(campaign?.discountValue || 0)))}% off`;
    } else if (discountType === "FIXED_AMOUNT") {
        label = `KES ${formatKesAmount(fromKesMinorUnits(campaign?.discountValue))} off`;
    } else if (discountType === "FREE_SHIPPING") {
        label = "Free shipping";
    } else if (discountType === "BUY_X_GET_Y") {
        const buyX = Math.max(1, Math.round(Number(campaign?.minPurchaseAmount || 0)));
        const getY = Math.max(1, Math.round(Number(campaign?.discountValue || 0)));
        label = `Buy ${buyX} get ${getY}`;
    } else {
        label = String(campaign?.name || "Special offer").trim() || "Special offer";
    }

    if (couponCode) {
        return `${label} use ${couponCode}`;
    }

    return label;
};

const buildCampaignSummary = (campaign: any, basePrice: number) => {
    const discountType = String(campaign?.discountType || "").toUpperCase();
    const couponCode = typeof campaign?.couponCode === "string"
        ? campaign.couponCode.trim().toUpperCase()
        : null;

    let promotionalPrice: number | null = null;
    let savingsAmount = 0;

    if (basePrice > 0 && discountType === "PERCENTAGE") {
        const percentage = Math.max(0, Number(campaign?.discountValue || 0));
        savingsAmount = (basePrice * percentage) / 100;
        const maxDiscountAmount = fromKesMinorUnits(campaign?.maxDiscountAmount);
        if (maxDiscountAmount > 0) {
            savingsAmount = Math.min(savingsAmount, maxDiscountAmount);
        }
        promotionalPrice = Math.max(0, basePrice - savingsAmount);
    } else if (basePrice > 0 && discountType === "FIXED_AMOUNT") {
        savingsAmount = fromKesMinorUnits(campaign?.discountValue);
        promotionalPrice = Math.max(0, basePrice - savingsAmount);
    }

    savingsAmount = promotionalPrice !== null
        ? Math.max(0, basePrice - promotionalPrice)
        : 0;

    const savingsPercent = savingsAmount > 0 && basePrice > 0
        ? Math.round((savingsAmount / basePrice) * 100)
        : null;

    return {
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        type: campaign.type,
        discountType: campaign.discountType,
        status: campaign.status,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        couponCode,
        discountValue: campaign.discountValue ?? null,
        minPurchaseAmount: campaign.minPurchaseAmount ?? null,
        maxDiscountAmount: campaign.maxDiscountAmount ?? null,
        usageLimit: campaign.usageLimit ?? null,
        usagePerCustomer: campaign.usagePerCustomer ?? null,
        badgeText: buildPromotionBadgeText(campaign),
        promotionalPrice: promotionalPrice === null ? null : roundCurrency(promotionalPrice),
        savingsAmount: roundCurrency(savingsAmount),
        savingsPercent,
        isActiveNow: isCampaignActiveNow(campaign),
    };
};

const getPromotionPriority = (campaign: any) => {
    const discountType = String(campaign?.discountType || "").toUpperCase();
    switch (discountType) {
        case "PERCENTAGE":
        case "FIXED_AMOUNT":
            return 4;
        case "BUY_X_GET_Y":
            return 3;
        case "FREE_SHIPPING":
            return 2;
        case "NONE":
            return 0;
        default:
            return 1;
    }
};

const pickActivePromotion = (campaigns: any[]) => {
    const activeSummaries = campaigns.filter((campaign) => campaign.isActiveNow);
    if (activeSummaries.length === 0) {
        return null;
    }

    return [...activeSummaries].sort((left, right) => {
        const savingsDelta = (right.savingsAmount || 0) - (left.savingsAmount || 0);
        if (savingsDelta !== 0) return savingsDelta;

        const priorityDelta = getPromotionPriority(right) - getPromotionPriority(left);
        if (priorityDelta !== 0) return priorityDelta;

        return String(left.name || "").localeCompare(String(right.name || ""));
    })[0];
};

export const enrichProductCampaigns = (product: any, options: { onlyActive?: boolean } = {}) => {
    const { onlyActive = false } = options;
    const campaignRows = Array.isArray(product?.campaignProducts) ? product.campaignProducts : [];
    const dedupedCampaigns = Array.from(
        new Map(
            campaignRows
                .map((row: any) => row?.campaign)
                .filter(Boolean)
                .map((campaign: any) => [campaign.id, campaign])
        ).values()
    );

    const visibleCampaigns = onlyActive
        ? dedupedCampaigns.filter((campaign: any) => isCampaignActiveNow(campaign))
        : dedupedCampaigns;

    const campaignTypes = Array.from(
        new Set(visibleCampaigns.map((campaign: any) => campaign.type).filter(Boolean))
    );
    const discountTypes = Array.from(
        new Set(visibleCampaigns.map((campaign: any) => campaign.discountType).filter(Boolean))
    );

    const basePrice = getBaseProductPrice(product);
    const campaignSummaries = visibleCampaigns.map((campaign: any) =>
        buildCampaignSummary(campaign, basePrice)
    );
    const activePromotion = pickActivePromotion(
        campaignSummaries.map((campaign) => ({
            ...campaign,
            basePrice,
        }))
    );

    return {
        ...product,
        campaigns: campaignSummaries,
        activePromotion,
        campaignTypes,
        campaignType: campaignTypes[0] || null,
        discountTypes,
        discountType: discountTypes[0] || null,
        campaignProducts: undefined,
    };
};

export const enrichProductsWithCampaigns = (products: any[], options: { onlyActive?: boolean } = {}) =>
    products.map((product: any) => enrichProductCampaigns(product, options));
