import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getImageUrl } from '@/lib/image/image-utils';
import { getBannerHref, type StoreBanner } from '@/lib/banner/banner-target';
import SectionContainer from '@/components/layout/SectionContainer';

interface DealsProps {
    deals: StoreBanner[];
}

export default function Deals({ deals }: DealsProps) {
    const visibleDeals = deals.filter(
        (deal) => getBannerHref(deal) && (deal.desktopImage?.preview || deal.desktopImage?.source),
    );

    if (visibleDeals.length === 0) return null;

    return (
        <section aria-label="Deals and promotions" className="py-2 md:py-4">
        <SectionContainer className="">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-6">
                    Deals
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {visibleDeals.map((deal) => {
                        const bannerHref = getBannerHref(deal)!;
                        const imageUrl = getImageUrl(deal.desktopImage!.preview || deal.desktopImage!.source);
                        const ctaText = deal.product?.name
                            ? `View ${deal.product.name}`
                            : deal.promotion
                                ? `Shop ${deal.promotion.title}`
                                : `Shop ${deal.collection?.name || deal.title} Deals`;

                        return (
                            <Link
                                key={deal.id}
                                href={bannerHref}
                                className="group block bg-white rounded-md border border-gray-200 overflow-hidden"
                            >
                                <div className="relative w-full aspect-video overflow-hidden">
                                    <Image
                                        src={imageUrl}
                                        alt={deal.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    />
                                </div>

                                <div className="p-3 sm:p-4">
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                                        {deal.title}
                                    </h3>

                                    {deal.description && (
                                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3">
                                            {deal.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-1 text-sm font-medium text-primary-900 group-hover:text-primary-800 transition-colors">
                                        <span>{ctaText}</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </SectionContainer>
        </section>
    );
}
