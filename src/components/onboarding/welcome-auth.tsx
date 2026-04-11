'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import { UserRole } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft, Mail, Lock, User, Eye, EyeOff, Check, ArrowRight, ShoppingCart, Truck, Wheat } from 'lucide-react';

const slides = [
  { emoji: '🥬', title: 'Welcome to FarmFresh Hub', subtitle: 'Farm-to-table, reimagined', description: 'Connect directly with local farmers who grow clean, natural food — no GMOs, no synthetic pesticides, no artificial anything.', bg: 'from-emerald-600/10 via-transparent to-transparent' },
  { emoji: '🚗', title: 'Fresh to Your Door', subtitle: 'Fast local delivery', description: 'Our community drivers deliver straight from the farm to your table. Track your order in real-time with GPS.', bg: 'from-blue-600/10 via-transparent to-transparent' },
  { emoji: '🌾', title: 'Support Local Heroes', subtitle: 'Empower American farmers', description: 'Every purchase supports independent Farmer American Heroes in your community. Know exactly where your food comes from.', bg: 'from-orange-600/10 via-transparent to-transparent' },
];

export function WelcomeScreen() {
  const { completeOnboarding } = useAppStore();
  const [page, setPage] = useState(0);
  const slide = slides[page];

  return (
    <div className="min-h-dvh bg-surface-950 relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 pointer-events-none"><div className={cn('absolute inset-0 bg-gradient-to-b transition-all duration-700', slide.bg)} /></div>
      <div className="relative z-10 flex justify-end p-6">
        <button onClick={completeOnboarding} className="text-sm text-slate-500 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5">Skip</button>
      </div>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-8">
        <div className="text-center max-w-sm mx-auto">
          <div className="mb-8" key={page}><span className="text-[100px] block animate-scale-in">{slide.emoji}</span></div>
          <div className="animate-fade-in" key={`t-${page}`}>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight mb-2">{slide.title}</h1>
            <p className="text-emerald-400 font-medium text-sm mb-4">{slide.subtitle}</p>
            <p className="text-slate-400 text-sm leading-relaxed">{slide.description}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-10">
          {slides.map((_, i) => (<button key={i} onClick={() => setPage(i)} className={cn('h-2 rounded-full transition-all duration-300', i === page ? 'w-8 bg-emerald-400' : 'w-2 bg-white/10')} />))}
        </div>
        <div className="w-full max-w-sm mt-8 space-y-3">
          {page < slides.length - 1 ? (
            <button onClick={() => setPage(page + 1)} className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500 active:scale-[0.98]">Next <ChevronRight className="w-5 h-5" /></button>
          ) : (
            <button onClick={completeOnboarding} className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500 active:scale-[0.98]">Get Started <ArrowRight className="w-5 h-5" /></button>
          )}
          {page > 0 && <button onClick={() => setPage(page - 1)} className="w-full py-3 text-slate-500 text-sm flex items-center justify-center gap-1"><ChevronLeft className="w-4 h-4" /> Back</button>}
        </div>
      </div>
      <p className="text-center text-[10px] text-slate-700 pb-6">MISIKSOLUTIONS LLC • Wellington, Florida</p>
    </div>
  );
}

// ============================================
// AUTH SCREEN — role-based registration
// ============================================
const roleOptions: { id: UserRole; label: string; desc: string; emoji: string; color: string }[] = [
  { id: 'customer', label: 'Consumer', desc: 'Shop fresh local produce', emoji: '🛒', color: '#059669' },
  { id: 'driver', label: 'Driver', desc: 'Deliver orders and earn', emoji: '🚗', color: '#2563EB' },
  { id: 'farmer', label: 'Farmer American Hero', desc: 'Sell your natural products', emoji: '🌾', color: '#EA580C' },
];

