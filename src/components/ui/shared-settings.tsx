'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/app-store';
import { createClient } from '@/lib/supabase/client';
import { Modal } from '@/components/ui/modal';
import { LEGAL_DOCUMENTS } from '@/lib/legal-documents';
import { cn, formatCurrency } from '@/lib/utils';
import {
  Settings, Shield, Bell, HelpCircle, FileText, ChevronRight, ChevronDown,
  MapPin, Globe, Lock, Smartphone, Trash2, LogOut, User, Mail, Phone,
  Pencil, Check, X, Moon, Sun, Zap, Eye, EyeOff, Copy, Share2,
  CreditCard, AlertTriangle, Download, Languages, Volume2, VolumeX,
} from 'lucide-react';

// ============================================================
// GEO-AWARE STATE DETECTION
// ============================================================
interface StatePrivacyInfo {
  state: string;
  code: string;
  law: string;
  rights: string[];
  sensitive: string[];
  enforced: string;
}

const STATE_PRIVACY_LAWS: Record<string, StatePrivacyInfo> = {
  CA: { state: 'California', code: 'CA', law: 'CCPA/CPRA', rights: ['Right to Know', 'Right to Delete', 'Right to Correct', 'Right to Opt-Out of Sale/Sharing', 'Right to Limit Sensitive PI', 'Right to Non-Discrimination'], sensitive: ['Precise geolocation', 'Race/ethnicity', 'Health data', 'Biometric data', 'Financial data'], enforced: 'CA Attorney General & CPPA' },
  FL: { state: 'Florida', code: 'FL', law: 'Florida Digital Bill of Rights', rights: ['Right to Know', 'Right to Delete', 'Right to Correct', 'Right to Opt-Out of Sensitive Data Sale'], sensitive: ['Precise geolocation', 'Biometric data'], enforced: 'FL Attorney General' },
  TX: { state: 'Texas', code: 'TX', law: 'TDPSA', rights: ['Right to Know', 'Right to Delete', 'Right to Correct', 'Right to Opt-Out of Sale', 'Right to Opt-Out of Profiling'], sensitive: ['Precise geolocation', 'Race/ethnicity', 'Health data', 'Biometric data'], enforced: 'TX Attorney General' },
  NY: { state: 'New York', code: 'NY', law: 'NY SHIELD Act + Proposed NY Privacy Act', rights: ['Data breach notification', 'Reasonable security measures'], sensitive: ['SSN', 'Financial account data', 'Biometric data'], enforced: 'NY Attorney General' },
  CO: { state: 'Colorado', code: 'CO', law: 'CPA + AI Act', rights: ['Right to Know', 'Right to Delete', 'Right to Correct', 'Right to Opt-Out', 'Right to Data Portability', 'AI Transparency Rights'], sensitive: ['Precise geolocation', 'Race/ethnicity', 'Health data', 'Biometric data'], enforced: 'CO Attorney General' },
  VA: { state: 'Virginia', code: 'VA', law: 'VCDPA', rights: ['Right to Know', 'Right to Delete', 'Right to Correct', 'Right to Opt-Out', 'Right to Data Portability'], sensitive: ['Precise geolocation', 'Race/ethnicity', 'Health data'], enforced: 'VA Attorney General' },
  CT: { state: 'Connecticut', code: 'CT', law: 'CTDPA', rights: ['Right to Know', 'Right to Delete', 'Right to Correct', 'Right to Opt-Out', 'Right to Data Portability'], sensitive: ['Precise geolocation', 'Race/ethnicity', 'Health data', 'Biometric data'], enforced: 'CT Attorney General' },
  NE: { state: 'Nebraska', code: 'NE', law: 'NDPA (applies to ALL businesses)', rights: ['Right to Know', 'Right to Delete', 'Right to Correct', 'Right to Opt-Out'], sensitive: ['Precise geolocation', 'Biometric data'], enforced: 'NE Attorney General' },
};

