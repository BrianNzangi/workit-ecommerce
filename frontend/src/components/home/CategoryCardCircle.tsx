import { getImageUrl } from '@/lib/image/image-utils';

interface CategoryCardProps {
  name: string;
  image: string;
}

export default function CategoryCardCircle({ name, image }: CategoryCardProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center w-24">
      <div className="w-20 h-20 rounded-full overflow-hidden border bg-white shadow-sm">
        <img
          src={getImageUrl(image)}
          alt={name}
          className="object-cover w-full h-full"
          loading="lazy"
          decoding="async"
        />
      </div>
      <span className="text-sm mt-2 line-clamp-1">{name}</span>
    </div>
  );
}
