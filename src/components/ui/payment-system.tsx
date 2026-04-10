'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/app-store';
import { Modal } from '@/components/ui/modal';
import { cn, formatCurrency } from '@/lib/utils';
import {
  CreditCard, Landmark, Plus, Check, X, ChevronRight, Shield, Lock,
  Smartphone, Trash2, Star, DollarSign, ArrowRight, Zap, Crown,
  Rocket, Leaf, AlertTriangle, Clock, BadgePercent, Gift, Wallet,
} from 'lucide-react';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';

// ============================================================
// STRIPE SETUP
// ============================================================
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Card Element Styles
const CARD_STYLE = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#475569' },
    },
    invalid: { color: '#EF4444', iconColor: '#EF4444' },
  },
};

// ============================================================
// STRIPE CARD INPUT COMPONENT
// ============================================================
function StripeCardInput({ onReady, onError }: {
  onReady: (stripe: Stripe, elements: StripeElements, cardElement: any) => void;
  onError?: (msg: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mounted) return;
    let cancelled = false;

    async function init() {
      const stripe = await stripePromise;
      if (!stripe || cancelled) return;

      const elements = stripe.elements();
      const card = elements.create('card', CARD_STYLE);
      const el = document.getElementById('stripe-card-element');
      if (!el || cancelled) return;

      card.mount('#stripe-card-element');
      card.on('change', (e: any) => {
        if (e.error) { setError(e.error.message); onError?.(e.error.message); }
        else { setError(''); }
      });

      onReady(stripe, elements, card);
      setMounted(true);
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(init, 100);
    return () => { cancelled = true; clearTimeout(timer); };
  }, []);

  return (
    <div>
      <div id="stripe-card-element" className="px-4 py-4 bg-surface-800 border border-white/5 rounded-xl min-h-[44px]" />
      {error && <p className="text-xs text-red-400 mt-1.5 px-1">{error}</p>}
      <div className="flex items-center gap-1.5 mt-2 px-1">
        <Lock className="w-3 h-3 text-slate-600" />
        <span className="text-[10px] text-slate-600">Secured by Stripe • PCI DSS compliant</span>
      </div>
    </div>
  );
}

