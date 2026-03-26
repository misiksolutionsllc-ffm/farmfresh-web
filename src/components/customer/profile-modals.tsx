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

// ============================================================
// NOTIFICATION SETTINGS MODAL
// ============================================================
export function NotificationSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useAppStore();
  const [settings, setSettings] = useState([
    { id: 'orders', label: 'Order Updates', desc: 'Status changes, delivery alerts, confirmations', on: true, icon: '📦' },
    { id: 'promos', label: 'Promotions & Deals', desc: 'Weekly deals, flash sales, seasonal offers', on: true, icon: '🎉' },
    { id: 'price', label: 'Price Drop Alerts', desc: 'Notifications when saved items go on sale', on: false, icon: '💰' },
    { id: 'newproducts', label: 'New Products', desc: 'Fresh arrivals from your favorite farms', on: true, icon: '🌱' },
    { id: 'reviews', label: 'Review Reminders', desc: 'Reminders to rate delivered orders', on: true, icon: '⭐' },
    { id: 'sms', label: 'SMS Notifications', desc: 'Text messages for urgent delivery updates', on: false, icon: '📱' },
    { id: 'email', label: 'Email Digest', desc: 'Weekly summary of activity and recommendations', on: true, icon: '📧' },
  ]);

  const toggle = (id: string) => setSettings((s) => s.map((x) => x.id === id ? { ...x, on: !x.on } : x));

  return (
    <Modal open={open} onClose={onClose} title="Notification Settings">
      <div className="p-6 space-y-1">
        {settings.map((n) => (
          <button key={n.id} onClick={() => toggle(n.id)}
            className="w-full flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all rounded-lg px-2 active:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <span className="text-lg">{n.icon}</span>
              <div className="text-left">
                <div className="text-sm text-white">{n.label}</div>
                <div className="text-xs text-slate-500">{n.desc}</div>
              </div>
            </div>
            <div className={cn('w-11 h-6 rounded-full flex items-center transition-all px-0.5', n.on ? 'bg-emerald-500 justify-end' : 'bg-surface-900 justify-start')}>
              <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-all" />
            </div>
          </button>
        ))}
        <button onClick={() => { showToast('Notification settings saved!'); onClose(); }} className="w-full btn-primary bg-emerald-600 mt-4">Save Settings</button>
      </div>
    </Modal>
  );
}

