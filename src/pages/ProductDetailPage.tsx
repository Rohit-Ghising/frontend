import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Truck, Shield, RotateCcw, Package, ChevronRight, ThumbsUp } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { addToCart } from '../store/cartSlice';
import { openCart } from '../store/cartSlice';
import ProductCard from '../components/product/ProductCard';
import StarRating from '../components/ui/StarRating';
import { ProductDetailSkeleton } from '../components/ui/Skeleton';
import { reviews as mockReviews } from '../data/products';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector(s => s.products);
  const cartItems = useAppSelector(s => s.cart.items);

  const product = products.find(p => p.id === id);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [id]);

  if (loading) return (
    <div className="pt-24 pb-20">
      <div className="page-container"><ProductDetailSkeleton /></div>
    </div>
  );

  if (!product) return (
    <div className="pt-24 pb-20 page-container text-center">
      <p className="text-white text-xl">Product not found</p>
      <Link to="/products" className="btn-primary mt-4 inline-flex">Back to Products</Link>
    </div>
  );

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const productReviews = mockReviews.filter(r => r.productId === product.id);
  const inCart = cartItems.find(i => i.product.id === product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) dispatch(addToCart(product));
    dispatch(openCart());
    toast.success(`${product.name} added to cart`);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="pt-20 pb-20">
      <div className="page-container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-6 text-sm text-zinc-500">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-white transition-colors">Products</Link>
          <ChevronRight size={12} />
          <span className="text-zinc-400 truncate">{product.name}</span>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-surface-card border border-surface-border aspect-square">
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {product.isNew && (
                <div className="absolute top-4 left-4 badge bg-brand-500 text-white">NEW</div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 right-4 badge bg-green-500 text-white">-{discount}%</div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`rounded-xl overflow-hidden border-2 transition-all aspect-square ${
                    i === activeImg ? 'border-brand-500' : 'border-surface-border hover:border-zinc-600'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-brand-400 mb-1">{product.brand}</p>
              <h1 className="font-display font-bold text-3xl lg:text-4xl text-white leading-tight">
                {product.name}
              </h1>
            </div>

            <StarRating rating={product.rating} size={16} showNumber reviewCount={product.reviewCount} />

            <div className="flex items-baseline gap-3">
              <span className="font-display font-bold text-4xl text-white">${product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-zinc-600 line-through">${product.originalPrice.toLocaleString()}</span>
                  <span className="badge bg-green-500/10 text-green-400 border border-green-500/20">
                    Save ${(product.originalPrice - product.price).toLocaleString()}
                  </span>
                </>
              )}
            </div>

            <p className="text-zinc-400 leading-relaxed">{product.shortDescription}</p>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-green-400' : product.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'}`} />
              <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                {product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock'}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="badge bg-surface-hover text-zinc-400 border border-surface-border capitalize">
                  {tag}
                </span>
              ))}
            </div>

            {/* Qty + Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-surface-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-12 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
                >−</button>
                <span className="w-12 text-center font-mono text-white">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-12 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
                >+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary flex-1 text-base py-3"
              >
                <ShoppingCart size={18} />
                {inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}
              </button>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-surface-border">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'On $99+' },
                { icon: Shield, label: '2-Year Warranty', sub: 'Included' },
                { icon: RotateCcw, label: '30-Day Returns', sub: 'Free returns' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-2">
                    <Icon size={15} className="text-brand-400" />
                  </div>
                  <p className="text-xs font-medium text-white">{label}</p>
                  <p className="text-xs text-zinc-600">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Description / Specs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-display font-semibold text-white text-xl mb-4">Description</h2>
              <p className="text-zinc-400 leading-relaxed">{product.description}</p>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-white text-xl">Reviews</h2>
                <div className="flex items-center gap-2">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{product.rating}</span>
                  <span className="text-zinc-500 text-sm">({product.reviewCount.toLocaleString()})</span>
                </div>
              </div>

              {productReviews.length > 0 ? (
                <div className="space-y-5">
                  {productReviews.map(review => (
                    <div key={review.id} className="pb-5 border-b border-surface-border last:border-0 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-brand-400">{review.userName[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{review.userName}</p>
                            <p className="text-xs text-zinc-600">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <StarRating rating={review.rating} size={12} />
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">{review.title}</h4>
                      <p className="text-sm text-zinc-400">{review.comment}</p>
                      <button className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 mt-2 transition-colors">
                        <ThumbsUp size={11} /> Helpful ({review.helpful})
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Specs */}
          <div className="card p-6 h-fit">
            <h2 className="font-display font-semibold text-white text-xl mb-4">
              <span className="flex items-center gap-2"><Package size={18} className="text-brand-400" /> Specifications</span>
            </h2>
            <div className="space-y-3">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-0.5 pb-3 border-b border-surface-border last:border-0 last:pb-0">
                  <span className="text-xs text-zinc-500 font-medium">{key}</span>
                  <span className="text-sm text-white">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-display font-bold text-2xl text-white mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
