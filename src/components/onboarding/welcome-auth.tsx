'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/app-store';
import { createClient } from '@/lib/supabase/client';
import { UserRole } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Mail, Lock, User, Eye, EyeOff, Check, AlertTriangle, Loader2 } from 'lucide-react';

const supabase = createClient();

// ============================================
// WELCOME ONBOARDING — Full-screen photo slides
// ============================================
const slides = [
  { image: '/onboarding/slide-1.png', title: 'Welcome!', description: 'Natural products from farmers in your region.' },
  { image: '/onboarding/slide-2.png', title: 'Freshness from the field to your table', description: 'Customers receive fresh products straight from fields and farms.' },
  { image: '/onboarding/slide-3.png', title: 'Support Local Farmers!', description: 'By using this application, customers support local farmers.' },
  { image: '/onboarding/slide-4.png', title: 'Healthy Eating — Care for Yourself and Your Loved Ones', description: 'By buying from farmers, you choose products crafted with care.' },
  { image: '/onboarding/slide-5.png', title: 'Contribute to the Development of a Healthy Food Ecosystem', description: 'Your choice supports responsible production.' },
];

export function WelcomeScreen() {
  const { completeOnboarding } = useAppStore();
  const [page, setPage] = useState(0);
  const slide = slides[page];
  const isLast = page === slides.length - 1;

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Photo — takes top ~60% */}
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: '55vh' }}>
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          key={page}
        />
      </div>

      {/* Content — bottom section */}
      <div className="bg-white px-8 py-8 flex flex-col items-center text-center" style={{ minHeight: '35vh' }}>
        <h1 className="text-[#5a7a3a] text-xl font-semibold leading-tight mb-3 max-w-sm animate-fade-in" key={`t-${page}`}>
          {slide.title}
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-8" key={`d-${page}`}>
          {slide.description}
        </p>

        {/* Button with dots */}
        <button
          onClick={() => isLast ? completeOnboarding() : setPage(page + 1)}
          className="flex items-center gap-3 px-8 py-3 rounded-xl bg-[#6b8c42] text-white font-medium text-sm hover:bg-[#5a7a3a] active:scale-[0.97] transition-all shadow-md"
        >
          {/* Left dots */}
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <div key={i} className={cn('w-2 h-2 rounded-full transition-all', i === page ? 'bg-white' : 'bg-white/40')} />
            ))}
          </div>
          <span>{isLast ? 'Finish' : 'Next'}</span>
          {/* Right dots (mirrored) */}
          <div className="flex gap-1">
            {slides.map((_, i) => (
              <div key={i} className={cn('w-2 h-2 rounded-full transition-all', i === page ? 'bg-white' : 'bg-white/40')} />
            ))}
          </div>
        </button>
      </div>
    </div>
  );
}

// ============================================
// AUTH SCREEN — Real Supabase Auth
// ============================================
const ADMIN_EMAIL = 'misiksolutionsllc@gmail.com';

const roleOptions: { id: UserRole; label: string; desc: string; emoji: string; color: string }[] = [
  { id: 'customer', label: 'Consumer', desc: 'Shop fresh local produce', emoji: '🛒', color: '#059669' },
  { id: 'driver', label: 'Driver', desc: 'Deliver orders and earn', emoji: '🚗', color: '#2563EB' },
  { id: 'farmer', label: 'Farmer', desc: 'Sell your natural products', emoji: '🌾', color: '#EA580C' },
];

