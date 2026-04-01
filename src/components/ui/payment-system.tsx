'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { Modal } from '@/components/ui/modal';
import { cn, formatCurrency } from '@/lib/utils';
import {
  CreditCard, Landmark, Plus, Check, X, ChevronRight, Shield, Lock,
  Smartphone, Trash2, Star, DollarSign, ArrowRight, Zap, Crown,
  Rocket, Leaf, AlertTriangle, Clock, BadgePercent, Gift, Wallet,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================
interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'apple_pay';
  brand?: string;
  last4: string;
  expiry?: string;
  name: string;
  isDefault: boolean;
  bankName?: string;
  accountType?: string;
}

const DEFAULT_METHODS: PaymentMethod[] = [
  { id: 'visa-4242', type: 'card', brand: 'Visa', last4: '4242', expiry: '12/28', name: 'Personal Visa', isDefault: true },
  { id: 'apple-pay', type: 'apple_pay', last4: '', name: 'Apple Pay', isDefault: false },
];

const DEFAULT_BANK: PaymentMethod = { id: 'chase-4821', type: 'bank', last4: '4821', name: 'Chase Bank', isDefault: true, bankName: 'Chase', accountType: 'Checking' };

// ============================================================
// CONSUMER CHECKOUT MODAL
// ============================================================
export function CheckoutModal({ open, onClose, cart, cartTotal, onPlaceOrder }: {
  open: boolean; onClose: () => void;
  cart: { id: string; name: string; price: number; qty: number; image: string }[];
  cartTotal: number; onPlaceOrder: (tip: number, promoCode: string) => void;
}) {
  const { db, showToast } = useAppStore();
  const [step, setStep] = useState<'review' | 'payment' | 'confirm'>('review');
  const [selectedPayment, setSelectedPayment] = useState('visa-4242');
  const [tip, setTip] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [processing, setProcessing] = useState(false);

  const deliveryFee = db.settings.deliveryBaseFee;
  const serviceFee = cartTotal * (db.settings.platformFeePercent / 100);
  const tax = cartTotal * db.settings.taxRate;
  const discount = promoDiscount;
  const total = cartTotal + deliveryFee + serviceFee + tax + tip - discount;

  const applyPromo = () => {
    const promo = db.promos.find((p) => p.code.toUpperCase() === promoCode.toUpperCase() && p.active);
    if (promo) {
      const d = promo.type === 'percent' ? cartTotal * (promo.discount / 100) : promo.type === 'flat' ? promo.discount : deliveryFee;
      setPromoDiscount(Math.min(d, cartTotal));
      setPromoApplied(true);
      showToast(`Promo applied! -${formatCurrency(d)}`);
    } else {
      showToast('Invalid promo code', 'error');
    }
  };

  const processPayment = () => {
    setProcessing(true);
    setTimeout(() => {
      onPlaceOrder(tip, promoApplied ? promoCode : '');
      setProcessing(false);
      setStep('confirm');
    }, 1500);
  };

  const handleClose = () => { setStep('review'); setTip(0); setPromoCode(''); setPromoApplied(false); setPromoDiscount(0); onClose(); };

  if (step === 'confirm') {
    return (
      <Modal open={open} onClose={handleClose} variant="dialog" maxWidth="max-w-sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Order Placed!</h3>
          <p className="text-sm text-slate-400 mb-1">Total charged: <span className="text-white font-bold">{formatCurrency(total)}</span></p>
          <p className="text-xs text-slate-500 mb-6">You'll receive updates as your order is prepared and delivered.</p>
          <button onClick={handleClose} className="w-full btn-primary bg-emerald-600">Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title={step === 'review' ? 'Checkout' : 'Payment'}>
      <div className="p-6 space-y-4">
        {step === 'review' && (
          <>
            {/* Order Summary */}
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Order Summary</div>
            <div className="max-h-40 overflow-y-auto space-y-2 scrollbar-none">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-surface-800 rounded-lg flex items-center justify-center overflow-hidden">
                      {item.image?.startsWith?.('data:') ? <img src={item.image} className="w-full h-full object-cover" /> : <span className="text-sm">{item.image}</span>}
                    </div>
                    <span className="text-slate-300">{item.name} × {item.qty}</span>
                  </div>
                  <span className="text-white font-mono">{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Driver Tip</div>
              <div className="flex gap-2">
                {[0, 2, 3, 5].map((t) => (
                  <button key={t} onClick={() => setTip(t)}
                    className={cn('flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all', tip === t ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-surface-800 text-slate-500 border border-white/5')}>
                    {t === 0 ? 'None' : `$${t}`}
                  </button>
                ))}
                <input type="number" placeholder="Other" min={0} value={tip > 5 ? tip : ''} onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                  className="w-20 px-3 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-white text-sm text-center focus:outline-none focus:border-emerald-500/30" />
              </div>
            </div>

            {/* Promo Code */}
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Promo Code</div>
              {promoApplied ? (
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <BadgePercent className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400 font-semibold">{promoCode.toUpperCase()}</span>
                    <span className="text-xs text-emerald-400/60">-{formatCurrency(promoDiscount)}</span>
                  </div>
                  <button onClick={() => { setPromoApplied(false); setPromoDiscount(0); setPromoCode(''); }} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Enter code"
                    className="flex-1 px-4 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-white text-sm uppercase focus:outline-none focus:border-emerald-500/30" />
                  <button onClick={applyPromo} disabled={!promoCode} className="px-4 py-2.5 rounded-xl bg-emerald-600/80 text-white text-sm font-semibold disabled:opacity-30">Apply</button>
                </div>
              )}
            </div>

            {/* Fee Breakdown */}
            <div className="bg-surface-800 rounded-xl p-4 space-y-2">
              {[
                ['Subtotal', cartTotal],
                ['Delivery', deliveryFee],
                ['Service Fee', serviceFee],
                ['Tax', tax],
                ...(tip > 0 ? [['Driver Tip', tip]] : []),
                ...(discount > 0 ? [['Discount', -discount]] : []),
              ].map(([l, v]) => (
                <div key={l as string} className="flex justify-between text-xs">
                  <span className="text-slate-400">{l}</span>
                  <span className={cn('font-mono', (v as number) < 0 ? 'text-emerald-400' : 'text-white')}>{(v as number) < 0 ? '-' : ''}{formatCurrency(Math.abs(v as number))}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-white/5 text-sm">
                <span className="font-semibold text-white">Total</span>
                <span className="font-bold text-emerald-400 text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            <button onClick={() => setStep('payment')} className="w-full btn-primary bg-emerald-600 flex items-center justify-center gap-2">
              Continue to Payment <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {step === 'payment' && (
          <>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Select Payment Method</div>

            {DEFAULT_METHODS.map((pm) => (
              <button key={pm.id} onClick={() => setSelectedPayment(pm.id)}
                className={cn('w-full flex items-center gap-3 p-4 rounded-xl border transition-all', selectedPayment === pm.id ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-surface-800/50 border-white/5 hover:border-white/10')}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: pm.type === 'card' ? '#3B82F620' : '#94A3B820' }}>
                  {pm.type === 'card' ? <CreditCard className="w-5 h-5 text-blue-400" /> : <span className="text-lg">🍎</span>}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm text-white font-medium">{pm.type === 'card' ? `${pm.brand} •••• ${pm.last4}` : 'Apple Pay'}</div>
                  {pm.expiry && <div className="text-xs text-slate-500">Expires {pm.expiry}</div>}
                </div>
                <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', selectedPayment === pm.id ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600')}>
                  {selectedPayment === pm.id && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            ))}

            {/* Add new card */}
            <button className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/10 text-slate-500 hover:text-white hover:border-white/20 transition-all">
              <Plus className="w-5 h-5" />
              <span className="text-sm">Add new payment method</span>
            </button>

            {/* Total and Pay */}
            <div className="bg-surface-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Total</div>
                <div className="text-xl font-bold text-white">{formatCurrency(total)}</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500"><Lock className="w-3 h-3" /> 256-bit SSL</div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('review')} className="px-5 py-3 rounded-2xl bg-white/5 text-slate-300 font-medium">Back</button>
              <button onClick={processPayment} disabled={processing}
                className="flex-1 btn-primary bg-emerald-600 flex items-center justify-center gap-2 disabled:opacity-50">
                {processing ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <>Pay {formatCurrency(total)}</>
                )}
              </button>
            </div>

            <p className="text-[10px] text-slate-600 text-center">By paying, you agree to FarmFresh Hub Terms of Service</p>
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

  const instantFee = earnings * 0.015; // 1.5% instant fee
  const payout = method === 'instant' ? earnings - instantFee : earnings;

  const processPayout = () => {
    if (earnings <= 0 || !currentUserId) return;
    setProcessing(true);
    setTimeout(() => {
      dispatch({ type: 'DRIVER_PAYOUT', amount: earnings, method: 'bank', driverId: currentUserId });
      setProcessing(false);
      setComplete(true);
    }, 2000);
  };

  const handleClose = () => { setComplete(false); setProcessing(false); setMethod('standard'); onClose(); };

  if (complete) {
    return (
      <Modal open={open} onClose={handleClose} variant="dialog" maxWidth="max-w-sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <DollarSign className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Payout Initiated!</h3>
          <p className="text-2xl font-bold text-emerald-400 mb-2">{formatCurrency(payout)}</p>
          <p className="text-sm text-slate-400 mb-1">To Chase Bank •••• 4821</p>
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

        {/* Payout Method */}
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Payout Speed</div>
        {[
          { id: 'standard' as const, label: 'Standard', desc: '1-3 business days', fee: 'Free', icon: Clock },
          { id: 'instant' as const, label: 'Instant', desc: 'Within 30 minutes', fee: `${formatCurrency(instantFee)} fee (1.5%)`, icon: Zap },
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

        {/* Bank Account */}
        <div className="text-[10px] text-slate-500 uppercase tracking-wider">Deposit To</div>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-800 border border-white/5">
          <Landmark className="w-5 h-5 text-blue-400" />
          <div className="flex-1">
            <div className="text-sm text-white font-medium">Chase Bank •••• 4821</div>
            <div className="text-xs text-slate-500">Checking Account</div>
          </div>
          <span className="badge bg-emerald-500/15 text-emerald-400">Verified</span>
        </div>
        <button onClick={() => setShowAddBank(!showAddBank)} className="w-full text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1">
          <Plus className="w-3 h-3" /> Add different bank account
        </button>

        {showAddBank && (
          <div className="space-y-3 p-4 bg-surface-800/50 rounded-xl border border-white/5 animate-fade-in">
            <input placeholder="Bank Name" className="w-full px-4 py-2.5 bg-surface-900 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/30" />
            <input placeholder="Routing Number (9 digits)" maxLength={9} className="w-full px-4 py-2.5 bg-surface-900 border border-white/5 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500/30" />
            <input placeholder="Account Number" className="w-full px-4 py-2.5 bg-surface-900 border border-white/5 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500/30" />
            <div className="flex gap-2">
              {['Checking', 'Savings'].map((t) => (
                <button key={t} className="flex-1 py-2 rounded-lg bg-surface-900 text-xs text-slate-400 border border-white/5 hover:border-white/10 transition-all">{t}</button>
              ))}
            </div>
            <button onClick={() => { showToast('Bank account added!'); setShowAddBank(false); }} className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">Save Bank Account</button>
          </div>
        )}

        {/* Payout Summary */}
        <div className="bg-surface-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs"><span className="text-slate-400">Earnings</span><span className="text-white font-mono">{formatCurrency(earnings)}</span></div>
          {method === 'instant' && <div className="flex justify-between text-xs"><span className="text-slate-400">Instant transfer fee (1.5%)</span><span className="text-red-400 font-mono">-{formatCurrency(instantFee)}</span></div>}
          <div className="flex justify-between pt-2 border-t border-white/5 text-sm">
            <span className="font-semibold text-white">You receive</span>
            <span className="font-bold text-emerald-400">{formatCurrency(payout)}</span>
          </div>
        </div>

        <button onClick={processPayout} disabled={processing || earnings <= 0}
          className="w-full btn-primary bg-blue-600 flex items-center justify-center gap-2 disabled:opacity-30">
          {processing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <>Withdraw {formatCurrency(payout)}</>}
        </button>
        <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> FDIC insured • Encrypted transfer</p>
      </div>
    </Modal>
  );
}

// ============================================================
// FARMER SUBSCRIPTION MODAL
// ============================================================
export function SubscriptionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { dispatch, showToast, currentUserId } = useAppStore();
  const [selectedTier, setSelectedTier] = useState<'free' | 'growth' | 'enterprise'>('growth');
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [step, setStep] = useState<'plans' | 'payment' | 'confirm'>('plans');
  const [selectedPayment, setSelectedPayment] = useState('visa-4242');
  const [processing, setProcessing] = useState(false);

  const tiers = [
    { id: 'free' as const, name: 'Starter', price: { monthly: 0, yearly: 0 }, color: '#64748B', icon: Leaf, features: ['Up to 10 products', 'Basic storefront', 'Standard listing', 'Email support', 'Basic analytics'] },
    { id: 'growth' as const, name: 'Growth', price: { monthly: 300, yearly: 2880 }, color: '#EA580C', icon: Rocket, popular: true, features: ['Unlimited products', 'Featured storefront badge', 'Priority listing in search', 'AI product descriptions', 'Advanced analytics & reports', 'Promotional tools', 'Priority support', 'Custom farm page'] },
    { id: 'enterprise' as const, name: 'Enterprise', price: { monthly: 799, yearly: 7670 }, color: '#F59E0B', icon: Crown, features: ['Everything in Growth', 'Dedicated account manager', 'White-label delivery', 'API access', 'Multi-location support', 'Custom integrations', 'Bulk upload tools'] },
  ];

  const selected = tiers.find((t) => t.id === selectedTier)!;
  const price = selected.price[billing];
  const savings = billing === 'yearly' ? selected.price.monthly * 12 - selected.price.yearly : 0;

  const processSubscription = () => {
    setProcessing(true);
    setTimeout(() => {
      if (currentUserId) {
        dispatch({ type: 'UPGRADE_SUBSCRIPTION', userId: currentUserId, tier: selectedTier === 'growth' ? 'premium' : selectedTier === 'enterprise' ? 'enterprise' : 'basic', billingCycle: billing });
      }
      setProcessing(false);
      setStep('confirm');
    }, 2000);
  };

  const handleClose = () => { setStep('plans'); setProcessing(false); onClose(); };

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

  return (
    <Modal open={open} onClose={handleClose} title={step === 'plans' ? 'Choose Your Plan' : 'Payment'}>
      <div className="p-6 space-y-4">
        {step === 'plans' && (
          <>
            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-1 bg-surface-800 rounded-xl p-1">
              {(['monthly', 'yearly'] as const).map((b) => (
                <button key={b} onClick={() => setBilling(b)}
                  className={cn('flex-1 py-2 rounded-lg text-sm font-semibold transition-all', billing === b ? 'bg-orange-500 text-white' : 'text-slate-500')}>
                  {b === 'monthly' ? 'Monthly' : 'Yearly'}
                  {b === 'yearly' && <span className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Save 20%</span>}
                </button>
              ))}
            </div>

            {/* Plan cards */}
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
                      <div key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Check className="w-3 h-3 flex-shrink-0" style={{ color: tier.color }} />{f}
                      </div>
                    ))}
                  </div>
                  {tier.features.length > 4 && <div className="text-[10px] text-slate-500 mt-1">+ {tier.features.length - 4} more features</div>}
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
              <div>
                <div className="text-sm font-bold text-white">{selected.name} Plan</div>
                <div className="text-xs text-slate-500">{billing === 'monthly' ? 'Billed monthly' : 'Billed annually'}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{formatCurrency(price)}</div>
                {savings > 0 && <div className="text-[10px] text-emerald-400">Save {formatCurrency(savings)}/yr</div>}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Payment Method</div>
            {DEFAULT_METHODS.filter((m) => m.type === 'card').map((pm) => (
              <button key={pm.id} onClick={() => setSelectedPayment(pm.id)}
                className={cn('w-full flex items-center gap-3 p-4 rounded-xl border transition-all', selectedPayment === pm.id ? 'bg-orange-500/5 border-orange-500/20' : 'bg-surface-800/50 border-white/5')}>
                <CreditCard className="w-5 h-5 text-blue-400" />
                <div className="flex-1 text-left">
                  <div className="text-sm text-white">{pm.brand} •••• {pm.last4}</div>
                  <div className="text-xs text-slate-500">Expires {pm.expiry}</div>
                </div>
                <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', selectedPayment === pm.id ? 'border-orange-500 bg-orange-500' : 'border-slate-600')}>
                  {selectedPayment === pm.id && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            ))}

            <div className="text-xs text-slate-500 bg-surface-800 rounded-xl p-3">
              <p>• Your card will be charged {formatCurrency(price)} {billing === 'monthly' ? 'every month' : 'annually'}</p>
              <p>• Cancel anytime — no cancellation fees</p>
              <p>• Prorated refund if you downgrade mid-cycle</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep('plans')} className="px-5 py-3 rounded-2xl bg-white/5 text-slate-300 font-medium">Back</button>
              <button onClick={processSubscription} disabled={processing}
                className="flex-1 btn-primary bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-50">
                {processing ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</> : <>Subscribe {formatCurrency(price)}</>}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Encrypted • PCI DSS compliant</p>
          </>
        )}
      </div>
    </Modal>
  );
}
