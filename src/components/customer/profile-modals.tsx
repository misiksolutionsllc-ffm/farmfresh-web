'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { Modal } from '@/components/ui/modal';
import { ProgressBar } from '@/components/ui/charts';
import { cn, formatCurrency } from '@/lib/utils';
import {
  User, MapPin, Phone, Mail, CreditCard, Shield, Bell, Gift,
  Crown, Pencil, Plus, Check, X, Star, ChevronRight, Copy,
  Share2, Trash2, Eye, EyeOff, Lock, HelpCircle, FileText,
  MessageSquare, LogOut, Leaf, Settings, AlertTriangle, Landmark,
  Smartphone, ArrowRight, Award, TrendingUp, Package, ShoppingBag,
} from 'lucide-react';

// ============================================================
// EDIT PROFILE MODAL
// ============================================================
export function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { db, dispatch, showToast, currentUserId } = useAppStore();
  const user = db.users.find((u) => u.id === currentUserId);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email] = useState(user?.email || '');

  const save = () => {
    if (currentUserId && name) {
      dispatch({ type: 'UPDATE_USER_PROFILE', userId: currentUserId, updates: { name, phone } });
      showToast('Profile updated!');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile">
      <div className="p-6 space-y-4">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-emerald-400">{name.charAt(0)}</span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white border-2 border-surface-900">
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/30" />
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">Email</label>
          <div className="flex items-center gap-2">
            <input value={email} disabled className="flex-1 px-4 py-3 bg-surface-800/50 border border-white/5 rounded-xl text-slate-500" />
            <span className="badge bg-emerald-500/15 text-emerald-400">Verified</span>
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">Phone Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567"
            className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/30" />
        </div>
        <button onClick={save} className="w-full btn-primary bg-emerald-600">Save Changes</button>
      </div>
    </Modal>
  );
}