// ============================================================
// CONSUMER CHECKOUT MODAL
// ============================================================
export function CheckoutModal({ open, onClose, cart, cartTotal, onPlaceOrder }: {
  open: boolean; onClose: () => void;
  cart: { id: string; name: string; price: number; qty: number; image: string }[];
  cartTotal: number; onPlaceOrder: (tip: number, promoCode: string) => void;
}) {
  const { db, showToast } = useAppStore();
  const [step, setStep] = useState<'review' | 'payment' | 'processing' | 'confirm'>('review');
  const [tip, setTip] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [stripeRef, setStripeRef] = useState<{ stripe: Stripe; card: any } | null>(null);
  const [payError, setPayError] = useState('');

  const deliveryFee = db.settings.deliveryBaseFee;
  const platformFee = cartTotal * (db.settings.platformFeePercent / 100);
  const tax = cartTotal * db.settings.taxRate;
  const total = cartTotal + deliveryFee + platformFee + tax + tip - promoDiscount;

  const applyPromo = () => {
    const promo = db.promos.find((p) => p.code.toUpperCase() === promoCode.toUpperCase() && p.active);
    if (promo) {
      const d = promo.type === 'percent' ? cartTotal * (promo.discount / 100) : promo.type === 'flat' ? promo.discount : deliveryFee;
      setPromoDiscount(Math.min(d, cartTotal));
      setPromoApplied(true);
    } else {
      showToast('Invalid promo code', 'error');
    }
  };

  const processPayment = async () => {
    if (!stripeRef) { showToast('Card not ready', 'error'); return; }
    setStep('processing');
    setPayError('');

    try {
      // Create PaymentIntent on server
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100), // cents
          metadata: { type: 'order', items: cart.length.toString(), total: total.toFixed(2) },
        }),
      });
      const { clientSecret, error: apiErr } = await res.json();
      if (apiErr) throw new Error(apiErr);

      // Confirm payment with card
      const { error: stripeErr, paymentIntent } = await stripeRef.stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: stripeRef.card },
      });

      if (stripeErr) throw new Error(stripeErr.message);

      if (paymentIntent?.status === 'succeeded') {
        onPlaceOrder(tip, promoCode);
        setStep('confirm');
      } else {
        throw new Error('Payment not completed');
      }
    } catch (err: any) {
      setPayError(err.message || 'Payment failed');
      setStep('payment');
      showToast(err.message || 'Payment failed', 'error');
    }
  };

  const handleClose = () => { setStep('review'); setTip(0); setPromoCode(''); setPromoApplied(false); setPromoDiscount(0); setPayError(''); onClose(); };

  if (step === 'confirm') {
    return (
      <Modal open={open} onClose={handleClose} variant="dialog" maxWidth="max-w-sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
          <p className="text-2xl font-bold text-emerald-400 mb-1">{formatCurrency(total)}</p>
          <p className="text-sm text-slate-400 mb-6">Your order is being prepared</p>
          <button onClick={handleClose} className="w-full btn-primary bg-emerald-600">Track Order</button>
        </div>
      </Modal>
    );
  }

  if (step === 'processing') {
    return (
      <Modal open={open} onClose={() => {}} variant="dialog" maxWidth="max-w-sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Processing Payment...</h3>
          <p className="text-sm text-slate-400">Securely charging your card via Stripe</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title={step === 'review' ? 'Checkout' : 'Payment'}>
      <div className="p-6 space-y-4">
        {step === 'review' && (
          <>
            {/* Items */}
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Order Summary ({cart.length} items)</div>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.image.startsWith('data:') ? <img src={item.image} className="w-full h-full object-cover" /> : <span>{item.image}</span>}
                  </div>
                  <div className="flex-1"><span className="text-sm text-white">{item.name}</span><span className="text-xs text-slate-500 ml-1">×{item.qty}</span></div>
                  <span className="text-sm font-mono text-white">{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Driver Tip</div>
            <div className="flex gap-2">
              {[0, 2, 5, 10].map((t) => (
                <button key={t} onClick={() => setTip(t)}
                  className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium transition-all', tip === t ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-surface-800 text-slate-500 border border-white/5')}>
                  {t === 0 ? 'None' : `$${t}`}
                </button>
              ))}
            </div>

            {/* Promo */}
            {!promoApplied ? (
              <div className="flex gap-2">
                <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Promo code"
                  className="flex-1 px-4 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-white text-sm font-mono uppercase placeholder-slate-600 focus:outline-none focus:border-emerald-500/30" />
                <button onClick={applyPromo} disabled={!promoCode} className="px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-semibold disabled:opacity-30">Apply</button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <span className="text-sm text-emerald-400 font-mono">{promoCode.toUpperCase()} applied</span>
                <span className="text-sm font-bold text-emerald-400">-{formatCurrency(promoDiscount)}</span>
              </div>
            )}

            {/* Totals */}
            <div className="bg-surface-800 rounded-xl p-4 space-y-2">
              {[
                ['Subtotal', cartTotal],
                ['Delivery', deliveryFee],
                [`Service Fee (${db.settings.platformFeePercent}%)`, platformFee],
                [`Tax (${(db.settings.taxRate * 100).toFixed(1)}%)`, tax],
                ...(tip > 0 ? [['Driver Tip', tip]] : []),
                ...(promoDiscount > 0 ? [['Discount', -promoDiscount]] : []),
              ].map(([l, v]) => (
                <div key={l as string} className="flex justify-between text-xs">
                  <span className="text-slate-400">{l}</span>
                  <span className={cn('font-mono', (v as number) < 0 ? 'text-emerald-400' : 'text-white')}>{(v as number) < 0 ? '-' : ''}{formatCurrency(Math.abs(v as number))}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-white/5">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-emerald-400 text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            <button onClick={() => setStep('payment')} className="w-full btn-primary bg-emerald-600 flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" /> Continue to Payment
            </button>
          </>
        )}

        {step === 'payment' && (
          <>
            <div className="bg-surface-800 rounded-xl p-4 flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Total</span>
              <span className="text-xl font-bold text-emerald-400">{formatCurrency(total)}</span>
            </div>

            {payError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{payError}</span>
              </div>
            )}

            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Card Details</div>
            <StripeCardInput
              onReady={(stripe, elements, card) => setStripeRef({ stripe, card })}
              onError={(msg) => setPayError(msg)}
            />

            <div className="flex gap-2 mt-2">
              <button onClick={() => setStep('review')} className="px-5 py-3 rounded-2xl bg-white/5 text-slate-300 font-medium">Back</button>
              <button onClick={processPayment} disabled={!stripeRef}
                className="flex-1 btn-primary bg-emerald-600 flex items-center justify-center gap-2 disabled:opacity-30">
                <Lock className="w-4 h-4" /> Pay {formatCurrency(total)}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

// ============================================================
// DRIVER PAYOUT MODAL
// ============================================================
export function DriverPayoutModal({ open, onClose, earnings }: { open: boolean; onClose: () => void; earnings: number }) {
  const { dispatch, showToast, currentUserId } = useAppStore();
  const [method, setMethod] = useState<'instant' | 'standard'>('standard');
  const [showAddBank, setShowAddBank] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);

  const instantFee = earnings * 0.015;
  const payout = method === 'instant' ? earnings - instantFee : earnings;

  const processPayout = async () => {
    if (earnings <= 0 || !currentUserId) return;
    setProcessing(true);
    try {
      const user = useAppStore.getState().db.users.find((u) => u.id === currentUserId);
      const res = await fetch('/api/stripe/create-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(payout * 100),
          email: user?.email || 'driver@farmfresh.app',
          role: user?.role || 'driver',
          method,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      dispatch({ type: 'DRIVER_PAYOUT', amount: earnings, method: 'bank', driverId: currentUserId });
      setProcessing(false);
      setComplete(true);
    } catch (err: any) {
      setProcessing(false);
      showToast(err.message || 'Payout failed', 'error');
    }
  };

  const handleClose = () => { setComplete(false); setProcessing(false); setMethod('standard'); onClose(); };

  if (complete) {
    return (
      <Modal open={open} onClose={handleClose} variant="dialog" maxWidth="max-w-sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-scale-in"><DollarSign className="w-8 h-8 text-emerald-400" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Payout Initiated!</h3>
          <p className="text-2xl font-bold text-emerald-400 mb-2">{formatCurrency(payout)}</p>
          <p className="text-xs text-slate-500 mb-6">{method === 'instant' ? 'Arrives within 30 minutes' : 'Arrives in 1-3 business days'}</p>
          <button onClick={handleClose} className="w-full btn-primary bg-emerald-600">Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Withdraw Earnings">
      <div className="p-6 space-y-4">
        <div className="text-center bg-gradient-to-br from-emerald-600/10 to-surface-800/30 rounded-2xl p-5">
          <div className="text-xs text-slate-500 mb-1">Available Balance</div>
          <div className="text-3xl font-bold text-white">{formatCurrency(earnings)}</div>
        </div>

        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Payout Speed</div>
        {[
          { id: 'standard' as const, label: 'Standard', desc: '1-3 business days', fee: 'Free', icon: Clock },
          { id: 'instant' as const, label: 'Instant', desc: 'Within 30 minutes', fee: `${formatCurrency(instantFee)} (1.5%)`, icon: Zap },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={cn('w-full flex items-center gap-3 p-4 rounded-xl border transition-all', method === m.id ? 'bg-blue-500/5 border-blue-500/20' : 'bg-surface-800/50 border-white/5')}>
              <Icon className={cn('w-5 h-5', method === m.id ? 'text-blue-400' : 'text-slate-500')} />
              <div className="flex-1 text-left">
                <div className="text-sm text-white font-medium">{m.label}</div>
                <div className="text-xs text-slate-500">{m.desc}</div>
              </div>
              <span className="text-xs text-slate-400">{m.fee}</span>
              <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', method === m.id ? 'border-blue-500 bg-blue-500' : 'border-slate-600')}>
                {method === m.id && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}

        <div className="bg-surface-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs"><span className="text-slate-400">Earnings</span><span className="text-white font-mono">{formatCurrency(earnings)}</span></div>
          {method === 'instant' && <div className="flex justify-between text-xs"><span className="text-slate-400">Instant fee (1.5%)</span><span className="text-red-400 font-mono">-{formatCurrency(instantFee)}</span></div>}
          <div className="flex justify-between pt-2 border-t border-white/5 text-sm">
            <span className="font-semibold text-white">You receive</span>
            <span className="font-bold text-emerald-400">{formatCurrency(payout)}</span>
          </div>
        </div>

        <button onClick={processPayout} disabled={processing || earnings <= 0}
          className="w-full btn-primary bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-30">
          {processing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <>Withdraw {formatCurrency(payout)}</>}
        </button>
        <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> Stripe Connect • Encrypted transfer</p>
      </div>
    </Modal>
  );
}

// ============================================================
// FARMER SUBSCRIPTION MODAL (Stripe)
// ============================================================
export function SubscriptionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, showToast, currentUserId, authedEmail, db } = useAppStore();
  const [selectedTier, setSelectedTier] = useState<'free' | 'growth' | 'enterprise'>('growth');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [step, setStep] = useState<'plans' | 'payment' | 'processing' | 'confirm'>('plans');
  const [stripeRef, setStripeRef] = useState<{ stripe: Stripe; card: any } | null>(null);
  const [payError, setPayError] = useState('');

  const tiers = [
    { id: 'free' as const, name: 'Starter', price: { monthly: 0, yearly: 0 }, color: '#64748B', icon: Leaf, features: ['Up to 10 products', 'Basic storefront', 'Standard listing', 'Email support', 'Basic analytics'] },
    { id: 'growth' as const, name: 'Growth', price: { monthly: 300, yearly: 2880 }, color: '#EA580C', icon: Rocket, popular: true, features: ['Unlimited products', 'Featured storefront badge', 'Priority listing in search', 'AI product descriptions', 'Advanced analytics & reports', 'Promotional tools', 'Priority support', 'Custom farm page'] },
    { id: 'enterprise' as const, name: 'Enterprise', price: { monthly: 799, yearly: 7670 }, color: '#F59E0B', icon: Crown, features: ['Everything in Growth', 'Dedicated account manager', 'White-label delivery', 'API access', 'Multi-location support', 'Custom integrations', 'Bulk upload tools'] },
  ];

  const selected = tiers.find((t) => t.id === selectedTier)!;
  const price = selected.price[billing];
  const savings = billing === 'yearly' ? selected.price.monthly * 12 - selected.price.yearly : 0;

  const processSubscription = async () => {
    if (selectedTier === 'free') { handleClose(); return; }
    if (!stripeRef) { showToast('Card not ready', 'error'); return; }

    setStep('processing');
    setPayError('');

    try {
      const res = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authedEmail || 'farmer@farmfresh.app',
          plan: selectedTier,
          interval: billing === 'yearly' ? 'year' : 'month',
        }),
      });
      const { clientSecret, error: apiErr } = await res.json();
      if (apiErr) throw new Error(apiErr);

      const { error: stripeErr, paymentIntent } = await stripeRef.stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: stripeRef.card },
      });

      if (stripeErr) throw new Error(stripeErr.message);

      if (currentUserId) {
        dispatch({ type: 'UPGRADE_SUBSCRIPTION', userId: currentUserId, tier: selectedTier === 'growth' ? 'premium' : 'enterprise', billingCycle: billing });
      }
      setStep('confirm');
    } catch (err: any) {
      setPayError(err.message || 'Subscription failed');
      setStep('payment');
      showToast(err.message || 'Payment failed', 'error');
    }
  };

  const handleClose = () => { setStep('plans'); setPayError(''); onClose(); };

  if (step === 'confirm') {
    return (
      <Modal open={open} onClose={handleClose} variant="dialog" maxWidth="max-w-sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in" style={{ backgroundColor: selected.color + '20' }}>
            <Check className="w-8 h-8" style={{ color: selected.color }} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{selected.name} Plan Activated!</h3>
          <p className="text-sm text-slate-400 mb-1">{formatCurrency(price)}/{billing === 'monthly' ? 'mo' : 'yr'}</p>
          {savings > 0 && <p className="text-xs text-emerald-400 mb-4">Saving {formatCurrency(savings)}/year</p>}
          <button onClick={handleClose} className="w-full btn-primary bg-orange-600">Get Started</button>
        </div>
      </Modal>
    );
  }

  if (step === 'processing') {
    return (
      <Modal open={open} onClose={() => {}} variant="dialog" maxWidth="max-w-sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Setting up subscription...</h3>
          <p className="text-sm text-slate-400">Processing via Stripe</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title={step === 'plans' ? 'Choose Your Plan' : 'Payment'}>
      <div className="p-6 space-y-4">
        {step === 'plans' && (
          <>
            <div className="flex items-center justify-center gap-1 bg-surface-800 rounded-xl p-1">
              {(['monthly', 'yearly'] as const).map((b) => (
                <button key={b} onClick={() => setBilling(b)}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-semibold transition-all', billing === b ? 'bg-orange-500 text-white' : 'text-slate-500')}>
                  {b === 'monthly' ? 'Monthly' : 'Yearly'}
                  {b === 'yearly' && <span className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Save 20%</span>}
                </button>
              ))}
            </div>

            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === tier.id;
              return (
                <button key={tier.id} onClick={() => setSelectedTier(tier.id)}
                  className={cn('w-full text-left rounded-2xl p-4 border transition-all relative overflow-hidden', isSelected ? 'border-orange-500/30 bg-white/[0.03]' : 'border-white/5 hover:border-white/10')}>
                  {tier.popular && <div className="absolute top-0 right-0 bg-orange-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg">BEST VALUE</div>}
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className="w-5 h-5" style={{ color: tier.color }} />
                    <span className="font-bold text-white">{tier.name}</span>
                    <div className="ml-auto text-right">
                      <span className="text-lg font-bold text-white">{tier.price[billing] === 0 ? 'Free' : formatCurrency(tier.price[billing])}</span>
                      {tier.price[billing] > 0 && <span className="text-xs text-slate-500">/{billing === 'monthly' ? 'mo' : 'yr'}</span>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {tier.features.slice(0, 4).map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-xs text-slate-400"><Check className="w-3 h-3 flex-shrink-0" style={{ color: tier.color }} />{f}</div>
                    ))}
                  </div>
                  {isSelected && <div className="absolute top-4 right-4"><div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div></div>}
                </button>
              );
            })}

            <button onClick={() => selectedTier === 'free' ? handleClose() : setStep('payment')}
              className="w-full btn-primary bg-orange-600 flex items-center justify-center gap-2">
              {selectedTier === 'free' ? 'Continue with Free Plan' : `Subscribe — ${formatCurrency(price)}/${billing === 'monthly' ? 'mo' : 'yr'}`}
            </button>
          </>
        )}

        {step === 'payment' && (
          <>
            <div className="bg-surface-800 rounded-xl p-4 flex items-center justify-between">
              <div><div className="text-sm font-bold text-white">{selected.name} Plan</div><div className="text-xs text-slate-500">{billing === 'monthly' ? 'Billed monthly' : 'Billed annually'}</div></div>
              <div className="text-right"><div className="text-lg font-bold text-white">{formatCurrency(price)}</div>{savings > 0 && <div className="text-[10px] text-emerald-400">Save {formatCurrency(savings)}/yr</div>}</div>
            </div>

            {payError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{payError}</span>
              </div>
            )}

            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Card Details</div>
            <StripeCardInput
              onReady={(stripe, elements, card) => setStripeRef({ stripe, card })}
              onError={(msg) => setPayError(msg)}
            />

            <div className="text-xs text-slate-500 bg-surface-800 rounded-xl p-3">
              <p>• Your card will be charged {formatCurrency(price)} {billing === 'monthly' ? 'every month' : 'annually'}</p>
              <p>• Cancel anytime — no cancellation fees</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('plans')} className="px-5 py-3 rounded-2xl bg-white/5 text-slate-300 font-medium">Back</button>
              <button onClick={processSubscription} disabled={!stripeRef}
                className="flex-1 btn-primary bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-50">
                <Lock className="w-4 h-4" /> Subscribe {formatCurrency(price)}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
