import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, CheckCircle, ChevronRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { checkoutCart } from '../store/cartSlice';
import { addOrder, normalizeOrder } from '../store/ordersSlice';
import apiClient from '../lib/api';
import type { Address, PaymentRecord, EsewaPayload } from '../types';
import { toast } from 'sonner';
import { formatUsdToNpr, convertUsdToNprString } from '../utils/currency';
import { ESEWA_PAYMENT_URL, ESEWA_MERCHANT_CODE } from '../constants/payment';

const paymentMethods = [
  { id: 'esewa', label: 'eSewa', icon: 'NP' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'CC' },
  { id: 'paypal', label: 'PayPal', icon: 'PP' },
  { id: 'apple', label: 'Apple Pay', icon: 'AP' },
];

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice } = useAppSelector((s) => s.cart);
  const { user, token } = useAppSelector((s) => s.auth);
  const [step, setStep] = useState<'address' | 'payment' | 'success'>('address');
  const [payMethod, setPayMethod] = useState('esewa');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<PaymentRecord | null>(null);
  const [esewaPayload, setEsewaPayload] = useState<EsewaPayload | null>(null);
  const [address, setAddress] = useState<Address>({
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    phone: '',
  });

  const subtotal = totalPrice;
  const shipping = subtotal > 99 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const updatePaymentStatus = async (transactionUuid: string, success: boolean) => {
    try {
      await apiClient.post(`/api/orders/payments/${transactionUuid}/confirm/`, {
        status: success ? 'success' : 'failure',
      });
    } catch (error) {
      console.error('Unable to confirm eSewa payment', error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentFlag = params.get('payment')?.toLowerCase();
    const paymentUuid = params.get('payment_uuid');
    if (!paymentFlag) {
      return;
    }

    if (paymentFlag === 'esewa_success') {
      setStep('success');
      toast.success('eSewa payment confirmed. Thank you!');
      if (paymentUuid) {
        void updatePaymentStatus(paymentUuid, true);
      }
    } else if (paymentFlag === 'esewa_failure') {
      toast.error('eSewa payment failed or was cancelled. Please try again.');
      if (paymentUuid) {
        void updatePaymentStatus(paymentUuid, false);
      }
    }

    navigate(location.pathname, { replace: true });
  }, [location.search, location.pathname, navigate]);

  const attachOrder = (payload: any) => {
    const orderData = payload?.order;
    if (orderData) {
      dispatch(addOrder(normalizeOrder(orderData)));
    }
  };

  const ensureCartHasItems = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty. Add at least one product before checking out.');
      return false;
    }
    return true;
  };

  const redirectToEsewaWithOrder = (
    backendOrderId?: number,
    paymentData?: PaymentRecord | null,
    esewaData?: EsewaPayload | null,
  ) => {
    const orderId = backendOrderId ? `GZ-${backendOrderId}` : `GZ-${Date.now()}`;
    const amountValue = esewaData ? Number(esewaData.total_amount) : paymentData ? Number(paymentData.total_amount) : total;
    const normalizedAmount = Number.isFinite(amountValue) ? amountValue : total;
    const amountString = convertUsdToNprString(normalizedAmount);
    const transactionUuid = esewaData?.transaction_uuid ?? paymentData?.transaction_uuid ?? orderId;
    redirectToEsewa(orderId, amountString, transactionUuid, esewaData);
  };

  const handlePlaceOrder = async () => {
    if (processingPayment) return;
    if (!ensureCartHasItems()) return;
    setProcessingPayment(true);
    const result = await dispatch(checkoutCart());
    if (checkoutCart.fulfilled.match(result)) {
      attachOrder(result.payload);
      setStep('success');
      toast.success(result.payload.message ?? 'Order placed successfully!');
      setPaymentIntent(null);
    } else {
      toast.error(result.payload?.error || 'Checkout failed');
    }
    setProcessingPayment(false);
  };

  const getEsewaRedirectUrls = (transactionUuid?: string, overrides?: { success?: string; failure?: string }) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const buildCallbackUrl = (base: string, flag: 'esewa_success' | 'esewa_failure') => {
      const url = new URL(base, origin);
      url.searchParams.set('payment', flag);
      if (transactionUuid) {
        url.searchParams.set('payment_uuid', transactionUuid);
      }
      return url.toString();
    };

    const successBase = overrides?.success ?? import.meta.env.VITE_ESEWA_SUCCESS_URL ?? `${origin}/checkout`;
    const failureBase = overrides?.failure ?? import.meta.env.VITE_ESEWA_FAILURE_URL ?? `${origin}/checkout`;

    return {
      success: buildCallbackUrl(successBase, 'esewa_success'),
      failure: buildCallbackUrl(failureBase, 'esewa_failure'),
    };
  };

  const redirectToEsewa = (pid: string, amount: string, transactionUuid: string, esewaData?: EsewaPayload | null) => {
    if (typeof document === 'undefined') {
      return;
    }

    if (esewaData) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = esewaData.payment_url || ESEWA_PAYMENT_URL;
      const signedFields = esewaData.signed_field_names || 'total_amount,transaction_uuid,product_code';
      const fields: Record<string, string> = {
        amount: esewaData.amount,
        tax_amount: esewaData.tax_amount,
        total_amount: esewaData.total_amount,
        transaction_uuid: esewaData.transaction_uuid,
        product_code: esewaData.product_code,
        product_service_charge: esewaData.product_service_charge,
        product_delivery_charge: esewaData.product_delivery_charge,
        success_url: esewaData.success_url,
        failure_url: esewaData.failure_url,
        signed_field_names: signedFields,
      };
      if (esewaData.signature) {
        fields.signature = esewaData.signature;
      }
      Object.entries(fields).forEach(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
      return;
    }

    const { success, failure } = getEsewaRedirectUrls(transactionUuid);
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = ESEWA_PAYMENT_URL;
    const fields: Record<string, string> = {
      amt: amount,
      txAmt: '0',
      psc: '0',
      pdc: '0',
      pid,
      scd: ESEWA_MERCHANT_CODE,
      su: success,
      fu: failure,
      transaction_uuid: transactionUuid,
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleEsewaPayment = async () => {
    if (processingPayment) return;
    if (!ensureCartHasItems()) return;
    setProcessingPayment(true);
    if (!token) {
      toast.info('Redirecting to eSewa test page; log in to create orders first.');
      redirectToEsewaWithOrder();
      setProcessingPayment(false);
      return;
    }
    const result = await dispatch(checkoutCart());
    if (checkoutCart.fulfilled.match(result)) {
      attachOrder(result.payload);
      toast.success('Order created. Redirecting to eSewa...');
      const serverPayment = result.payload?.payment ?? null;
      const serverEsewa = result.payload?.esewa ?? null;
      setPaymentIntent(serverPayment);
      setEsewaPayload(serverEsewa);
      const orderId = result.payload.order?.id;
      setProcessingPayment(false);
      redirectToEsewaWithOrder(orderId, serverPayment, serverEsewa);
      return;
    }

    toast.error(result.payload?.error || 'Checkout failed');
    setProcessingPayment(false);
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
                        onChange={(e) => setAddress((a) => ({ ...a, [key]: e.target.value }))}
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
                  {paymentMethods.map((pm) => (
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
                  <button
                    onClick={payMethod === 'esewa' ? handleEsewaPayment : handlePlaceOrder}
                    className={`btn-primary flex-1 py-3 ${processingPayment ? 'opacity-70 pointer-events-none' : ''}`}
                    disabled={processingPayment}
                  >
                    {payMethod === 'esewa' ? (
                      processingPayment ? 'Redirecting to eSewa...' : `Pay with eSewa — ${formatUsdToNpr(total)}`
                    ) : (
                      <>
                        <Lock size={14} /> Place Order — {formatUsdToNpr(total)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

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
                    <span className="text-xs font-mono text-white">{formatUsdToNpr(product.price * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white">{formatUsdToNpr(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>
                    {shipping === 0 ? 'FREE' : formatUsdToNpr(shipping)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tax</span>
                  <span className="text-white">{formatUsdToNpr(tax)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-surface-border font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-white text-lg">{formatUsdToNpr(total)}</span>
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