export function AuthScreen() {
  const { signUp, signIn, signInOAuth, showToast, setRole } = useAppStore();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [oauthRoleStep, setOauthRoleStep] = useState(false);
  const [oauthEmail, setOauthEmail] = useState('');

  const isValid = mode === 'login'
    ? email.includes('@') && password.length >= 6
    : name.length >= 2 && email.includes('@') && password.length >= 8 && agreed;

  const handleSubmit = () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    setTimeout(() => {
      let err: string | null;
      if (mode === 'signup') {
        err = signUp(email, password, name, selectedRole);
      } else {
        err = signIn(email, password);
      }
      if (err) { setError(err); showToast(err, 'error'); }
      else { showToast(mode === 'signup' ? 'Account created!' : 'Signed in!'); }
      setLoading(false);
    }, 1000);
  };

  const handleOAuth = (provider: 'google' | 'apple') => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const email = provider === 'google' ? 'user@gmail.com' : 'user@icloud.com';
      const result = signInOAuth(email, provider);
      if (result === 'NEEDS_ROLE') {
        setOauthEmail(email);
        setOauthRoleStep(true);
      } else if (result) {
        setError(result); showToast(result, 'error');
      } else {
        showToast(`Signed in with ${provider === 'google' ? 'Google' : 'Apple'}!`);
      }
      setLoading(false);
    }, 1200);
  };

  const completeOAuthSignup = () => {
    const err = signUp(oauthEmail, `oauth_${Date.now()}`, oauthEmail.split('@')[0], selectedRole, 'google');
    if (err) { setError(err); showToast(err, 'error'); }
    else { showToast('Account created!'); setOauthRoleStep(false); }
  };

  // OAuth role selection step
  if (oauthRoleStep) {
    return (
      <div className="min-h-dvh bg-surface-950 flex items-center justify-center">
        <div className="w-full max-w-md mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4"><span className="text-3xl">🥬</span></div>
            <h1 className="font-display text-2xl font-bold text-white">Choose Your Role</h1>
            <p className="text-slate-500 mt-2 text-sm">How will you use FarmFresh Hub?</p>
          </div>
          <div className="space-y-3 mb-6">
            {roleOptions.map((r) => (
              <button key={r.id} onClick={() => setSelectedRole(r.id)}
                className={cn('w-full flex items-center gap-4 p-4 rounded-2xl border transition-all', selectedRole === r.id ? 'border-emerald-500/30 bg-emerald-500/[0.04]' : 'border-white/[0.06] hover:border-white/10')}>
                <span className="text-3xl">{r.emoji}</span>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-white">{r.label}</div>
                  <div className="text-xs text-slate-500">{r.desc}</div>
                </div>
                {selectedRole === r.id && <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-4 h-4 text-white" /></div>}
              </button>
            ))}
          </div>
          <button onClick={completeOAuthSignup} className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 active:scale-[0.98]">Continue as {roleOptions.find((r) => r.id === selectedRole)?.label}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-surface-950 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-blue-600/[0.03] blur-[100px]" />
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4"><span className="text-3xl">🥬</span></div>
          <h1 className="font-display text-3xl font-bold text-white">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-slate-500 mt-2 text-sm">{mode === 'login' ? 'Sign in to your account' : 'Join the farm-to-table revolution'}</p>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 text-center">{error}</div>}

        {/* OAuth */}
        <div className="space-y-3 mb-5">
          <button onClick={() => handleOAuth('google')} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white font-medium hover:bg-white/[0.07] active:scale-[0.98] disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
          <button onClick={() => handleOAuth('apple')} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white font-medium hover:bg-white/[0.07] active:scale-[0.98] disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            Continue with Apple
          </button>
        </div>
        <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-px bg-white/[0.06]" /><span className="text-xs text-slate-600 uppercase">or</span><div className="flex-1 h-px bg-white/[0.06]" /></div>

        {/* Role selection for signup */}
        {mode === 'signup' && (
          <div className="mb-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">I am a...</div>
            <div className="flex gap-2">
              {roleOptions.map((r) => (
                <button key={r.id} onClick={() => setSelectedRole(r.id)}
                  className={cn('flex-1 py-3 rounded-xl text-center transition-all border', selectedRole === r.id ? 'bg-white/[0.04] border-emerald-500/30 text-white' : 'border-white/[0.06] text-slate-500')}>
                  <span className="text-lg block mb-0.5">{r.emoji}</span>
                  <span className="text-[10px] font-medium">{r.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-3">
          {mode === 'signup' && (
            <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/30" />
            </div>
          )}
          <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="Email address" type="email" className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/30" />
          </div>
          <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder={mode === 'signup' ? 'Password (min 8 chars)' : 'Password'} type={showPw ? 'text' : 'password'} className="w-full pl-11 pr-12 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/30" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
          {mode === 'signup' && (
            <div className="flex items-start gap-3 px-1 pt-1">
              <button onClick={() => setAgreed(!agreed)} className={cn('mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all', agreed ? 'bg-emerald-500 border-emerald-500' : 'border-white/10')}>
                {agreed && <Check className="w-3 h-3 text-white" />}
              </button>
              <p className="text-xs text-slate-500 leading-relaxed">I agree to the <span className="text-emerald-400">Terms of Service</span> and <span className="text-emerald-400">Privacy Policy</span></p>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={!isValid || loading}
          className="w-full mt-5 py-4 rounded-2xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed">
          {loading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</> : mode === 'login' ? 'Sign In' : `Create ${roleOptions.find((r) => r.id === selectedRole)?.label || ''} Account`}
        </button>

        {mode === 'login' && (
          <p className="text-center mt-3 text-xs text-slate-600">Admin? Use misiksolutionsllc@gmail.com</p>
        )}

        <p className="text-center mt-6 text-sm text-slate-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-emerald-400 font-semibold hover:text-emerald-300">{mode === 'login' ? 'Sign Up' : 'Sign In'}</button>
        </p>
        <p className="text-center text-[10px] text-slate-700 mt-8">MISIKSOLUTIONS LLC • Wellington, Florida</p>
      </div>
    </div>
  );
}
