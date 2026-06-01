import { Star } from "lucide-react";

interface StarRatingProps {
    rating: number;
    size?: number;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}

export function StarRating({ rating, size = 16, interactive, onChange }: StarRatingProps) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type={interactive ? "button" : undefined}
                    disabled={!interactive}
                    onClick={() => interactive && onChange?.(star)}
                    className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"} ${!interactive ? "pointer-events-none" : ""}`}
                >
                    <Star
                        size={size}
                        className={star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}
                    />
                </button>
            ))}
        </div>
    );
}
