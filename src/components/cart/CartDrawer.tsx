import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { closeCart, removeFromCart, updateQuantity } from '../../store/cartSlice';

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isOpen } = useAppSelector(s => s.cart);

  const total = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => dispatch(closeCart())}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col bg-surface-card border-l border-surface-border transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-brand-400" />
            <h2 className="font-display font-semibold text-white">Cart</h2>
            {count > 0 && (
              <span className="badge bg-brand-500/20 text-brand-400 border border-brand-500/30">{count}</span>
            )}
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-surface-hover transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center">
                <ShoppingCart size={24} className="text-zinc-600" />
              </div>
              <div>
                <p className="font-medium text-white">Your cart is empty</p>
                <p className="text-sm text-zinc-500 mt-1">Add some gadgets to get started</p>
              </div>
              <Link to="/products" onClick={() => dispatch(closeCart())} className="btn-primary">
                Browse Products
              </Link>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3 p-3 rounded-xl bg-surface-hover border border-surface-border">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${product.id}`}
                    onClick={() => dispatch(closeCart())}
                    className="text-sm font-medium text-white hover:text-brand-400 transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-zinc-500 mt-0.5">{product.brand}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-brand-400">${(product.price * quantity).toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => dispatch(updateQuantity({ id: product.id, quantity: quantity - 1 }))}
                        className="w-6 h-6 rounded-md bg-surface-card border border-surface-border flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-6 text-center text-sm font-mono text-white">{quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ id: product.id, quantity: quantity + 1 }))}
                        className="w-6 h-6 rounded-md bg-surface-card border border-surface-border flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                      >
                        <Plus size={11} />
                      </button>
                      <button
                        onClick={() => dispatch(removeFromCart(product.id))}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-zinc-600 hover:text-red-400 transition-colors ml-1"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Subtotal</span>
              <span className="font-bold text-white text-lg">${total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-zinc-600">Shipping calculated at checkout</p>
            <button onClick={handleCheckout} className="btn-primary w-full">
              Checkout <ArrowRight size={15} />
            </button>
            <Link
              to="/cart"
              onClick={() => dispatch(closeCart())}
              className="btn-secondary w-full text-center"
            >
              View Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