// ============================================================
// LOYALTY DETAILS MODAL
// ============================================================
export function LoyaltyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { db, currentUserId } = useAppStore();
  const user = db.users.find((u) => u.id === currentUserId);
  const tier = user?.loyaltyTier || 'Bronze';
  const spent = user?.totalSpent || 0;

  const tiers = [
    { name: 'Bronze', min: 0, color: '#92400E', benefits: ['Free delivery on orders over $50', 'Early access to sales', 'Birthday bonus points'] },
    { name: 'Silver', min: 300, color: '#94A3B8', benefits: ['5% off all orders', 'Free delivery over $30', 'Priority support', '2x points on weekends'] },
    { name: 'Gold', min: 1000, color: '#F59E0B', benefits: ['10% off all orders', 'Free delivery always', 'VIP support', '3x points', 'Exclusive products', 'Monthly surprise box'] },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Loyalty Program">
      <div className="p-6 space-y-5">
        <div className="text-center bg-gradient-to-br from-amber-500/10 to-surface-800/30 rounded-2xl p-5">
          <Crown className="w-8 h-8 mx-auto mb-2" style={{ color: tiers.find((t) => t.name === tier)?.color }} />
          <h3 className="text-xl font-bold text-white">{tier} Member</h3>
          <p className="text-sm text-slate-400 mt-1">{formatCurrency(spent)} lifetime spending</p>
        </div>

        <ProgressBar value={spent} max={1000} color="#F59E0B" height={10} label="Progress to Gold" showValue />

        <div className="space-y-3">
          {tiers.map((t) => {
            const isActive = tier === t.name;
            const isUnlocked = spent >= t.min;
            return (
              <div key={t.name} className={cn('rounded-2xl p-4 border transition-all', isActive ? 'bg-white/[0.04] border-amber-500/20' : 'border-white/5')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4" style={{ color: t.color }} />
                    <span className="font-semibold text-white">{t.name}</span>
                    {isActive && <span className="badge bg-amber-500/15 text-amber-400">Current</span>}
                  </div>
                  <span className="text-xs text-slate-500">{formatCurrency(t.min)}+</span>
                </div>
                <ul className="space-y-1.5">
                  {t.benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-xs">
                      <Check className={cn('w-3 h-3 flex-shrink-0', isUnlocked ? 'text-emerald-400' : 'text-slate-600')} />
                      <span className={isUnlocked ? 'text-slate-300' : 'text-slate-600'}>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// ADDRESS MODAL (Add/Edit)
// ============================================================
export function AddressModal({ open, onClose, editMode }: { open: boolean; onClose: () => void; editMode?: boolean }) {
  const { db, dispatch, showToast, currentUserId } = useAppStore();
  const user = db.users.find((u) => u.id === currentUserId);
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>(editMode ? 'Home' : 'Home');
  const [street, setStreet] = useState(editMode ? user?.address?.street || '' : '');
  const [city, setCity] = useState(editMode ? user?.address?.city || '' : '');
  const [state, setState] = useState(editMode ? user?.address?.state || '' : '');
  const [zip, setZip] = useState(editMode ? user?.address?.zip || '' : '');

  const save = () => {
    if (currentUserId && street && city && state && zip) {
      dispatch({ type: 'UPDATE_USER_PROFILE', userId: currentUserId, updates: { address: { street, city, state, zip, label } } });
      showToast(editMode ? 'Address updated!' : 'Address added!');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={editMode ? 'Edit Address' : 'Add Address'}>
      <div className="p-6 space-y-4">
        <div className="flex gap-2">
          {(['Home', 'Work', 'Other'] as const).map((l) => (
            <button key={l} onClick={() => setLabel(l)}
              className={cn('flex-1 py-2.5 rounded-xl text-sm font-medium transition-all', label === l ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-surface-800 text-slate-500 border border-white/5')}>
              {l === 'Home' ? '🏠' : l === 'Work' ? '💼' : '📍'} {l}
            </button>
          ))}
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1.5 block">Street Address</label>
          <input value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main St"
            className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/30" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/30" />
          <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" maxLength={2} className="px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/30 uppercase" />
          <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="ZIP" className="px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/30" />
        </div>
        <button onClick={save} disabled={!street || !city || !state || !zip} className="w-full btn-primary bg-emerald-600 disabled:opacity-30">
          {editMode ? 'Update Address' : 'Save Address'}
        </button>
        {editMode && (
          <button onClick={() => { if (currentUserId) { dispatch({ type: 'UPDATE_USER_PROFILE', userId: currentUserId, updates: { address: undefined } }); showToast('Address removed'); onClose(); } }}
            className="w-full py-2.5 text-sm text-red-400/60 hover:text-red-400 transition-colors">Remove this address</button>
        )}
      </div>
    </Modal>
  );
}

// ============================================================
// PAYMENT METHOD MODAL (Add/Manage)
// ============================================================
export function PaymentModal({ open, onClose, mode }: { open: boolean; onClose: () => void; mode: 'add' | 'visa' | 'apple' }) {
  const { showToast } = useAppStore();
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');

  if (mode === 'add') {
    return (
      <Modal open={open} onClose={onClose} title="Add Payment Method">
        <div className="p-6 space-y-4">
          <div className="flex gap-2 mb-2">
            {['💳 Card', '🍎 Apple Pay', '🏦 Bank'].map((m) => (
              <button key={m} className="flex-1 py-2.5 rounded-xl bg-surface-800 border border-white/5 text-sm text-slate-400 hover:border-white/10 transition-all">{m}</button>
            ))}
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Card Number</label>
            <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
              placeholder="1234 5678 9012 3456" maxLength={19}
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500/30" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Expiry</label>
              <input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" maxLength={5}
                className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500/30" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">CVV</label>
              <input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" maxLength={4} type="password"
                className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500/30" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">ZIP</label>
              <input placeholder="33414" className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500/30" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Name on Card</label>
            <input value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} placeholder="John Smith"
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-emerald-500/30" />
          </div>
          <button onClick={() => { showToast('Payment method added!'); onClose(); }} className="w-full btn-primary bg-emerald-600">Add Card</button>
          <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Encrypted with 256-bit SSL</p>
        </div>
      </Modal>
    );
  }

  if (mode === 'visa') {
    return (
      <Modal open={open} onClose={onClose} title="Visa •••• 4242">
        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/10 border border-blue-500/20 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute top-3 right-4 text-xs text-blue-400 font-bold">VISA</div>
            <p className="text-slate-400 text-xs mb-6">Debit Card</p>
            <p className="text-white font-mono text-lg tracking-widest mb-4">•••• •••• •••• 4242</p>
            <div className="flex justify-between text-xs">
              <div><span className="text-slate-500">Name</span><br /><span className="text-white">Alice Consumer</span></div>
              <div><span className="text-slate-500">Expires</span><br /><span className="text-white">12/28</span></div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/5">
            <span className="text-sm text-slate-300">Default payment</span>
            <div className="w-10 h-6 rounded-full bg-emerald-500 flex items-center justify-end px-0.5"><div className="w-5 h-5 rounded-full bg-white shadow-sm" /></div>
          </div>
          <div className="space-y-2">
            <button onClick={() => { showToast('Card updated'); onClose(); }} className="w-full py-3 rounded-xl bg-surface-800 text-sm text-slate-300 hover:bg-white/5 transition-all">Update Card Details</button>
            <button onClick={() => { showToast('Card removed'); onClose(); }} className="w-full py-3 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all">Remove Card</button>
          </div>
        </div>
      </Modal>
    );
  }

  // Apple Pay
  return (
    <Modal open={open} onClose={onClose} title="Apple Pay">
      <div className="p-6 space-y-4">
        <div className="text-center py-6">
          <span className="text-5xl block mb-3">🍎</span>
          <h3 className="text-lg font-bold text-white">Apple Pay Connected</h3>
          <p className="text-sm text-slate-400 mt-1">Linked to your Apple ID</p>
        </div>
        <div className="bg-surface-800 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-xs"><span className="text-slate-500">Status</span><span className="text-emerald-400 font-semibold">Connected</span></div>
          <div className="flex justify-between text-xs"><span className="text-slate-500">Device</span><span className="text-white">iPhone</span></div>
        </div>
        <button onClick={() => { showToast('Apple Pay disconnected', 'info'); onClose(); }} className="w-full py-3 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/5 transition-all">Disconnect Apple Pay</button>
      </div>
    </Modal>
  );
}

// ============================================================
// DIETARY PREFERENCES MODAL
// ============================================================
export function DietaryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useAppStore();
  const [prefs, setPrefs] = useState([
    { id: 'organic', label: '🌿 Organic', active: true },
    { id: 'vegan', label: '🌱 Vegan', active: false },
    { id: 'nutfree', label: '🥜 Nut-Free', active: false },
    { id: 'glutenfree', label: '🌾 Gluten-Free', active: true },
    { id: 'dairyfree', label: '🥛 Dairy-Free', active: false },
    { id: 'localhoney', label: '🍯 Local Honey', active: true },
    { id: 'keto', label: '🥑 Keto', active: false },
    { id: 'paleo', label: '🍖 Paleo', active: false },
    { id: 'lowsodium', label: '🧂 Low Sodium', active: false },
  ]);

  const toggle = (id: string) => setPrefs((p) => p.map((x) => x.id === id ? { ...x, active: !x.active } : x));

  return (
    <Modal open={open} onClose={onClose} title="Dietary Preferences">
      <div className="p-6 space-y-4">
        <p className="text-sm text-slate-400">Select your dietary preferences to personalize product recommendations.</p>
        <div className="flex flex-wrap gap-2">
          {prefs.map((p) => (
            <button key={p.id} onClick={() => toggle(p.id)}
              className={cn('px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.95]',
                p.active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-surface-800 text-slate-500 border border-white/5 hover:border-white/10')}>
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={() => { showToast('Preferences saved!'); onClose(); }} className="w-full btn-primary bg-emerald-600">Save Preferences</button>
      </div>
    </Modal>
  );
}
