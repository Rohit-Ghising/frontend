import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Star, TrendingUp, Zap } from 'lucide-react';
import type { Product } from '../../types';
import { useAppDispatch } from '../../hooks/useAppStore';
import { addToCart } from '../../store/cartSlice';
import { toast } from 'sonner';
import { formatUsdToNpr } from '../../utils/currency';

interface Props {
  product: Product;
  compact?: boolean;
  layout?: 'grid' | 'list';
}

export default function ProductCard({ product, compact = false, layout = 'grid' }: Props) {
  const dispatch = useAppDispatch();
  const isList = layout === 'list';

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const result = await dispatch(
      addToCart({ productId: Number(product.id), quantity: 1, product }),
    );

    if (addToCart.fulfilled.match(result)) {
      toast.success(`${product.name} added to cart`, {
        description: formatUsdToNpr(product.price),
      });
    } else {
      toast.error(result.payload?.error || 'Could not add to cart');
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <article
        className={`card overflow-hidden border-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/20 hover:shadow-[0_28px_80px_rgba(2,6,23,0.42)] ${
          isList ? 'flex h-full flex-col md:flex-row' : 'h-full'
        }`}
      >
        <div
          className={`relative overflow-hidden bg-slate-950/50 ${
            isList ? 'md:min-h-[280px] md:w-[42%]' : compact ? 'h-48' : 'h-64'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/12 via-transparent to-transparent" />
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {product.isNew && (
              <span className="badge bg-brand-400 text-slate-950">New</span>
            )}
            {product.trending && (
              <span className="badge bg-amber-400/90 text-slate-950">
                <TrendingUp size={11} /> Trending
              </span>
            )}
            {discount > 0 && (
              <span className="badge bg-emerald-400/90 text-slate-950">Save {discount}%</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-slate-950/65 text-white shadow-lg shadow-slate-950/30 transition-all hover:bg-brand-500 hover:text-slate-950 ${
              isList ? 'opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={16} />
          </button>

          {product.stock <= 5 && (
            <div className="absolute bottom-4 left-4 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200">
              Only {product.stock} left
            </div>
          )}

          {isList && (
            <div className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-xs font-medium text-slate-200">
              {formatUsdToNpr(product.price)}
            </div>
          )}
        </div>

        <div className={`flex flex-1 flex-col ${isList ? 'p-5 sm:p-6' : 'p-5'}`}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                {product.brand}
              </p>
              <h3 className={`mt-2 font-display font-semibold text-white transition-colors group-hover:text-brand-300 ${isList ? 'text-2xl' : 'text-base leading-snug'}`}>
                {product.name}
              </h3>
            </div>

            {product.featured && (
              <span className="hidden items-center gap-1 rounded-full border border-brand-400/18 bg-brand-400/10 px-3 py-1 text-xs font-semibold text-brand-200 sm:inline-flex">
                <Zap size={12} /> Featured
              </span>
            )}
          </div>

          <p className={`text-sm leading-6 text-slate-400 ${isList ? 'line-clamp-3 max-w-2xl' : 'line-clamp-2'}`}>
            {product.shortDescription}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={12}
                    className={index < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-slate-300">
                {product.rating} ({product.reviewCount.toLocaleString()})
              </span>
            </div>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span className={`text-xs font-medium ${product.stock > 10 ? 'text-emerald-300' : 'text-amber-300'}`}>
              {product.stock > 10 ? 'Ready to ship' : `${product.stock} in stock`}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.slice(0, isList ? 4 : 2).map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-slate-400">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <div className={`flex gap-4 ${isList ? 'flex-col sm:flex-row sm:items-end sm:justify-between' : 'items-end justify-between'}`}>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-600">Price</p>
                <div className="flex items-baseline gap-3">
                  <span className={`font-display font-bold text-white ${isList ? 'text-3xl' : 'text-xl'}`}>
                    {formatUsdToNpr(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-slate-600 line-through">
                      {formatUsdToNpr(product.originalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {isList ? (
                <div className="flex gap-3">
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300">
                    View details <ArrowRight size={13} className="ml-1" />
                  </span>
                  <button onClick={handleAddToCart} className="btn-primary px-4">
                    <ShoppingCart size={15} /> Add to cart
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-300 transition-transform group-hover:translate-x-1">
                  View details <ArrowRight size={13} />
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
