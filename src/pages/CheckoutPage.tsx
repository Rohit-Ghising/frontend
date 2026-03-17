import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { clearCart } from '../store/cartSlice';
import { addOrder } from '../store/ordersSlice';
import { Address } from '../types';
import { toast } from 'sonner';

const paymentMethods = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'paypal', label: 'PayPal', icon: '🅿️' },
  { id: 'apple', label: 'Apple Pay', icon: '🍎' },
];

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items } = useAppSelector(s => s.cart);
  const { user } = useAppSelector(s => s.auth);
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [payMethod, setPayMethod] = useState('card');
  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: '',
  });

  const subtotal = items.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
  const shipping = subtotal > 99 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = () => {
    const order = {
      id: `ord-${Date.now()}`,
      userId: user!.id,
      items: [...items],
      total,
      status: 'pending' as const,
      shippingAddress: address,
      paymentMethod: payMethod === 'card' ? 'Visa •••• 4242' : payMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addOrder(order));
    dispatch(clearCart());
    setStep('success');
    toast.success('Order placed successfully!');
  };

  if (step === 'success') {
    return (
      <div className="pt-24 pb-20">
        <div className="page-container max-w-lg mx-auto text-center py-16">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-green-400" />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-3">Order Placed!</h1>
          <p className="text-zinc-400 mb-8">
            Thank you for your purchase. Your order has been placed and is being processed.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/orders')} className="btn-primary">View Orders</button>
            <button onClick={() => navigate('/')} className="btn-secondary">Continue Shopping</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-20">
      <div className="page-container">
        <div className="py-8">
          <h1 className="font-display font-bold text-3xl text-white mb-2">Checkout</h1>
          {/* Steps */}
          <div className="flex items-center gap-2 text-sm">
            {['address', 'payment'].map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 ${step === s ? 'text-brand-400' : step === 'payment' && s === 'address' ? 'text-green-400' : 'text-zinc-600'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border ${step === s ? 'border-brand-500 bg-brand-500/10 text-brand-400' : 'border-zinc-700 text-zinc-600'}`}>{i + 1}</span>
                  {s === 'address' ? 'Shipping' : 'Payment'}
                </span>
                {i < 1 && <ChevronRight size={12} className="text-zinc-700" />}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 'address' && (
              <div className="card p-6 space-y-5">
                <h2 className="font-display font-semibold text-white text-lg">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'fullName', label: 'Full Name', span: 2 },
                    { key: 'street', label: 'Street Address', span: 2 },
                    { key: 'city', label: 'City', span: 1 },
                    { key: 'state', label: 'State', span: 1 },
                    { key: 'zip', label: 'ZIP Code', span: 1 },
                    { key: 'phone', label: 'Phone', span: 1 },
                  ].map(({ key, label, span }) => (
                    <div key={key} className={span === 2 ? 'col-span-2' : ''}>
                      <label className="text-xs text-zinc-500 font-medium mb-1.5 block">{label}</label>
                      <input
                        type="text"
                        value={address[key as keyof Address]}
                        onChange={e => setAddress(a => ({ ...a, [key]: e.target.value }))}
                        className="input"
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setStep('payment')}
                  disabled={!address.fullName || !address.street || !address.city}
                  className="btn-primary w-full py-3"
                >
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="card p-6 space-y-5">
                <h2 className="font-display font-semibold text-white text-lg">Payment Method</h2>

                <div className="space-y-3">
                  {paymentMethods.map(pm => (
                    <label
                      key={pm.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        payMethod === pm.id
                          ? 'border-brand-500 bg-brand-500/5'
                          : 'border-surface-border hover:border-zinc-600'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={payMethod === pm.id}
                        onChange={() => setPayMethod(pm.id)}
                        className="accent-brand-500"
                      />
                      <span className="text-lg">{pm.icon}</span>
                      <span className="text-sm font-medium text-white">{pm.label}</span>
                    </label>
                  ))}
                </div>

                {payMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1.5 block">Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className="input font-mono" maxLength={19} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-zinc-500 mb-1.5 block">Expiry</label>
                        <input type="text" placeholder="MM / YY" className="input font-mono" maxLength={7} />
                      </div>
                      <div>
                        <label className="text-xs text-zinc-500 mb-1.5 block">CVC</label>
                        <input type="text" placeholder="•••" className="input font-mono" maxLength={3} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep('address')} className="btn-secondary flex-1">
                    ← Back
                  </button>
                  <button onClick={handlePlaceOrder} className="btn-primary flex-1 py-3">
                    <Lock size={14} /> Place Order — ${total.toFixed(2)}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-display font-semibold text-white mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex gap-3">
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white line-clamp-1">{product.name}</p>
                      <p className="text-xs text-zinc-500">Qty: {quantity}</p>
                    </div>
                    <span className="text-xs font-mono text-white">${(product.price * quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tax</span>
                  <span className="text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-surface-border font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white text-lg">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-center text-xs text-zinc-600">
              <Lock size={11} /> Secured by 256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