// ============================================================
// ACCOUNT SETTINGS MODAL
// ============================================================
export function AccountSettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useAppStore();
  return (
    <Modal open={open} onClose={onClose} title="Account Settings">
      <div className="p-6 space-y-1">
        {[
          { label: 'Change Password', desc: 'Update your account password', icon: Lock, action: () => showToast('Password change flow') },
          { label: 'Two-Factor Authentication', desc: 'Add an extra layer of security', icon: Shield, action: () => showToast('2FA setup flow') },
          { label: 'Connected Accounts', desc: 'Google, Apple ID connections', icon: Smartphone, action: () => showToast('Connected accounts') },
          { label: 'Language & Region', desc: 'English (US), USD', icon: Settings, action: () => showToast('Language settings') },
          { label: 'Data Export', desc: 'Download your account data', icon: FileText, action: () => showToast('Data export started — check email') },
          { label: 'Delete Account', desc: 'Permanently delete your account', icon: Trash2, danger: true, action: () => showToast('Contact support to delete account', 'error') },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={item.action}
              className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-white/[0.03] transition-all active:bg-white/[0.05]">
              <Icon className={cn('w-4 h-4', item.danger ? 'text-red-400' : 'text-slate-400')} />
              <div className="flex-1 text-left">
                <div className={cn('text-sm', item.danger ? 'text-red-400' : 'text-white')}>{item.label}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

// ============================================================
// PRIVACY & SECURITY MODAL
// ============================================================
export function PrivacyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useAppStore();
  const [settings, setSettings] = useState([
    { id: 'location', label: 'Location Access', desc: 'Used for delivery and nearby farms', on: true },
    { id: 'analytics', label: 'Usage Analytics', desc: 'Help us improve the app experience', on: true },
    { id: 'ads', label: 'Personalized Recommendations', desc: 'Product suggestions based on your history', on: true },
    { id: 'share', label: 'Share Activity with Farms', desc: 'Let farms know your purchase preferences', on: false },
  ]);

  const toggle = (id: string) => setSettings((s) => s.map((x) => x.id === id ? { ...x, on: !x.on } : x));

  return (
    <Modal open={open} onClose={onClose} title="Privacy & Security">
      <div className="p-6 space-y-4">
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400">Your data is encrypted and never sold to third parties</span>
        </div>
        {settings.map((s) => (
          <button key={s.id} onClick={() => toggle(s.id)}
            className="w-full flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div className="text-left">
              <div className="text-sm text-white">{s.label}</div>
              <div className="text-xs text-slate-500">{s.desc}</div>
            </div>
            <div className={cn('w-11 h-6 rounded-full flex items-center px-0.5 transition-all', s.on ? 'bg-emerald-500 justify-end' : 'bg-surface-900 justify-start')}>
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </div>
          </button>
        ))}
        <button onClick={() => { showToast('Privacy settings saved!'); onClose(); }} className="w-full btn-primary bg-emerald-600 mt-2">Save Settings</button>
      </div>
    </Modal>
  );
}

// ============================================================
// HELP & SUPPORT MODAL
// ============================================================
export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useAppStore();
  const faqs = [
    { q: 'How do I track my order?', a: 'Go to Orders tab and tap any order to see real-time tracking with delivery status updates.' },
    { q: 'How do refunds work?', a: 'Cancelled orders are automatically refunded as credits. Pending orders get 100% refund, Processing orders get 90%.' },
    { q: 'What is the Loyalty Program?', a: 'Earn tier status by spending: Bronze ($0+), Silver ($300+), Gold ($1000+). Higher tiers unlock discounts and perks.' },
    { q: 'How do I contact a farmer?', a: 'After placing an order, you can message the farmer directly through the order detail chat feature.' },
  ];
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <Modal open={open} onClose={onClose} title="Help & Support">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '💬', label: 'Live Chat', action: () => showToast('Connecting to support agent...') },
            { icon: '📧', label: 'Email Us', action: () => showToast('Email: support@farmfresh.app') },
            { icon: '📞', label: 'Call Us', action: () => showToast('Phone: 1-800-FRESH-00') },
            { icon: '📋', label: 'Report Issue', action: () => showToast('Issue report form opened') },
          ].map((c) => (
            <button key={c.label} onClick={c.action}
              className="flex items-center gap-2 p-3 rounded-xl bg-surface-800 border border-white/5 hover:border-white/10 transition-all active:scale-[0.97]">
              <span className="text-xl">{c.icon}</span>
              <span className="text-sm text-white">{c.label}</span>
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4">FAQ</div>
        {faqs.map((faq, i) => (
          <button key={i} onClick={() => setExpanded(expanded === i ? null : i)} className="w-full text-left">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white">{faq.q}</span>
              <ChevronRight className={cn('w-4 h-4 text-slate-500 transition-transform', expanded === i && 'rotate-90')} />
            </div>
            {expanded === i && <p className="text-xs text-slate-400 pb-2 pl-1 animate-fade-in">{faq.a}</p>}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ============================================================
// TERMS MODAL
// ============================================================
export function TermsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Terms & Policies">
      <div className="p-6 space-y-2">
        {[
          { label: 'Terms of Service', date: 'Updated Mar 2026', url: '#' },
          { label: 'Privacy Policy', date: 'Updated Mar 2026', url: '#' },
          { label: 'Refund Policy', date: 'Updated Feb 2026', url: '#' },
          { label: 'Community Guidelines', date: 'Updated Jan 2026', url: '#' },
          { label: 'Natural Food Standards', date: 'Updated Mar 2026', url: '#' },
          { label: 'Cookie Policy', date: 'Updated Jan 2026', url: '#' },
        ].map((doc) => (
          <button key={doc.label} className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-white/[0.03] transition-all active:bg-white/[0.05]">
            <FileText className="w-4 h-4 text-slate-400" />
            <div className="flex-1 text-left">
              <div className="text-sm text-white">{doc.label}</div>
              <div className="text-xs text-slate-500">{doc.date}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        ))}
        <p className="text-[10px] text-slate-600 text-center pt-3">© 2026 FarmFresh Hub. All rights reserved.</p>
      </div>
    </Modal>
  );
}

// ============================================================
// SIGN OUT CONFIRM
// ============================================================
export function SignOutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setRole, showToast } = useAppStore();
  return (
    <Modal open={open} onClose={onClose} variant="dialog" maxWidth="max-w-sm">
      <div className="p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-7 h-7 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Sign Out?</h3>
        <p className="text-sm text-slate-400 mb-6">You'll need to sign in again to access your account.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-2xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-all active:scale-[0.97]">Cancel</button>
          <button onClick={() => { setRole(null); showToast('Signed out', 'info'); onClose(); }}
            className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-500 transition-all active:scale-[0.97]">Sign Out</button>
        </div>
      </div>
    </Modal>
  );
}
