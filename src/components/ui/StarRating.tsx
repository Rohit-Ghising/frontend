import { Star } from 'lucide-react';

interface Props {
  rating: number;
  size?: number;
  showNumber?: boolean;
  reviewCount?: number;
}

export default function StarRating({ rating, size = 14, showNumber = false, reviewCount }: Props) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            size={size}
            className={
              i <= Math.floor(rating)
                ? 'fill-amber-400 text-amber-400'
                : i - 0.5 <= rating
                ? 'fill-amber-400/50 text-amber-400'
                : 'text-zinc-700'
            }
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm text-zinc-400">
          {rating}
          {reviewCount !== undefined && <span className="text-zinc-600"> ({reviewCount.toLocaleString()})</span>}
        </span>
      )}
    </div>
  );
}
