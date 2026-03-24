import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Tag } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { removeCartItem, updateCartItem, clearCart } from '../store/cartSlice';
import { toast } from 'sonner';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, totalItems, totalPrice } = useAppSelector((s) => s.cart);
  const { isAuthenticated } = useAppSelector(s => s.auth);

  const subtotal = totalPrice;
  const shipping = subtotal > 99 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-20">
        <div className="page-container flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-card border border-surface-border flex items-center justify-center mb-6">
            <ShoppingCart size={32} className="text-zinc-600" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-3">Your cart is empty</h1>
          <p className="text-zinc-500 mb-8 max-w-md">Looks like you haven't added any gadgets yet. Explore our collection!</p>
          <Link to="/products" className="btn-primary text-base px-8 py-3">
            Browse Products <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20">
      <div className="page-container">
        <div className="py-8">
          <h1 className="font-display font-bold text-4xl text-white">
            Shopping Cart
            <span className="text-zinc-600 text-2xl ml-3">({totalItems})</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-end">
              <button
                onClick={async () => {
                  const result = await dispatch(clearCart());
                  if (clearCart.fulfilled.match(result)) {
                    toast.success('Cart cleared');
                  }
                }}
                className="text-sm text-zinc-500 hover:text-red-400 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={13} /> Clear Cart
              </button>
            </div>

            {items.map(({ id, product, quantity }) => (
              <div key={product.id} className="card p-4 flex gap-4">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0 hover:opacity-80 transition-opacity"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">{product.brand}</p>
                      <Link
                        to={`/products/${product.id}`}
                        className="font-display font-semibold text-white hover:text-brand-400 transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-zinc-600 mt-0.5">{product.shortDescription}</p>
                    </div>
                    <button
                      onClick={async () => {
                        const result = await dispatch(removeCartItem(id));
                        if (removeCartItem.fulfilled.match(result)) {
                          toast.success('Removed from cart');
                        }
                      }}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-surface-border rounded-xl overflow-hidden">
                      <button
                        onClick={() => {
                          if (quantity > 1) {
                            dispatch(updateCartItem({ id, quantity: quantity - 1 }));
                          }
                        }}
                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-10 text-center text-sm font-mono text-white">{quantity}</span>
                      <button
                        onClick={() => dispatch(updateCartItem({ id, quantity: quantity + 1 }))}
                        className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-white">${(product.price * quantity).toLocaleString()}</p>
                      {quantity > 1 && (
                        <p className="text-xs text-zinc-600">${product.price.toLocaleString()} each</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Promo */}
            <div className="card p-4">
              <p className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                <Tag size={14} className="text-brand-400" /> Promo Code
              </p>
              <div className="flex gap-2">
                <input type="text" placeholder="Enter code" className="input text-sm flex-1" />
                <button className="btn-secondary text-xs px-3">Apply</button>
              </div>
            </div>

            {/* Order summary */}
            <div className="card p-5 space-y-3">
              <h3 className="font-display font-semibold text-white mb-1">Order Summary</h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subtotal ({totalItems} items)</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-500">You qualify for free shipping!</p>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tax (8%)</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-surface-border">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-xl text-white">${total.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleCheckout} className="btn-primary w-full text-base py-3 mt-2">
                Checkout <ArrowRight size={16} />
              </button>

              <Link to="/products" className="text-sm text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-1 mt-2">
                ← Continue Shopping
              </Link>
            </div>

            {/* Security badges */}
            <div className="card p-4">
              <div className="flex items-center justify-center gap-3 text-zinc-600">
                {['🔒 Secure', '💳 All Cards', '📦 Fast Ship'].map(badge => (
                  <span key={badge} className="text-xs">{badge}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
