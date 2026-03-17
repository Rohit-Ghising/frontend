import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Zap, TrendingUp } from 'lucide-react';
import { Product } from '../../types';
import { useAppDispatch } from '../../hooks/useAppStore';
import { addToCart } from '../../store/cartSlice';
import { toast } from 'sonner';

interface Props {
  product: Product;
  compact?: boolean;
}

export default function ProductCard({ product, compact = false }: Props) {
  const dispatch = useAppDispatch();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart`, {
      description: `$${product.price.toLocaleString()}`,
    });
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="card overflow-hidden transition-all duration-300 hover:border-zinc-600 hover:shadow-2xl hover:shadow-brand-500/5 hover:-translate-y-1">
        {/* Image */}
        <div className={`relative overflow-hidden bg-surface-hover ${compact ? 'h-44' : 'h-56'}`}>
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isNew && (
              <span className="badge bg-brand-500 text-white text-[10px]">NEW</span>
            )}
            {product.trending && (
              <span className="badge bg-orange-500/90 text-white text-[10px] flex items-center gap-1">
                <TrendingUp size={9} /> HOT
              </span>
            )}
            {discount > 0 && (
              <span className="badge bg-green-500/90 text-white text-[10px]">-{discount}%</span>
            )}
          </div>

          {/* Quick add */}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:bg-brand-600 shadow-lg"
          >
            <ShoppingCart size={15} />
          </button>

          {/* Stock warning */}
          {product.stock <= 5 && (
            <div className="absolute bottom-3 left-3 badge bg-red-500/80 text-white text-[10px]">
              Only {product.stock} left
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="text-xs text-zinc-500 font-medium mb-0.5">{product.brand}</p>
              <h3 className="font-display font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-brand-400 transition-colors">
                {product.name}
              </h3>
            </div>
          </div>

          <p className="text-xs text-zinc-600 line-clamp-1 mb-3">{product.shortDescription}</p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'}
                />
              ))}
            </div>
            <span className="text-xs text-zinc-500">{product.rating} ({product.reviewCount.toLocaleString()})</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-white text-base">
                ${product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-zinc-600 line-through">${product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            {product.featured && (
              <span className="flex items-center gap-1 text-[10px] text-brand-400">
                <Zap size={9} /> Featured
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
