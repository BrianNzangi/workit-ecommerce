'use client';

import { Fragment } from 'react';
import ProductCard from '../product/ProductCard';
import { useHomepageCollections, type HomepageCollectionData } from '@/hooks/useHomepageCollections';
import HorizontalBanner from '../banners/HorizontalBanner';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

interface CollectionCarouselProps {
  collection: HomepageCollectionData;
}

function CollectionCarousel({ collection }: CollectionCarouselProps) {
  const products = (collection.products || []).slice(0, 12);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto font-sans space-y-2 py-4 md:py-2">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg md:text-2xl capitalize font-bold text-gray-900">
            {collection.title}
          </h2>
          <a
            href={`/deal-details/${collection.slug}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap"
          >
            View All {'->'}
          </a>
        </div>
        {collection.subtitle && (
          <h3 className="text-lg md:text-xl text-gray-600 mt-1">
            {collection.subtitle}
          </h3>
        )}
        {collection.description && (
          <p className="text-base text-gray-700 mt-2">
            {collection.description}
          </p>
        )}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 2.2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          autoplay={
            products.length > 2
              ? {
                delay: 2400,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                reverseDirection: false,
              }
              : false
          }
          speed={700}
          loop={products.length > 5}
          navigation={products.length > 5}
          allowTouchMove
          grabCursor
          className="homepage-collection-swiper pb-2"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="h-auto">
              <ProductCard {...product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .homepage-collection-swiper .swiper-button-next,
        .homepage-collection-swiper .swiper-button-prev {
          color: #111827;
          width: 32px;
          height: 32px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 8px 20px -12px rgba(0, 0, 0, 0.45);
        }
        .homepage-collection-swiper .swiper-button-next:after,
        .homepage-collection-swiper .swiper-button-prev:after {
          font-size: 12px;
          font-weight: 700;
        }
        @media (max-width: 767px) {
          .homepage-collection-swiper .swiper-button-next,
          .homepage-collection-swiper .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

export default function HomepageCollection() {
  const { collections, loading, error } = useHomepageCollections({ status: 'active' });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Error loading collections: {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (collections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 md:space-y-7">
      {collections.map((collection, index) => (
        <Fragment key={collection.id}>
          <CollectionCarousel collection={collection} />
          {index === 2 && <HorizontalBanner position="MIDDLE" />}
          {index === collections.length - 1 && <HorizontalBanner position="BOTTOM" />}
        </Fragment>
      ))}
    </div>
  );
}