const DEFAULT_PRIVACY: StatePrivacyInfo = { state: 'United States', code: 'US', law: 'FTC Act Section 5 + State Laws', rights: ['Right to Access', 'Right to Delete', 'Right to Correct', 'Data breach notification'], sensitive: ['Precise geolocation', 'Financial data'], enforced: 'FTC + State Attorneys General' };

function getPrivacyInfo(stateCode?: string): StatePrivacyInfo {
  return (stateCode && STATE_PRIVACY_LAWS[stateCode]) || DEFAULT_PRIVACY;
}

// ============================================================
// LEGAL DOCUMENT VIEWER (shared across all roles)
// ============================================================
export function LegalDocViewer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const selectedDoc = activeDoc ? LEGAL_DOCUMENTS.find((d) => d.id === activeDoc) : null;

  const handleClose = () => { setActiveDoc(null); onClose(); };

  if (selectedDoc) {
    return (
      <Modal open={open} onClose={handleClose} title={selectedDoc.title}>
        <div className="relative">
          <button onClick={() => setActiveDoc(null)} className="sticky top-0 z-10 w-full flex items-center gap-2 px-6 py-3 bg-surface-900/95 backdrop-blur-xl border-b border-white/5 text-sm text-emerald-400 hover:text-emerald-300">
            <ChevronRight className="w-4 h-4 rotate-180" /> Back to all documents
          </button>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{selectedDoc.icon}</span>
              <h2 className="text-lg font-bold text-white">{selectedDoc.title}</h2>
            </div>
            <p className="text-xs text-slate-500 mb-6">Last updated: {selectedDoc.lastUpdated} • MISIKSOLUTIONS LLC</p>
            <div className="space-y-6">
              {selectedDoc.sections.map((section, i) => (
                <div key={i}>
                  <h3 className="text-sm font-bold text-emerald-400 mb-2">{section.heading}</h3>
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{section.content}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-white/5 text-center">
              <p className="text-[10px] text-slate-600">© 2026 MISIKSOLUTIONS LLC. All rights reserved.</p>
              <p className="text-[10px] text-slate-600">misiksolutionsllc@gmail.com • Wellington, Florida</p>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Terms & Policies">
      <div className="p-6">
        <p className="text-xs text-slate-400 mb-4">Legal documents governing your use of FarmFresh Hub, operated by MISIKSOLUTIONS LLC.</p>
        <div className="space-y-2">
          {LEGAL_DOCUMENTS.map((doc) => (
            <button key={doc.id} onClick={() => setActiveDoc(doc.id)}
              className="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-white/[0.03] transition-all active:bg-white/[0.05] border border-white/5 hover:border-white/10">
              <span className="text-xl">{doc.icon}</span>
              <div className="flex-1 text-left">
                <div className="text-sm text-white font-medium">{doc.title}</div>
                <div className="text-xs text-slate-500">Updated {doc.lastUpdated}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-4">© 2026 MISIKSOLUTIONS LLC • misiksolutionsllc@gmail.com</p>
      </div>
    </Modal>
  );
}

// ============================================================
// PRIVACY RIGHTS MODAL (geo-aware)
// ============================================================
export function PrivacyRightsModal({ open, onClose, detectedState }: { open: boolean; onClose: () => void; detectedState?: string }) {
  const { showToast } = useAppStore();
  const privacy = getPrivacyInfo(detectedState);

  const [privacySettings, setPrivacySettings] = useState([
    { id: 'location', label: 'Location Access', desc: 'GPS for delivery and nearby farms', on: true, sensitive: true },
    { id: 'analytics', label: 'Usage Analytics', desc: 'Help improve the app', on: true, sensitive: false },
    { id: 'personalization', label: 'Personalized Recommendations', desc: 'Product suggestions from your history', on: true, sensitive: false },
    { id: 'shareActivity', label: 'Share Activity with Farms', desc: 'Purchase preferences visible to sellers', on: false, sensitive: true },
  ]);

  const toggle = (id: string) => setPrivacySettings((s) => s.map((x) => x.id === id ? { ...x, on: !x.on } : x));

  return (
    <Modal open={open} onClose={onClose} title="Privacy & Security">
      <div className="p-6 space-y-4">
        {/* Geo-detected compliance info */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-blue-400">YOUR PRIVACY RIGHTS — {privacy.state}</span>
          </div>
          <p className="text-xs text-slate-400 mb-2">Under <span className="text-white font-semibold">{privacy.law}</span>, you have:</p>
          <div className="space-y-1">
            {privacy.rights.map((r) => (
              <div key={r} className="flex items-center gap-2 text-xs">
                <Check className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span className="text-slate-300">{r}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Enforced by: {privacy.enforced}</p>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-xs text-emerald-400">Your data is encrypted with AES-256 and never sold to third parties</span>
        </div>

        {/* Privacy toggles */}
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Data Controls</div>
        {privacySettings.map((s) => (
          <button key={s.id} onClick={() => toggle(s.id)}
            className="w-full flex items-center justify-between py-3 border-b border-white/5 last:border-0 active:bg-white/[0.02] rounded-lg px-1">
            <div className="text-left">
              <div className="text-sm text-white flex items-center gap-1.5">
                {s.label}
                {s.sensitive && <span className="badge bg-amber-500/15 text-amber-400 text-[8px]">SENSITIVE</span>}
              </div>
              <div className="text-xs text-slate-500">{s.desc}</div>
            </div>
            <div className={cn('w-11 h-6 rounded-full flex items-center px-0.5 transition-all', s.on ? 'bg-emerald-500 justify-end' : 'bg-surface-900 justify-start')}>
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </div>
          </button>
        ))}

        {/* Data rights actions */}
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2">Exercise Your Rights</div>
        {[
          { label: 'Download My Data', desc: 'Get a copy of all your data', icon: Download, action: () => showToast('Data export started — check email within 48 hours') },
          { label: 'Do Not Sell My Information', desc: 'Opt out of any data sharing', icon: EyeOff, action: () => showToast('Preference saved — we do not sell your data') },
          { label: 'Delete My Data', desc: 'Request permanent deletion', icon: Trash2, danger: true, action: () => showToast('Deletion request submitted — processed within 45 days') },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={item.action}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.03] transition-all active:bg-white/[0.05]">
              <Icon className={cn('w-4 h-4', item.danger ? 'text-red-400' : 'text-slate-400')} />
              <div className="flex-1 text-left">
                <div className={cn('text-sm', item.danger ? 'text-red-400' : 'text-white')}>{item.label}</div>
                <div className="text-xs text-slate-500">{item.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          );
        })}

        <button onClick={() => { showToast('Privacy settings saved!'); onClose(); }} className="w-full btn-primary bg-emerald-600 mt-2">Save Settings</button>
      </div>
    </Modal>
  );
}

// ============================================================
// ACCOUNT SETTINGS MODAL (shared)
// ============================================================
export function AccountSettingsModal({ open, onClose, role }: { open: boolean; onClose: () => void; role: string }) {
  const { showToast } = useAppStore();
  const [passwordSection, setPasswordSection] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [twoFA, setTwoFA] = useState(false);

  const items = [
    ...(role !== 'owner' ? [{ label: 'Change Password', icon: Lock, action: () => setPasswordSection(!passwordSection) }] : []),
    { label: 'Two-Factor Authentication', icon: Shield, toggle: true, value: twoFA, action: () => { setTwoFA(!twoFA); showToast(twoFA ? '2FA disabled' : '2FA enabled via authenticator app'); } },
    { label: 'Connected Accounts', icon: Smartphone, desc: 'Google, Apple ID', action: () => showToast('Manage connected accounts') },
    { label: 'Language & Region', icon: Languages, desc: 'English (US), Eastern Time', action: () => showToast('Language settings') },
    { label: 'App Theme', icon: Moon, desc: 'Dark mode', action: () => showToast('Theme settings — currently dark mode') },
    ...(role === 'driver' ? [{ label: 'Vehicle Information', icon: Zap, desc: 'Update vehicle details', action: () => showToast('Vehicle info updated') }] : []),
    ...(role === 'farmer' ? [{ label: 'Farm Settings', icon: MapPin, desc: 'Business info, hours', action: () => showToast('Farm settings') }] : []),
    { label: 'Export Account Data', icon: Download, action: () => showToast('Data export initiated — check email') },
    { label: 'Delete Account', icon: Trash2, danger: true, action: () => showToast('Contact misiksolutionsllc@gmail.com to delete', 'error') },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Account Settings">
      <div className="p-6 space-y-1">
        {items.map((item: any) => {
          const Icon = item.icon;
          return (
            <div key={item.label}>
              <button onClick={item.action}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-xl hover:bg-white/[0.03] transition-all active:bg-white/[0.05]">
                <Icon className={cn('w-4 h-4', item.danger ? 'text-red-400' : 'text-slate-400')} />
                <div className="flex-1 text-left">
                  <div className={cn('text-sm', item.danger ? 'text-red-400' : 'text-white')}>{item.label}</div>
                  {item.desc && <div className="text-xs text-slate-500">{item.desc}</div>}
                </div>
                {item.toggle ? (
                  <div className={cn('w-11 h-6 rounded-full flex items-center px-0.5 transition-all', item.value ? 'bg-emerald-500 justify-end' : 'bg-surface-900 justify-start')}>
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </div>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                )}
              </button>
              {item.label === 'Change Password' && passwordSection && (
                <div className="px-3 py-3 space-y-3 animate-fade-in border-b border-white/5">
                  <input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="Current password"
                    className="w-full px-4 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/30" />
                  <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="New password (min 8 chars)"
                    className="w-full px-4 py-2.5 bg-surface-800 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/30" />
                  <button onClick={() => { showToast('Password updated!'); setPasswordSection(false); setOldPw(''); setNewPw(''); }}
                    disabled={!oldPw || newPw.length < 8}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-30">Update Password</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

// ============================================================
// NOTIFICATION SETTINGS MODAL (role-aware)
// ============================================================
export function NotificationSettingsModal({ open, onClose, role }: { open: boolean; onClose: () => void; role: string }) {
  const { showToast } = useAppStore();

  const baseNotifs = [
    { id: 'orders', label: 'Order Updates', desc: 'Status changes and confirmations', on: true, icon: '📦' },
    { id: 'email', label: 'Email Notifications', desc: 'Weekly summary and updates', on: true, icon: '📧' },
    { id: 'sms', label: 'SMS Notifications', desc: 'Urgent delivery updates via text', on: false, icon: '📱' },
  ];

  const roleNotifs: Record<string, any[]> = {
    customer: [
      { id: 'promos', label: 'Promotions & Deals', desc: 'Discounts, flash sales, seasonal offers', on: true, icon: '🎉' },
      { id: 'price', label: 'Price Drop Alerts', desc: 'When saved items go on sale', on: false, icon: '💰' },
      { id: 'newproducts', label: 'New Products', desc: 'Arrivals from favorite farms', on: true, icon: '🌱' },
      { id: 'reviews', label: 'Review Reminders', desc: 'Rate delivered orders', on: true, icon: '⭐' },
    ],
    driver: [
      { id: 'newjobs', label: 'New Delivery Jobs', desc: 'Available deliveries nearby', on: true, icon: '🚗' },
      { id: 'earnings', label: 'Earnings Updates', desc: 'Payout and tip notifications', on: true, icon: '💵' },
      { id: 'zone', label: 'Hot Zone Alerts', desc: 'High demand areas near you', on: true, icon: '🔥' },
      { id: 'maintenance', label: 'Platform Maintenance', desc: 'Scheduled downtime notices', on: true, icon: '🔧' },
    ],
    farmer: [
      { id: 'neworders', label: 'New Orders', desc: 'Instant alerts for incoming orders', on: true, icon: '🛒' },
      { id: 'lowstock', label: 'Low Stock Alerts', desc: 'When products run low', on: true, icon: '📊' },
      { id: 'reviews', label: 'Customer Reviews', desc: 'New ratings and feedback', on: true, icon: '⭐' },
      { id: 'payouts', label: 'Payout Notifications', desc: 'When funds are deposited', on: true, icon: '🏦' },
      { id: 'marketing', label: 'Marketing Tips', desc: 'Growth strategies and insights', on: false, icon: '📈' },
    ],
    owner: [
      { id: 'alerts', label: 'System Alerts', desc: 'Critical platform issues', on: true, icon: '🚨' },
      { id: 'revenue', label: 'Revenue Reports', desc: 'Daily/weekly summaries', on: true, icon: '📊' },
      { id: 'users', label: 'User Activity', desc: 'Sign-ups, bans, escalations', on: true, icon: '👥' },
      { id: 'compliance', label: 'Compliance Alerts', desc: 'Regulatory changes affecting platform', on: true, icon: '⚖️' },
    ],
  };

  const [settings, setSettings] = useState([...baseNotifs, ...(roleNotifs[role] || [])]);
  const toggle = (id: string) => setSettings((s) => s.map((x) => x.id === id ? { ...x, on: !x.on } : x));

  return (
    <Modal open={open} onClose={onClose} title="Notification Settings">
      <div className="p-6 space-y-1">
        {settings.map((n) => (
          <button key={n.id} onClick={() => toggle(n.id)}
            className="w-full flex items-center justify-between py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] rounded-lg px-2 active:bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <span className="text-lg">{n.icon}</span>
              <div className="text-left">
                <div className="text-sm text-white">{n.label}</div>
                <div className="text-xs text-slate-500">{n.desc}</div>
              </div>
            </div>
            <div className={cn('w-11 h-6 rounded-full flex items-center px-0.5 transition-all', n.on ? 'bg-emerald-500 justify-end' : 'bg-surface-900 justify-start')}>
              <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
            </div>
          </button>
        ))}
        <button onClick={() => { showToast('Notification settings saved!'); onClose(); }} className="w-full btn-primary bg-emerald-600 mt-4">Save Settings</button>
      </div>
    </Modal>
  );
}

// ============================================================
// HELP & SUPPORT MODAL (shared)
// ============================================================
export function HelpSupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { showToast } = useAppStore();
  const [expanded, setExpanded] = useState<number | null>(null);

  const faqs = [
    { q: 'How do I track my order?', a: 'Go to Orders tab and tap any order for real-time tracking with delivery status.' },
    { q: 'How do refunds work?', a: 'Cancelled orders before preparation get full refund. After preparation, 70%. Missing/damaged items get 100% refund within 24 hours with photo evidence.' },
    { q: 'What is the Loyalty Program?', a: 'Earn tier status by spending: Bronze ($0+), Silver ($300+), Gold ($1000+). Higher tiers unlock discounts and free delivery.' },
    { q: 'What does "natural food" mean?', a: 'All products on FarmFresh Hub must be free from GMOs, synthetic pesticides, artificial additives, growth hormones, and routine antibiotics.' },
    { q: 'How do I contact a farmer?', a: 'After placing an order, you can communicate through the order detail page.' },
    { q: 'Is my data secure?', a: 'Yes — we use AES-256 encryption, PCI DSS-compliant payment processing, and never sell your personal data.' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Help & Support">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: '💬', label: 'Live Chat', action: () => showToast('Connecting to support agent...') },
            { icon: '📧', label: 'Email Us', action: () => { window.open('mailto:misiksolutionsllc@gmail.com?subject=FarmFresh Hub Support', '_blank'); } },
            { icon: '📞', label: 'Call Us', action: () => { window.open('tel:+18003737400', '_self'); } },
            { icon: '📋', label: 'Report Issue', action: () => { window.open('mailto:misiksolutionsllc@gmail.com?subject=FarmFresh Hub Issue Report&body=Please describe the issue:', '_blank'); showToast('Opening email client...'); } },
          ].map((c) => (
            <button key={c.label} onClick={c.action}
              className="flex items-center gap-2 p-3 rounded-xl bg-surface-800 border border-white/5 hover:border-white/10 transition-all active:scale-[0.97]">
              <span className="text-xl">{c.icon}</span>
              <span className="text-sm text-white">{c.label}</span>
            </button>
          ))}
        </div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-2">FAQ</div>
        {faqs.map((f, i) => (
          <button key={i} onClick={() => setExpanded(expanded === i ? null : i)} className="w-full text-left border-b border-white/5 last:border-0">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-sm text-white pr-4">{f.q}</span>
              <ChevronRight className={cn('w-4 h-4 text-slate-500 transition-transform flex-shrink-0', expanded === i && 'rotate-90')} />
            </div>
            {expanded === i && <p className="text-xs text-slate-400 pb-3 animate-fade-in">{f.a}</p>}
          </button>
        ))}
        <div className="pt-2 text-center">
          <p className="text-[10px] text-slate-600">MISIKSOLUTIONS LLC • misiksolutionsllc@gmail.com</p>
          <p className="text-[10px] text-slate-600">Wellington, FL 33414 • 1-800-FRESH-00</p>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// SIGN OUT MODAL (shared)
// ============================================================
export function SignOutConfirmModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signOut, showToast } = useAppStore();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    signOut();
    showToast('Signed out', 'info');
    onClose();
    window.location.reload();
  };
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
          <button onClick={handleSignOut}
            className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-500 transition-all active:scale-[0.97]">Sign Out</button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================
// UNIFIED SETTINGS SECTION (embeddable in any role)
// ============================================================
export function SettingsSection({ role, detectedState }: { role: string; detectedState?: string }) {
  const { showToast } = useAppStore();
  const [showLegal, setShowLegal] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  const privacy = getPrivacyInfo(detectedState);

  return (
    <div className="space-y-4 pb-24 lg:pb-4">
      {/* Geo Privacy Banner */}
      <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold text-blue-400">YOUR REGION: {privacy.state}</span>
        </div>
        <p className="text-xs text-slate-400">Protected under <span className="text-white font-medium">{privacy.law}</span>. {privacy.rights.length} privacy rights enforced.</p>
        <button onClick={() => setShowPrivacy(true)} className="text-xs text-blue-400 hover:text-blue-300 mt-1 flex items-center gap-1">
          View your rights <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Settings Menu */}
      <div className="card bg-surface-800/50 border border-white/5 rounded-2xl overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {[
          { label: 'Account Settings', icon: Settings, color: 'text-slate-400', onClick: () => setShowAccount(true) },
          { label: 'Notifications', icon: Bell, color: 'text-amber-400', onClick: () => setShowNotifs(true) },
          { label: 'Privacy & Security', icon: Shield, color: 'text-blue-400', desc: privacy.law, onClick: () => setShowPrivacy(true) },
          { label: 'Help & Support', icon: HelpCircle, color: 'text-emerald-400', onClick: () => setShowHelp(true) },
          { label: 'Terms & Policies', icon: FileText, color: 'text-slate-400', desc: '6 documents', onClick: () => setShowLegal(true) },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} onClick={item.onClick}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-all active:bg-white/[0.04]">
              <Icon className={cn('w-4 h-4', item.color)} />
              <div className="flex-1 text-left">
                <span className="text-sm text-slate-300">{item.label}</span>
                {item.desc && <span className="text-xs text-slate-600 ml-2">{item.desc}</span>}
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          );
        })}
      </div>

      {/* Sign Out */}
      <button onClick={() => setShowSignOut(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-500/10 text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-all animate-fade-in-up active:scale-[0.98]" style={{ animationDelay: '200ms' }}>
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Sign Out</span>
      </button>

      <p className="text-center text-[10px] text-slate-700">FarmFresh Hub v1.0 • MISIKSOLUTIONS LLC • Wellington, FL</p>

      {/* Modals */}
      <LegalDocViewer open={showLegal} onClose={() => setShowLegal(false)} />
      <PrivacyRightsModal open={showPrivacy} onClose={() => setShowPrivacy(false)} detectedState={detectedState} />
      <AccountSettingsModal open={showAccount} onClose={() => setShowAccount(false)} role={role} />
      <NotificationSettingsModal open={showNotifs} onClose={() => setShowNotifs(false)} role={role} />
      <HelpSupportModal open={showHelp} onClose={() => setShowHelp(false)} />
      <SignOutConfirmModal open={showSignOut} onClose={() => setShowSignOut(false)} />
    </div>
  );
}
