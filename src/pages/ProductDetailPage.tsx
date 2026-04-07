import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Package,
  RotateCcw,
  Shield,
  ShoppingCart,
  Star,
  Truck,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import apiClient from '../lib/api';
import { addToCart, openCart } from '../store/cartSlice';
import ProductCard from '../components/product/ProductCard';
import StarRating from '../components/ui/StarRating';
import { ProductDetailSkeleton } from '../components/ui/Skeleton';
import { toast } from 'sonner';
import type { Product } from '../types';
import { formatUsdToNpr } from '../utils/currency';
import { normalizeProduct } from '../utils/products';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((s) => s.products);
  const cartItems = useAppSelector((s) => s.cart.items);

  const product = products.find((item) => item.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    const timeout = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timeout);
  }, [id]);

  useEffect(() => {
    if (!product) {
      setRecommended([]);
      setRecommendationLoading(false);
      return;
    }

    const fallback = products
      .filter((item) => item.category === product.category && item.id !== product.id)
      .slice(0, 4);

    setRecommended(fallback);

    let cancelled = false;

    const loadRecommendations = async () => {
      setRecommendationLoading(true);

      try {
        const response = await apiClient.get(`/api/recommend/${product.id}/`, {
          params: { limit: 4 },
        });

        const nextRecommendations = Array.isArray(response.data)
          ? response.data
              .map(normalizeProduct)
              .filter((item: Product) => item.id !== product.id)
              .slice(0, 4)
          : [];

        if (!cancelled && nextRecommendations.length > 0) {
          setRecommended(nextRecommendations);
        }
      } catch {
        if (!cancelled) {
          setRecommended(fallback);
        }
      } finally {
        if (!cancelled) {
          setRecommendationLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [product, products]);

  if (loading) {
    return (
      <div className="pb-20 pt-28 sm:pt-32">
        <div className="page-container">
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container pb-20 pt-28 text-center sm:pt-32">
        <div className="surface-panel-soft px-6 py-16">
          <p className="font-display text-3xl font-semibold text-white">Product not found</p>
          <p className="mt-3 text-sm text-slate-500">The item you opened is unavailable or no longer exists.</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const related = recommended
    .filter((item) => item.id !== product.id)
    .slice(0, 4);
  const inCart = cartItems.find((item) => item.product.id === product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const highlightSpecs = Object.entries(product.specs).slice(0, 3);

  const handleAddToCart = async () => {
    const resultAction = await dispatch(
      addToCart({ productId: Number(product.id), quantity: qty, product }),
    );

    if (addToCart.fulfilled.match(resultAction)) {
      dispatch(openCart());
      toast.success(`${product.name} added to cart`, {
        description: formatUsdToNpr(product.price),
      });
    } else {
      toast.error(resultAction.payload?.error || 'Could not add to cart');
    }
  };

  return (
    <div className="pb-20 pt-28 sm:pt-32">
      <div className="page-container">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="transition-colors hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" className="transition-colors hover:text-white">Products</Link>
            <ChevronRight size={14} />
            <span className="truncate text-slate-300">{product.name}</span>
          </div>

          <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-brand-200 transition-colors hover:text-white">
            <ArrowLeft size={15} /> Back to catalog
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="surface-panel overflow-hidden p-4 sm:p-5">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/40">
                <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                  {product.isNew && (
                    <span className="badge bg-brand-400 text-slate-950">New</span>
                  )}
                  {product.featured && (
                    <span className="badge bg-white text-slate-950">
                      <Zap size={11} /> Featured
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="badge bg-emerald-400/90 text-slate-950">Save {discount}%</span>
                  )}
                </div>
                <img
                  src={product.images[activeImg]}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/80 to-transparent px-5 py-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{product.brand}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-white">{product.name}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-200">
                    {activeImg + 1} / {product.images.length}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImg(index)}
                    className={`overflow-hidden rounded-2xl border transition-all ${
                      index === activeImg
                        ? 'border-brand-300 shadow-lg shadow-brand-500/20'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img src={image} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Truck, title: 'Fast delivery', text: 'Reliable dispatch on core categories.' },
                { icon: Shield, title: 'Protected purchase', text: 'Clear support after checkout.' },
                { icon: RotateCcw, title: 'Flexible returns', text: 'Straightforward return support window.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="surface-panel-soft p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                    <Icon size={18} />
                  </div>
                  <p className="mt-4 font-medium text-white">{title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-500">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="surface-panel p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-brand-400/18 bg-brand-400/10 px-3 py-1 text-xs font-semibold text-brand-200">
                  {product.category}
                </span>
                {product.trending && (
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200">
                    Trending pick
                  </span>
                )}
              </div>

              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                {product.brand}
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-[2.85rem]">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-4">
                <StarRating
                  rating={product.rating}
                  size={16}
                  showNumber
                  reviewCount={product.reviewCount}
                />
                <span className="inline-flex items-center gap-1 text-sm text-slate-400">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  Highly rated in this category
                </span>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-3">
                <span className="font-display text-4xl font-bold text-white">
                  {formatUsdToNpr(product.price)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-slate-600 line-through">
                      {formatUsdToNpr(product.originalPrice)}
                    </span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      Save {formatUsdToNpr(product.originalPrice - product.price)}
                    </span>
                  </>
                )}
              </div>

              <p className="mt-6 text-base leading-8 text-slate-400">
                {product.shortDescription}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {highlightSpecs.map(([key, value]) => (
                  <div key={key} className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{key}</p>
                    <p className="mt-2 text-sm font-medium text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Quantity</p>
                    <div className="mt-3 inline-flex items-center rounded-2xl border border-white/10 bg-slate-950/40">
                      <button
                        onClick={() => setQty((current) => Math.max(1, current - 1))}
                        className="flex h-12 w-12 items-center justify-center text-slate-300 transition-colors hover:text-white"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-mono text-white">{qty}</span>
                      <button
                        onClick={() => setQty((current) => Math.min(product.stock, current + 1))}
                        className="flex h-12 w-12 items-center justify-center text-slate-300 transition-colors hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className={`font-medium ${product.stock > 10 ? 'text-emerald-300' : product.stock > 0 ? 'text-amber-300' : 'text-red-300'}`}>
                      {product.stock > 10
                        ? 'In stock and ready to ship'
                        : product.stock > 0
                          ? `Only ${product.stock} remaining`
                          : 'Currently unavailable'}
                    </p>
                    <p className="mt-2 text-slate-500">
                      {inCart
                        ? `Already in cart: ${inCart.quantity}`
                        : 'Add it now to keep checkout quick and simple.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="btn-primary mt-5 w-full py-3.5 text-base"
                >
                  <ShoppingCart size={18} />
                  {inCart ? `Update cart with ${qty}` : 'Add to cart'}
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  { icon: Truck, title: 'Delivery', text: 'Fast dispatch and status updates after purchase.' },
                  { icon: Shield, title: 'Warranty', text: 'Protected support flow on eligible products.' },
                  { icon: Package, title: 'Packaging', text: 'Secure packing for premium electronics and accessories.' },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                      <Icon size={17} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{title}</p>
                      <p className="mt-1 text-sm leading-7 text-slate-500">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-panel p-6 sm:p-8">
            <p className="section-label mb-4">Overview</p>
            <h2 className="font-display text-3xl font-bold text-white">What makes this product stand out</h2>
            <p className="mt-5 text-sm leading-8 text-slate-400 sm:text-base">
              {product.description}
            </p>
          </div>

          <div className="surface-panel p-6 sm:p-8">
            <p className="section-label mb-4">Specifications</p>
            <h2 className="font-display text-3xl font-bold text-white">Key technical details</h2>
            <div className="mt-5 space-y-3">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  <span className="text-xs uppercase tracking-[0.22em] text-slate-500">{key}</span>
                  <span className="text-sm font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="section-label mb-4">Recommended products</p>
                <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                  {recommendationLoading ? 'Finding similar products' : 'You may also like'}
                </h2>
              </div>
              <Link to="/products" className="hidden items-center gap-2 text-sm font-medium text-brand-200 transition-colors hover:text-white sm:inline-flex">
                Explore catalog <ChevronRight size={15} />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
