import { Star } from 'lucide-react';

interface RatingStarsProps {
    rating: number; // 0-5, can be fractional (e.g. 4.5)
    reviewsCount?: number;
    size?: number;
}

export function RatingStars({ rating, reviewsCount, size = 14 }: RatingStarsProps) {
    const rounded = Math.round(rating * 2) / 2; // nearest half star

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, i) => {
                    const filled = i + 1 <= rounded;
                    return (
                        <Star
                            key={i}
                            size={size}
                            className={filled ? 'fill-primary text-primary' : 'fill-none text-border'}
                            strokeWidth={1.5}
                        />
                    );
                })}
            </div>
            {reviewsCount !== undefined && (
                <span className="text-xs text-text-muted">({reviewsCount})</span>
            )}
        </div>
    );
}