export function AuthScreen() {
  const { setRole, setCurrentUserId, showToast, db } = useAppStore();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) handleAuthSuccess(session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) handleAuthSuccess(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = async (user: any) => {
    const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();
    const role = profile?.role || 'consumer';
    const mapRole: Record<string, UserRole> = { consumer: 'customer', driver: 'driver', farmer: 'farmer', admin: 'owner' };
    const appRole = mapRole[role] || 'customer';
    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

    useAppStore.setState({ authedEmail: user.email, authedProvider: user.app_metadata?.provider || 'email', authedRole: appRole, role: appRole });

    const dbUser = db.users.find((u) => u.role === appRole);
    if (dbUser) {
      setCurrentUserId(dbUser.id);
      useAppStore.getState().dispatch({ type: 'UPDATE_USER_PROFILE', userId: dbUser.id, updates: { name: displayName, email: user.email } });
    }
  };

  const isValid = mode === 'login'
    ? email.includes('@') && password.length >= 6
    : name.length >= 2 && email.includes('@') && password.length >= 8 && agreed;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        if (email.toLowerCase() === ADMIN_EMAIL) { setError('This email is reserved. Please use Sign In.'); setLoading(false); return; }
        const supabaseRole = selectedRole === 'customer' ? 'consumer' : selectedRole;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name, role: supabaseRole }, emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (signUpError) throw signUpError;
        if (data.session) showToast('Account created!');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        showToast('Signed in!');
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed';
      setError(msg);
      showToast(msg, 'error');
    }
    setLoading(false);
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `${provider} sign in failed`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface-950 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-[#6b8c42]/[0.06] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-[#6b8c42]/[0.03] blur-[100px]" />
      </div>
      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#6b8c42]/10 border border-[#6b8c42]/20 mb-4"><span className="text-3xl">🌿</span></div>
          <h1 className="font-display text-3xl font-bold text-white">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="text-slate-500 mt-2 text-sm">{mode === 'login' ? 'Sign in to your EdemFarm account' : 'Join the farm-to-table revolution'}</p>
        </div>

        {error && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" /><span className="text-sm text-red-400">{error}</span></div>}

        {/* Google OAuth */}
        <div className="space-y-3 mb-5">
          <button onClick={() => handleOAuth('google')} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-white font-medium hover:bg-white/[0.07] active:scale-[0.98] disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
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
                  className={cn('flex-1 py-3 rounded-xl text-center transition-all border', selectedRole === r.id ? 'bg-white/[0.04] border-[#6b8c42]/30 text-white' : 'border-white/[0.06] text-slate-500')}>
                  <span className="text-lg block mb-0.5">{r.emoji}</span>
                  <span className="text-[10px] font-medium">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-3">
          {mode === 'signup' && (
            <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-[#6b8c42]/30" />
            </div>
          )}
          <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="Email address" type="email" className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-[#6b8c42]/30" />
          </div>
          <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} placeholder={mode === 'signup' ? 'Password (min 8 chars)' : 'Password'} type={showPw ? 'text' : 'password'} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              className="w-full pl-11 pr-12 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-[#6b8c42]/30" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">{showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
          {mode === 'signup' && (
            <div className="flex items-start gap-3 px-1 pt-1">
              <button onClick={() => setAgreed(!agreed)} className={cn('mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all', agreed ? 'bg-[#6b8c42] border-[#6b8c42]' : 'border-white/10')}>
                {agreed && <Check className="w-3 h-3 text-white" />}
              </button>
              <p className="text-xs text-slate-500 leading-relaxed">I agree to the <span className="text-[#8fad5f]">Terms of Service</span> and <span className="text-[#8fad5f]">Privacy Policy</span></p>
            </div>
          )}
        </div>

        <button onClick={handleSubmit} disabled={!isValid || loading}
          className="w-full mt-5 py-4 rounded-2xl bg-[#6b8c42] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#5a7a3a] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {mode === 'login' ? 'Signing in...' : 'Creating account...'}</> : mode === 'login' ? 'Sign In' : `Create ${roleOptions.find((r) => r.id === selectedRole)?.label || ''} Account`}
        </button>

        {mode === 'login' && <p className="text-center mt-3 text-xs text-slate-600">Admin? Use misiksolutionsllc@gmail.com</p>}

        <p className="text-center mt-6 text-sm text-slate-500">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-[#8fad5f] font-semibold hover:text-[#a3c46f]">{mode === 'login' ? 'Sign Up' : 'Sign In'}</button>
        </p>
        <p className="text-center text-[10px] text-slate-700 mt-8">MISIKSOLUTIONS LLC • Wellington, Florida</p>
      </div>
    </div>
  );
}
