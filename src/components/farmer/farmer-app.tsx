'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/app-store';
import { AppShell } from '@/components/ui/app-shell';
import { Modal } from '@/components/ui/modal';
import { cn, formatCurrency, getStatusColor, formatDate } from '@/lib/utils';
import { getStateRequirements, TRAINING_QUIZ, NATURAL_FOOD_POLICY, type StateRequirement } from '@/lib/us-state-requirements';
import {
  ClipboardList, Package, BarChart3, User, Star, Plus, Pencil, Trash2,
  DollarSign, ShoppingBag, CheckCircle2, MapPin, Phone, Mail, Camera,
  ChevronRight, ChevronLeft, Shield, BookOpen, FileCheck, Sparkles,
  Upload, Image, Leaf, Award, Flag, GraduationCap, ScrollText, Globe,
  Locate, Search, X, Check, AlertTriangle, Zap, Brain, ArrowRight,
  Megaphone, CreditCard, Landmark, Crown, Rocket, TrendingUp, Eye,
  Clock, Truck, MessageSquare, BadgePercent, Target, Gift, Settings,
} from 'lucide-react';
import { SettingsSection } from '@/components/ui/shared-settings';
import { SubscriptionModal, DriverPayoutModal } from '@/components/ui/payment-system';

// ============================================================
// ONBOARDING STEPS
// ============================================================
type OnboardingStep = 'auth' | 'profile' | 'documents' | 'training' | 'policy' | 'complete';

const STEPS: { id: OnboardingStep; label: string; icon: React.ReactNode }[] = [
  { id: 'auth', label: 'Sign Up', icon: <Mail className="w-4 h-4" /> },
  { id: 'profile', label: 'Farm Profile', icon: <MapPin className="w-4 h-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileCheck className="w-4 h-4" /> },
  { id: 'training', label: 'Training', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'policy', label: 'Agreement', icon: <ScrollText className="w-4 h-4" /> },
];

const navItems = [
  { id: 'orders', label: 'Orders', icon: <ClipboardList className="w-5 h-5" /> },
  { id: 'products', label: 'Products', icon: <Package className="w-5 h-5" /> },
  { id: 'marketing', label: 'Marketing', icon: <Megaphone className="w-5 h-5" /> },
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

// US State list for autocomplete
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY'
];

export function FarmerApp() {
  const { db, dispatch, showToast, currentUserId } = useAppStore();
  const [activeTab, setActiveTab] = useState('orders');
  const [onboarded, setOnboarded] = useState(false);

  // Check if farmer completed onboarding
  const farmer = db.users.find((u) => u.id === currentUserId);
  const isOnboarded = farmer?.verified || onboarded;

  if (!isOnboarded) {
    return <FarmerOnboarding onComplete={() => setOnboarded(true)} />;
  }

  return <FarmerDashboard activeTab={activeTab} setActiveTab={setActiveTab} />;
}

// ============================================================
// ONBOARDING FLOW
// ============================================================
function FarmerOnboarding({ onComplete }: { onComplete: () => void }) {
  const { db, dispatch, showToast, currentUserId } = useAppStore();
  const [step, setStep] = useState<OnboardingStep>('auth');
  const stepIdx = STEPS.findIndex((s) => s.id === step);

  // Auth state
  const [authMethod, setAuthMethod] = useState<'google' | 'email' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Profile state
  const [farmName, setFarmName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [locating, setLocating] = useState(false);

  // Documents state
  const [stateReqs, setStateReqs] = useState<StateRequirement | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Training state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizComplete, setQuizComplete] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Policy state
  const [policyAccepted, setPolicyAccepted] = useState(false);

  // Auto-detect state requirements when state changes
  useEffect(() => {
    if (state && state.length === 2) {
      setStateReqs(getStateRequirements(state));
    }
  }, [state]);

  // Simulate GPS location
  const detectLocation = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // In production, reverse geocode. For demo, set Wellington FL
          setStreet('12794 W Forest Hill Blvd');
          setCity('Wellington');
          setState('FL');
          setZip('33414');
          setLocating(false);
          showToast('Location detected!');
        },
        () => {
          // Fallback to default
          setCity('Wellington');
          setState('FL');
          setZip('33414');
          setLocating(false);
          showToast('Using approximate location', 'info');
        },
        { timeout: 5000 }
      );
    } else {
      setLocating(false);
      showToast('GPS not available', 'error');
    }
  };

  // Simulate address autocomplete
  const handleAddressInput = (value: string) => {
    setStreet(value);
    if (value.length > 3) {
      setAddressSuggestions([
        `${value}, Wellington, FL 33414`,
        `${value}, West Palm Beach, FL 33401`,
        `${value}, Royal Palm Beach, FL 33411`,
      ]);
    } else {
      setAddressSuggestions([]);
    }
  };

  const selectSuggestion = (s: string) => {
    const parts = s.split(', ');
    setStreet(parts[0] || '');
    setCity(parts[1] || '');
    const stateZip = (parts[2] || '').split(' ');
    setState(stateZip[0] || '');
    setZip(stateZip[1] || '');
    setAddressSuggestions([]);
  };

  // Quiz
  const answerQuestion = (questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const submitQuiz = () => {
    const correct = TRAINING_QUIZ.filter((q) => answers[q.id] === q.correctIndex).length;
    const passed = correct >= Math.ceil(TRAINING_QUIZ.length * 0.8); // 80% to pass
    setQuizPassed(passed);
    setQuizComplete(true);
    if (passed) showToast(`Passed! ${correct}/${TRAINING_QUIZ.length} correct`);
    else showToast(`Failed — ${correct}/${TRAINING_QUIZ.length}. Need 80%.`, 'error');
  };

  const retryQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setQuizComplete(false);
    setQuizPassed(false);
  };

  // Complete onboarding
  const completeOnboarding = () => {
    if (currentUserId) {
      dispatch({
        type: 'UPDATE_USER_PROFILE',
        userId: currentUserId,
        updates: {
          name: `${firstName} ${lastName}`,
          businessName: farmName,
          phone,
          verified: true,
          address: { street, city, state, zip },
        },
      });
      showToast('Welcome to FarmFresh Hub, Farmer American Hero! 🌾🇺🇸');
    }
    onComplete();
  };

  const canProceed = () => {
    switch (step) {
      case 'auth': return authMethod === 'google' || (email.includes('@') && password.length >= 6);
      case 'profile': return farmName && firstName && lastName && phone && street && city && state && zip;
      case 'documents': return stateReqs ? stateReqs.documents.filter((d) => d.required).every((d) => uploadedDocs[d.id]) : false;
      case 'training': return quizPassed;
      case 'policy': return policyAccepted;
      default: return false;
    }
  };

  const nextStep = () => {
    const idx = STEPS.findIndex((s) => s.id === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].id);
    else completeOnboarding();
  };

  return (
    <div className="min-h-dvh bg-surface-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-surface-950/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-white">Farmer American Hero</h1>
              <p className="text-xs text-slate-500">Join the natural food revolution 🇺🇸</p>
            </div>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex-1 flex items-center">
                <div className={cn('flex-1 h-1.5 rounded-full transition-all duration-500', i <= stepIdx ? 'bg-orange-500' : 'bg-white/5')} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <span key={s.id} className={cn('text-[10px] font-medium', i <= stepIdx ? 'text-orange-400' : 'text-slate-600')}>{s.label}</span>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-32">
        {/* ====== AUTH STEP ====== */}
        {step === 'auth' && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-8">
              <span className="text-5xl block mb-4 animate-float">🌾</span>
              <h2 className="text-2xl font-display font-bold text-white">Welcome, Future Hero</h2>
              <p className="text-slate-400 mt-2">Create your account to start selling natural food</p>
            </div>

            {/* Google Sign Up */}
            <button onClick={() => { setAuthMethod('google'); setEmail('farmer@gmail.com'); showToast('Google connected!'); }}
              className={cn('w-full flex items-center gap-3 p-4 rounded-2xl border transition-all', authMethod === 'google' ? 'bg-white/5 border-orange-500/30' : 'bg-surface-800/50 border-white/5 hover:border-white/10')}>
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-slate-800" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-white font-semibold">Continue with Google</div>
                <div className="text-xs text-slate-500">Quick and secure sign-up</div>
              </div>
              {authMethod === 'google' && <Check className="w-5 h-5 text-orange-400" />}
            </button>

            <div className="flex items-center gap-3"><div className="flex-1 h-px bg-white/5" /><span className="text-xs text-slate-600">or</span><div className="flex-1 h-px bg-white/5" /></div>

            {/* Email */}
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setAuthMethod('email'); }}
                    className="w-full pl-11 pr-4 py-3.5 bg-surface-800 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/30 transition-all"
                    placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-surface-800 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/30 transition-all"
                  placeholder="Min. 6 characters" />
              </div>
            </div>
          </div>
        )}

        {/* ====== PROFILE STEP ====== */}
        {step === 'profile' && (
          <div className="space-y-5 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Farm Profile</h2>
              <p className="text-sm text-slate-400 mt-1">Tell us about your farm</p>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Farm Name *</label>
              <input type="text" value={farmName} onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/30"
                placeholder="e.g., Green Acres Family Farm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">First Name *</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/30"
                  placeholder="John" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block">Last Name *</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/30"
                  placeholder="Smith" />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/30"
                  placeholder="(555) 123-4567" />
              </div>
            </div>

            {/* Address with GPS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-500">Farm Address (Pickup Location) *</label>
                <button onClick={detectLocation} disabled={locating}
                  className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors">
                  <Locate className={cn('w-3.5 h-3.5', locating && 'animate-spin')} />
                  {locating ? 'Detecting...' : 'Use GPS'}
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={street} onChange={(e) => handleAddressInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/30"
                  placeholder="Start typing address..." />
                {/* Autocomplete dropdown */}
                {addressSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-surface-800 border border-white/10 rounded-xl overflow-hidden z-10 shadow-xl">
                    {addressSuggestions.map((s) => (
                      <button key={s} onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-2 border-b border-white/5 last:border-0">
                        <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City"
                  className="px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/30" />
                <select value={state} onChange={(e) => setState(e.target.value)}
                  className="px-3 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-orange-500/30">
                  <option value="">State</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input type="text" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="ZIP"
                  className="px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/30" />
              </div>

              {state && stateReqs && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <Flag className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-xs text-orange-400">{stateReqs.state} requirements detected — {stateReqs.documents.length} documents needed</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====== DOCUMENTS STEP ====== */}
        {step === 'documents' && stateReqs && (
          <div className="space-y-5 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Required Documents</h2>
              <p className="text-sm text-slate-400 mt-1">Per {stateReqs.state} state regulations</p>
              {stateReqs.specialNotes && (
                <div className="mt-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-xs text-blue-400">
                  <Sparkles className="w-3 h-3 inline mr-1" /> {stateReqs.specialNotes}
                </div>
              )}
            </div>

            {['license', 'food_safety', 'tax', 'insurance'].map((cat) => {
              const catDocs = stateReqs.documents.filter((d) => d.category === cat);
              if (catDocs.length === 0) return null;
              const catLabels: Record<string, string> = { license: '📋 Licenses', food_safety: '🛡️ Food Safety', tax: '💰 Tax', insurance: '📄 Insurance' };
              return (
                <div key={cat}>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{catLabels[cat]}</div>
                  {catDocs.map((doc) => (
                    <div key={doc.id} className={cn('flex items-center gap-3 p-4 rounded-xl border mb-2 transition-all',
                      uploadedDocs[doc.id] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-surface-800/50 border-white/5')}>
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        uploadedDocs[doc.id] ? 'bg-emerald-500/20' : 'bg-surface-800')}>
                        {uploadedDocs[doc.id] ? <Check className="w-5 h-5 text-emerald-400" /> : <Upload className="w-5 h-5 text-slate-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white flex items-center gap-1.5">
                          {doc.name}
                          {doc.required && <span className="text-[9px] text-red-400 font-bold">REQUIRED</span>}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{doc.description}</p>
                      </div>
                      <button onClick={() => { 
                        if (uploadedDocs[doc.id]) return;
                        setUploadingDocId(doc.id); 
                        docInputRef.current?.click(); 
                      }}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0',
                          uploadedDocs[doc.id] ? 'text-emerald-400 bg-emerald-500/10' : 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20')}>
                        {uploadedDocs[doc.id] ? '✓ Done' : 'Upload'}
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}

            {/* Hidden file input for document uploads */}
            <input ref={docInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && uploadingDocId) {
                  const docName = stateReqs?.documents.find((d) => d.id === uploadingDocId)?.name || 'Document';
                  setUploadedDocs((prev) => ({ ...prev, [uploadingDocId]: true }));
                  showToast(`${docName} uploaded (${(file.size / 1024).toFixed(0)} KB)`);
                  if (currentUserId) {
                    dispatch({ type: 'UPLOAD_DOCUMENT', userId: currentUserId, document: { type: docName, date: new Date().toISOString() } });
                  }
                  setUploadingDocId(null);
                }
                e.target.value = '';
              }}
            />
          </div>
        )}

        {/* ====== TRAINING STEP ====== */}
        {step === 'training' && (
          <div className="space-y-5 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Training & Certification</h2>
              <p className="text-sm text-slate-400 mt-1">Complete the quiz to proceed (80% required)</p>
            </div>

            {!quizComplete ? (
              <>
                {/* Progress */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-slate-500">Question {currentQuestion + 1} of {TRAINING_QUIZ.length}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-orange-500 transition-all" style={{ width: `${((currentQuestion + 1) / TRAINING_QUIZ.length) * 100}%` }} />
                  </div>
                </div>

                {TRAINING_QUIZ.map((q, qi) => qi === currentQuestion && (
                  <div key={q.id} className="space-y-4">
                    <div className="badge bg-purple-500/10 text-purple-400 inline-flex">{q.topic}</div>
                    <h3 className="text-lg font-semibold text-white">{q.question}</h3>
                    <div className="space-y-2">
                      {q.options.map((opt, oi) => (
                        <button key={oi} onClick={() => answerQuestion(q.id, oi)}
                          className={cn('w-full text-left p-4 rounded-xl border transition-all',
                            answers[q.id] === oi ? 'bg-orange-500/10 border-orange-500/30 text-white' : 'bg-surface-800/50 border-white/5 text-slate-300 hover:border-white/10')}>
                          <span className="text-sm">{opt}</span>
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-3 pt-2">
                      {currentQuestion > 0 && (
                        <button onClick={() => setCurrentQuestion((p) => p - 1)} className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 text-sm">
                          <ChevronLeft className="w-4 h-4 inline mr-1" /> Back
                        </button>
                      )}
                      {currentQuestion < TRAINING_QUIZ.length - 1 ? (
                        <button onClick={() => setCurrentQuestion((p) => p + 1)} disabled={answers[q.id] === undefined}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-semibold disabled:opacity-30">
                          Next <ChevronRight className="w-4 h-4 inline ml-1" />
                        </button>
                      ) : (
                        <button onClick={submitQuiz} disabled={Object.keys(answers).length < TRAINING_QUIZ.length}
                          className="flex-1 px-4 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-semibold disabled:opacity-30">
                          Submit Quiz
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <span className="text-6xl block mb-4">{quizPassed ? '🎓' : '📚'}</span>
                <h3 className="text-xl font-bold text-white mb-2">{quizPassed ? 'Congratulations!' : 'Not Quite'}</h3>
                <p className="text-slate-400 text-sm mb-4">
                  {quizPassed
                    ? `You scored ${TRAINING_QUIZ.filter((q) => answers[q.id] === q.correctIndex).length}/${TRAINING_QUIZ.length}. You're certified!`
                    : `You scored ${TRAINING_QUIZ.filter((q) => answers[q.id] === q.correctIndex).length}/${TRAINING_QUIZ.length}. You need 80% to pass.`}
                </p>
                {!quizPassed && (
                  <button onClick={retryQuiz} className="btn-primary bg-orange-600">Retry Quiz</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ====== POLICY STEP ====== */}
        {step === 'policy' && (
          <div className="space-y-5 animate-fade-in-up">
            <div>
              <h2 className="text-xl font-display font-bold text-white">Natural Food Pledge</h2>
              <p className="text-sm text-slate-400 mt-1">Review and accept our quality standards</p>
            </div>

            <div className="bg-surface-800/50 border border-white/5 rounded-2xl p-5 max-h-[50vh] overflow-y-auto">
              <div className="prose prose-invert prose-sm">
                {NATURAL_FOOD_POLICY.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.replace('## ', '')}</h2>;
                  if (line.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-orange-400 mt-3 mb-1">{line.replace('### ', '')}</h3>;
                  if (line.startsWith('- **')) {
                    const match = line.match(/- \*\*(.*?)\*\*: (.*)/);
                    if (match) return <p key={i} className="text-sm text-slate-300 ml-4 mb-1"><strong className="text-white">{match[1]}</strong>: {match[2]}</p>;
                  }
                  if (line.startsWith('- ')) return <p key={i} className="text-sm text-slate-300 ml-4 mb-1">• {line.replace('- ', '')}</p>;
                  if (line.trim()) return <p key={i} className="text-sm text-slate-400 mb-2">{line}</p>;
                  return null;
                })}
              </div>
            </div>

            <button onClick={() => setPolicyAccepted(!policyAccepted)}
              className={cn('w-full flex items-center gap-3 p-4 rounded-2xl border transition-all',
                policyAccepted ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-surface-800/50 border-white/5')}>
              <div className={cn('w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all',
                policyAccepted ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600')}>
                {policyAccepted && <Check className="w-4 h-4 text-white" />}
              </div>
              <span className="text-sm text-white">I agree to the FarmFresh Hub Natural Food Pledge and commit to selling only clean, natural products</span>
            </button>
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-950/90 backdrop-blur-xl border-t border-white/5 p-4 safe-bottom z-20">
        <div className="max-w-2xl mx-auto flex gap-3">
          {stepIdx > 0 && (
            <button onClick={() => setStep(STEPS[stepIdx - 1].id)}
              className="px-5 py-3 rounded-2xl bg-white/5 text-slate-300 font-medium">
              <ChevronLeft className="w-4 h-4 inline mr-1" /> Back
            </button>
          )}
          <button onClick={nextStep} disabled={!canProceed()}
            className="flex-1 btn-primary bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
            {stepIdx === STEPS.length - 1 ? (
              <><Award className="w-4 h-4" /> Complete Registration</>
            ) : (
              <>Continue <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// FARMER DASHBOARD (post-onboarding)
// ============================================================
function FarmerDashboard({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (t: string) => void }) {
  const { db, dispatch, showToast, currentUserId } = useAppStore();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [showBankModal, setShowBankModal] = useState<'edit' | 'add' | null>(null);
  const [showCancelSub, setShowCancelSub] = useState(false);
  const [showUpdatePayment, setShowUpdatePayment] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [activatingFeature, setActivatingFeature] = useState<{ name: string; price: number; period: string } | null>(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [productPhoto, setProductPhoto] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [form, setForm] = useState({ name: '', price: '', unit: 'lb', category: 'Vegetables', stock: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiRejection, setAiRejection] = useState('');

  const farmer = db.users.find((u) => u.id === currentUserId);
  const myProducts = db.products.filter((p) => p.farmerId === currentUserId);
  const myOrders = db.orders.filter((o) => o.merchantId === currentUserId);
  const totalRevenue = myOrders.filter((o) => o.status === 'Delivered').reduce((sum, o) => sum + o.fees.subtotal, 0);

  // Get API key from localStorage (same as Mission Control AI Agent)
  const getApiKey = () => typeof window !== 'undefined' ? localStorage.getItem('ff_anthropic_key') || '' : '';

  // Real AI photo recognition via Claude Vision
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiRejection('');

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64Full = ev.target?.result as string;
      setProductPhoto(base64Full);
      setAiProcessing(true);

      try {
        const mediaType = file.type || 'image/jpeg';
        const response = await fetch('/api/analyze-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Full,
            mediaType,
            apiKey: getApiKey(),
          }),
        });

        const result = await response.json();

        if (result.error) {
          showToast(result.error, 'error');
          setAiProcessing(false);
          return;
        }

        if (!result.isFood) {
          // Not a food product — show rejection
          setAiRejection(result.rejection || 'This does not appear to be a food product. FarmFresh Hub only accepts natural food items.');
          showToast('Not a food product — please upload a photo of your farm product', 'error');
          setAiProcessing(false);
          return;
        }

        // AI recognized a food product — fill form
        setForm((prev) => ({
          ...prev,
          name: result.name || prev.name,
          description: result.description || prev.description,
          category: result.category || prev.category,
          unit: result.suggestedUnit || prev.unit,
          price: result.suggestedPrice?.toString() || prev.price,
        }));
        setAiDescription(result.description || '');
        showToast(`AI detected: ${result.name} (${result.confidence} confidence)`);
      } catch (error) {
        showToast('AI analysis failed — fill in details manually', 'info');
      }

      setAiProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const openEdit = (p: any) => {
    setEditingProductId(p.id);
    setForm({
      name: p.name,
      price: p.price.toString(),
      unit: p.unit,
      category: p.category,
      stock: p.stock.toString(),
      description: p.description || '',
    });
    setProductPhoto(p.image.startsWith('data:') ? p.image : null);
    setAiDescription('');
    setAiRejection('');
    setShowAddProduct(true);
  };

  const closeModal = () => {
    setShowAddProduct(false);
    setEditingProductId(null);
    setForm({ name: '', price: '', unit: 'lb', category: 'Vegetables', stock: '', description: '' });
    setProductPhoto(null);
    setAiDescription('');
    setAiRejection('');
  };

  const saveProduct = () => {
    if (!form.name || !form.price) return;

    if (editingProductId) {
      // UPDATE existing product
      dispatch({
        type: 'UPDATE_PRODUCT',
        payload: {
          id: editingProductId,
          name: form.name,
          price: parseFloat(form.price),
          unit: form.unit,
          category: form.category,
          stock: parseInt(form.stock) || 0,
          description: form.description,
          ...(productPhoto ? { image: productPhoto } : {}),
        },
      });
      showToast('Product updated! ✅');
    } else {
      // ADD new product
      dispatch({
        type: 'ADD_PRODUCT',
        payload: {
          farmerId: currentUserId!,
          name: form.name,
          price: parseFloat(form.price),
          unit: form.unit,
          category: form.category,
          stock: parseInt(form.stock) || 50,
          description: form.description,
          image: productPhoto || '🥬',
        },
      });
      showToast('Product published to marketplace! 🎉');
    }
    closeModal();
  };

  if (!farmer) return null;

  return (
    <AppShell role="farmer" navItems={navItems} activeTab={activeTab} onTabChange={setActiveTab} title="Farmer American Hero">
      {/* ===== ORDERS ===== */}
      {activeTab === 'orders' && (
        <div className="space-y-4 pb-24 lg:pb-4">
          <div className="flex items-center justify-between animate-fade-in">
            <h2 className="text-xl font-display font-bold text-white">Orders</h2>
            <span className="badge bg-amber-500/20 text-amber-400">{myOrders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length} active</span>
          </div>
          {myOrders.length === 0 ? (
            <div className="text-center py-20 animate-fade-in"><span className="text-6xl block mb-4 animate-float">📋</span><p className="text-slate-400">No orders yet — add products to get started!</p></div>
          ) : (
            myOrders.map((order, i) => {
              const customer = db.users.find((u) => u.id === order.customerId);
              return (
                <div key={order.id} onClick={() => setSelectedOrder(order.id)}
                  className={cn('bg-surface-800/50 border rounded-2xl p-5 transition-all animate-fade-in-up cursor-pointer card-hover', order.status === 'Pending' ? 'border-amber-500/20' : 'border-white/5')}
                  style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-xs text-slate-500 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" />{formatDate(order.date)}</div>
                    </div>
                    <span className={cn('badge', getStatusColor(order.status))}>{order.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-3 h-3 text-slate-500" />
                    <span className="text-xs text-slate-400">{customer?.name || 'Customer'}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                    {order.items.slice(0, 3).map((item) => (
                      <span key={item.id} className="text-xs bg-surface-900 px-2 py-1 rounded-lg text-slate-300">{item.image?.startsWith?.('data:') ? '📦' : item.image} {item.name} ×{item.qty}</span>
                    ))}
                    {order.items.length > 3 && <span className="text-xs text-slate-500">+{order.items.length - 3} more</span>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="font-bold text-white">{formatCurrency(order.fees.subtotal)}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ===== ORDER DETAIL MODAL ===== */}
      {(() => {
        const orderDetail = myOrders.find((o) => o.id === selectedOrder);
        const orderCustomer = orderDetail ? db.users.find((u) => u.id === orderDetail.customerId) : null;
        const statusSteps = ['Pending', 'Processing', 'Ready', 'Picked Up', 'Delivered'];
        const stepIdx = orderDetail ? statusSteps.indexOf(orderDetail.status) : -1;
        return (
          <Modal open={!!orderDetail} onClose={() => setSelectedOrder(null)} title={`Order #${orderDetail?.id.slice(-6).toUpperCase() || ''}`}>
            {orderDetail && (
              <div className="p-6 space-y-5">
                {/* Status + Progress */}
                <div className="flex items-center justify-between">
                  <span className={cn('badge text-sm', getStatusColor(orderDetail.status))}>{orderDetail.status}</span>
                  <span className="text-xs text-slate-500">{formatDate(orderDetail.date)}</span>
                </div>
                {orderDetail.status !== 'Cancelled' && (
                  <div className="flex items-center gap-1">
                    {statusSteps.map((_, si) => (
                      <div key={si} className={cn('flex-1 h-2 rounded-full transition-all', si <= stepIdx ? 'bg-orange-500' : 'bg-white/5')} />
                    ))}
                  </div>
                )}

                {/* Customer */}
                <div className="bg-surface-800 rounded-xl p-4">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Customer</div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><User className="w-5 h-5 text-emerald-400" /></div>
                    <div>
                      <div className="text-sm font-medium text-white">{orderCustomer?.name || 'Customer'}</div>
                      <div className="text-xs text-slate-500">{orderCustomer?.email || ''}</div>
                      {orderCustomer?.phone && <div className="text-xs text-slate-500">{orderCustomer.phone}</div>}
                    </div>
                  </div>
                  {orderCustomer?.address && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
                      <MapPin className="w-3 h-3" />{orderCustomer.address.street}, {orderCustomer.address.city}, {orderCustomer.address.state}
                    </div>
                  )}
                  {orderDetail.instructions && (
                    <div className="mt-2 px-3 py-2 bg-surface-900 rounded-lg text-xs text-slate-400">
                      <MessageSquare className="w-3 h-3 inline mr-1 text-slate-500" />"{orderDetail.instructions}"
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Items ({orderDetail.items.length})</div>
                  {orderDetail.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
                      <div className="w-10 h-10 bg-surface-800 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.image?.startsWith?.('data:') ? <img src={item.image} className="w-full h-full object-cover" /> : <span className="text-lg">{item.image}</span>}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white">{item.name}</div>
                        <div className="text-xs text-slate-500">Qty: {item.qty} × {formatCurrency(item.price)}</div>
                      </div>
                      <span className="text-sm font-bold text-white">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                {/* Fees breakdown */}
                <div className="bg-surface-800 rounded-xl p-4 space-y-2">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Financial Details</div>
                  {[
                    ['Subtotal', orderDetail.fees.subtotal],
                    ['Delivery fee', orderDetail.fees.delivery],
                    ['Platform fee', orderDetail.fees.platform],
                    ['Tax', orderDetail.fees.tax],
                    ['Tip', orderDetail.fees.tip],
                    ...(orderDetail.fees.discount > 0 ? [['Discount', -orderDetail.fees.discount]] : []),
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex justify-between text-xs">
                      <span className="text-slate-400">{label}</span>
                      <span className={cn('font-mono', (val as number) < 0 ? 'text-red-400' : 'text-white')}>{formatCurrency(val as number)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-white/5 text-sm">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-orange-400 font-bold">{formatCurrency(orderDetail.total)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400">Your earnings</span>
                    <span className="text-emerald-400 font-bold font-mono">{formatCurrency(orderDetail.fees.subtotal)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {orderDetail.status === 'Pending' && (
                    <button onClick={() => { dispatch({ type: 'UPDATE_ORDER', payload: { id: orderDetail.id, status: 'Processing' } }); showToast('Accepted'); setSelectedOrder(null); }}
                      className="flex-1 btn-primary bg-orange-600 text-sm">Accept Order</button>
                  )}
                  {orderDetail.status === 'Processing' && (
                    <button onClick={() => { dispatch({ type: 'MARK_READY', id: orderDetail.id }); showToast('Ready for pickup!'); setSelectedOrder(null); }}
                      className="flex-1 btn-primary bg-emerald-600 text-sm flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4" /> Mark Ready</button>
                  )}
                  {(orderDetail.status === 'Pending' || orderDetail.status === 'Processing') && (
                    <button onClick={() => { dispatch({ type: 'UPDATE_ORDER', payload: { id: orderDetail.id, status: 'Cancelled' } }); showToast('Order rejected', 'error'); setSelectedOrder(null); }}
                      className="px-4 py-3 rounded-2xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/5">Reject</button>
                  )}
                </div>
              </div>
            )}
          </Modal>
        );
      })()}

      {/* ===== PRODUCTS ===== */}
      {activeTab === 'products' && (
        <div className="space-y-4 pb-24 lg:pb-4">
          <div className="flex items-center justify-between animate-fade-in">
            <h2 className="text-xl font-display font-bold text-white">My Products ({myProducts.length})</h2>
            <button onClick={() => { closeModal(); setShowAddProduct(true); }} className="btn-primary bg-orange-600 text-sm py-2.5 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
          {myProducts.length === 0 ? (
            <div className="text-center py-20 animate-fade-in"><span className="text-6xl block mb-4 animate-float">📦</span><p className="text-slate-400">No products yet — add your first item!</p></div>
          ) : (
            myProducts.map((p, i) => (
              <div key={p.id} className="bg-surface-800/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4 card-hover animate-fade-in-up cursor-pointer group" style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setSelectedProduct(p.id)}>
                {p.image.startsWith('data:') ? (
                  <img src={p.image} alt={p.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-surface-800 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">{p.image}</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-sm truncate">{p.name}</h3>
                  <span className="text-sm font-bold text-orange-400">{formatCurrency(p.price)}/{p.unit}</span>
                  <span className="text-xs text-slate-500 ml-2">• {p.stock} in stock • {p.sales} sold</span>
                  {p.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{p.description}</p>}
                </div>
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-orange-400 rounded-lg hover:bg-orange-500/5 transition-all" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { dispatch({ type: 'DELETE_PRODUCT', id: p.id }); showToast('Removed'); }} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {/* Mobile: always show buttons */}
                <div className="flex flex-col gap-1 lg:hidden" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-orange-400 rounded-lg hover:bg-orange-500/5">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => { dispatch({ type: 'DELETE_PRODUCT', id: p.id }); showToast('Removed'); }} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== PRODUCT DETAIL MODAL ===== */}
      {(() => {
        const detailProduct = myProducts.find((p) => p.id === selectedProduct);
        return (
          <Modal open={!!detailProduct} onClose={() => setSelectedProduct(null)} title={detailProduct?.name || 'Product'}>
            {detailProduct && (
              <div>
                {/* Product Image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center overflow-hidden">
                  {detailProduct.image.startsWith('data:') ? (
                    <img src={detailProduct.image} alt={detailProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[80px]">{detailProduct.image}</span>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-display font-bold text-white">{detailProduct.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-orange-400">{formatCurrency(detailProduct.price)}</span>
                        <span className="text-slate-500">/{detailProduct.unit}</span>
                      </div>
                    </div>
                    <span className={cn('badge', detailProduct.stock > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
                      {detailProduct.stock > 0 ? `${detailProduct.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {detailProduct.description && (
                    <p className="text-sm text-slate-400 leading-relaxed">{detailProduct.description}</p>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-surface-800 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-white">{detailProduct.sales}</div>
                      <div className="text-[10px] text-slate-500">Sold</div>
                    </div>
                    <div className="bg-surface-800 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-white flex items-center justify-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{detailProduct.rating || '–'}</div>
                      <div className="text-[10px] text-slate-500">Rating</div>
                    </div>
                    <div className="bg-surface-800 rounded-xl p-3 text-center">
                      <div className="text-lg font-bold text-white">{formatCurrency(detailProduct.price * detailProduct.sales)}</div>
                      <div className="text-[10px] text-slate-500">Revenue</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-surface-800 text-slate-300">{detailProduct.category}</span>
                    {detailProduct.organic && <span className="badge bg-emerald-500/20 text-emerald-400">🌿 Organic</span>}
                    {detailProduct.vegan && <span className="badge bg-green-500/20 text-green-400">🌱 Vegan</span>}
                    {detailProduct.glutenFree && <span className="badge bg-amber-500/20 text-amber-400">GF</span>}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => { setSelectedProduct(null); openEdit(detailProduct); }}
                      className="flex-1 btn-primary bg-orange-600 flex items-center justify-center gap-2 text-sm">
                      <Pencil className="w-4 h-4" /> Edit Product
                    </button>
                    <button onClick={() => { dispatch({ type: 'DELETE_PRODUCT', id: detailProduct.id }); setSelectedProduct(null); showToast('Product removed'); }}
                      className="px-4 py-3 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/5 transition-all text-sm font-semibold">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        );
      })()}

      {/* ===== MARKETING ===== */}
      {activeTab === 'marketing' && (
        <div className="space-y-6 pb-24 lg:pb-4">
          <div className="animate-fade-in">
            <h2 className="text-xl font-display font-bold text-white">Marketing Tools</h2>
            <p className="text-sm text-slate-400 mt-1">Boost your sales with premium features</p>
          </div>

          {/* Subscription Tiers */}
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📋 Subscription Plans</div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              {(() => {
                const currentTier = farmer.subscription?.tier || 'free';
                const tiers = [
                  { name: 'Starter', tier: 'free', price: 0, period: 'Free forever', color: '#64748B', features: ['Up to 10 products', 'Basic storefront', 'Standard listing', 'Email support', 'Basic analytics'] },
                  { name: 'Growth', tier: 'premium', price: 300, period: '/month', color: '#EA580C', popular: true, features: ['Unlimited products', 'Featured storefront badge', 'Priority listing in search', 'AI product descriptions', 'Advanced analytics & reports', 'Promotional tools', 'Priority support', 'Custom farm page URL'] },
                  { name: 'Enterprise', tier: 'enterprise', price: 799, period: '/month', color: '#F59E0B', features: ['Everything in Growth', 'Dedicated account manager', 'White-label delivery', 'API access', 'Multi-location support', 'Custom integrations', 'Bulk upload tools', 'Revenue sharing optimization'] },
                ];
                return tiers.map((tier, i) => {
                  const isCurrent = tier.tier === currentTier;
                  return (
                <div key={tier.name} className={cn('card p-5 relative overflow-hidden animate-fade-in-up', tier.popular && !isCurrent && 'border-orange-500/30', isCurrent && 'border-emerald-500/30')} style={{ animationDelay: `${(i + 1) * 80}ms` }}>
                  {tier.popular && !isCurrent && (
                    <div className="absolute top-0 right-0 bg-orange-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl">RECOMMENDED</div>
                  )}
                  {isCurrent && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl">ACTIVE</div>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    {tier.price === 0 ? <Leaf className="w-5 h-5" style={{ color: tier.color }} /> : tier.popular ? <Rocket className="w-5 h-5" style={{ color: tier.color }} /> : <Crown className="w-5 h-5" style={{ color: tier.color }} />}
                    <span className="font-bold text-white">{tier.name}</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-white">{tier.price === 0 ? 'Free' : `$${tier.price}`}</span>
                    <span className="text-sm text-slate-500 ml-1">{tier.period}</span>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: tier.color }} />
                        <span className="text-slate-300">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => !isCurrent && setShowSubscriptionModal(true)} className={cn('w-full btn-primary text-sm', isCurrent ? 'bg-emerald-500/10 text-emerald-400 cursor-default' : tier.popular ? 'bg-orange-600' : 'bg-white/10 text-white')}>
                    {isCurrent ? '✓ Current Plan' : tier.popular ? 'Upgrade to Growth' : 'Contact Sales'}
                  </button>
                </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Marketing Features to Purchase */}
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">🚀 Boost Features (À la carte)</div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {[
                { name: 'Featured Product Badge', price: 49, period: '/month per product', icon: '⭐', desc: 'Gold "Featured" badge on product cards. 3x more visibility in search results.', color: '#F59E0B' },
                { name: 'Homepage Banner Slot', price: 199, period: '/week', icon: '🖼️', desc: 'Your farm featured on the Consumer app homepage banner. Avg. 5,000 impressions/day.', color: '#8B5CF6' },
                { name: 'Push Notification Campaign', price: 79, period: '/blast', icon: '🔔', desc: 'Send a push notification to all customers in your delivery area about your products.', color: '#3B82F6' },
                { name: 'Social Media Promotion', price: 149, period: '/campaign', icon: '📱', desc: 'Professional social media post created by AI + promoted across our channels.', color: '#EC4899' },
                { name: 'Seasonal Promo Pack', price: 99, period: '/month', icon: '🎁', desc: 'Auto-generated promo codes, seasonal banners, and limited-time offers for your store.', color: '#10B981' },
                { name: 'Analytics Pro Report', price: 29, period: '/month', icon: '📊', desc: 'Deep analytics: customer demographics, purchase patterns, optimal pricing, demand forecast.', color: '#06B6D4' },
                { name: 'Priority Delivery Match', price: 59, period: '/month', icon: '🚚', desc: 'Your orders get matched to drivers first. 30% faster delivery times on average.', color: '#EA580C' },
                { name: 'AI Product Photography', price: 19, period: '/product', icon: '📸', desc: 'AI-enhanced product photos with professional backgrounds and lighting adjustment.', color: '#F43F5E' },
              ].map((feat, i) => (
                <div key={feat.name} className="card p-4 flex gap-4 hover:border-white/10 transition-all animate-fade-in-up" style={{ animationDelay: `${(i + 5) * 50}ms` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl" style={{ backgroundColor: feat.color + '12' }}>
                    {feat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{feat.name}</div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{feat.desc}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-white">${feat.price}<span className="text-xs text-slate-500 font-normal ml-0.5">{feat.period}</span></span>
                      <button onClick={() => setActivatingFeature({ name: feat.name, price: feat.price, period: feat.period })} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110" style={{ backgroundColor: feat.color + '20', color: feat.color }}>
                        Activate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== ANALYTICS ===== */}
      {activeTab === 'analytics' && <FarmerAnalytics farmer={farmer} myProducts={myProducts} myOrders={myOrders} db={db} totalRevenue={totalRevenue} />}

      {/* ===== PROFILE ===== */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-5 pb-24 lg:pb-4">
          {/* Farm Info Card */}
          <div className="text-center bg-gradient-to-br from-orange-600/10 to-surface-800/30 border border-white/5 rounded-3xl p-6 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌾</span>
            </div>
            <h2 className="text-xl font-bold text-white">{farmer.businessName || farmer.name}</h2>
            <p className="text-sm text-slate-400">{farmer.name}</p>
            <p className="text-sm text-slate-500 mt-1">{farmer.email}</p>
            {farmer.phone && <p className="text-xs text-slate-500 mt-1"><Phone className="w-3 h-3 inline mr-1" />{farmer.phone}</p>}
            {farmer.address && <p className="text-xs text-slate-500 mt-1"><MapPin className="w-3 h-3 inline mr-1" />{farmer.address.street}, {farmer.address.city}, {farmer.address.state} {farmer.address.zip}</p>}
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">Verified Farmer American Hero</span>
            </div>
          </div>

          {/* Earnings & Payout */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">💰 Earnings & Payouts</div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-surface-800 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">{formatCurrency(totalRevenue)}</div>
                <div className="text-[10px] text-slate-500">Total Revenue</div>
              </div>
              <div className="bg-surface-800 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-white">{formatCurrency(totalRevenue * 0.85)}</div>
                <div className="text-[10px] text-slate-500">Available</div>
              </div>
              <div className="bg-surface-800 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-amber-400">{formatCurrency(totalRevenue * 0.15)}</div>
                <div className="text-[10px] text-slate-500">Processing</div>
              </div>
            </div>
            <button onClick={() => setShowPayoutModal(true)}
              className="w-full btn-primary bg-emerald-600 text-sm flex items-center justify-center gap-2">
              <DollarSign className="w-4 h-4" /> Withdraw to Bank
            </button>
          </div>

          {/* Bank Account */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">🏦 Bank Account</div>
              <button onClick={() => setShowBankModal('edit')} className="text-xs text-orange-400 hover:text-orange-300">Edit</button>
            </div>
            <div className="bg-surface-800 rounded-xl p-4">
              {farmer.bankLast4 ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center"><Landmark className="w-6 h-6 text-blue-400" /></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Bank Account</div>
                    <div className="text-xs text-slate-500">Checking •••• {farmer.bankLast4}</div>
                    <div className="text-xs text-slate-500">{farmer.name}</div>
                  </div>
                  <span className="badge bg-emerald-500/20 text-emerald-400">Verified</span>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Landmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No bank account connected</p>
                  <p className="text-xs text-slate-500 mt-1">Add a bank account to receive payouts</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setShowBankModal('add')} className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition-all text-center">
                <Plus className="w-3 h-3 inline mr-1" /> Add Account
              </button>
              <button onClick={() => setShowUpdatePayment(true)} className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition-all text-center">
                <CreditCard className="w-3 h-3 inline mr-1" /> Cards
              </button>
            </div>
          </div>

          {/* Active Subscription */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">⭐ Subscription</div>
              <button onClick={() => setShowSubscriptionModal(true)} className="text-xs text-orange-400 hover:text-orange-300">Upgrade</button>
            </div>
            <div className="bg-gradient-to-br from-orange-500/5 to-surface-800 border border-orange-500/10 rounded-xl p-4">
              {farmer.subscription ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center"><Rocket className="w-5 h-5 text-orange-400" /></div>
                    <div>
                      <div className="text-sm font-bold text-white">{farmer.subscription.tier === 'premium' ? 'Growth' : farmer.subscription.tier === 'enterprise' ? 'Enterprise' : 'Starter'} Plan</div>
                      <div className="text-xs text-slate-500">${farmer.subscription.tier === 'premium' ? '300' : farmer.subscription.tier === 'enterprise' ? '799' : '0'}/month</div>
                    </div>
                    <span className={cn('badge ml-auto', farmer.subscription.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>{farmer.subscription.status === 'active' ? 'Active' : 'Inactive'}</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <Leaf className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <div className="text-sm font-bold text-white">Free Plan</div>
                  <p className="text-xs text-slate-500 mt-1">Upgrade to unlock premium features</p>
                  <button onClick={() => setShowSubscriptionModal(true)} className="btn-primary bg-orange-600 text-sm mt-3">Upgrade Now</button>
                </div>
              )}
              {farmer.subscription && farmer.subscription.status === 'active' && (
                <>
                  <div className="space-y-1.5">
                    {(farmer.subscription.tier === 'premium'
                      ? ['Unlimited products', 'Featured storefront', 'Priority listing', 'AI descriptions', 'Advanced analytics']
                      : farmer.subscription.tier === 'enterprise'
                      ? ['Unlimited products', 'White-label delivery', 'API access', 'Multi-location', 'Dedicated manager']
                      : ['Up to 10 products', 'Basic storefront', 'Email support']
                    ).map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                        <Check className="w-3 h-3 text-orange-400" />{f}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setShowUpdatePayment(true)} className="flex-1 px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300 hover:bg-white/10 transition-all">
                      <CreditCard className="w-3 h-3 inline mr-1" /> Update Payment
                    </button>
                    <button onClick={() => setShowCancelSub(true)} className="px-3 py-2 rounded-lg text-xs text-red-400/50 hover:text-red-400 hover:bg-red-500/5 transition-all">
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payout History */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📄 Recent Payouts</div>
            {db.transactions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No payouts yet</p>
            ) : (
              db.transactions.filter((t) => t.type === 'Payout').slice(0, 5).map((p, i) => (
                <div key={p.id || i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm text-white">{formatDate(p.date)}</div>
                    <div className="text-xs text-slate-500">{p.method}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400">{formatCurrency(Math.abs(p.amount))}</div>
                    <span className="badge bg-emerald-500/15 text-emerald-400">{p.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Documents & Compliance */}
          <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📋 Documents & Compliance</div>
            {(farmer.documents || []).map((doc, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-300">{doc.type}</span>
                </div>
                <span className={cn('badge', doc.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : doc.status === 'pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400')}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && <div className="pb-24"><h2 className="text-xl font-display font-bold text-white mb-4">Notifications</h2><p className="text-slate-400 text-center py-12">No notifications</p></div>}

      {/* ===== SETTINGS ===== */}
      {activeTab === 'settings' && <SettingsSection role="farmer" detectedState={farmer.address?.state || 'FL'} />}

      {/* ===== MARKETING ACTIVATION CONFIRM ===== */}
      <Modal open={!!activatingFeature} onClose={() => setActivatingFeature(null)} variant="dialog" maxWidth="max-w-sm">
        {activatingFeature && (
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Activate Feature?</h3>
            <p className="text-sm text-slate-400 mb-4">{activatingFeature.name}</p>
            <div className="bg-surface-800 rounded-xl p-4 mb-4">
              <span className="text-2xl font-bold text-white">${activatingFeature.price}</span>
              <span className="text-sm text-slate-500 ml-1">{activatingFeature.period}</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Charged to your Visa •••• 4242. You can cancel anytime.</p>
            <div className="flex gap-3">
              <button onClick={() => setActivatingFeature(null)} className="flex-1 px-4 py-3 rounded-2xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-all active:scale-[0.97]">Cancel</button>
              <button onClick={() => { showToast(`${activatingFeature.name} activated! 🚀`); setActivatingFeature(null); }}
                className="flex-1 px-4 py-3 rounded-2xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-all active:scale-[0.97]">Activate</button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===== BANK ACCOUNT MODAL ===== */}
      <Modal open={!!showBankModal} onClose={() => setShowBankModal(null)} title={showBankModal === 'edit' ? 'Edit Bank Account' : 'Add Bank Account'}>
        <div className="p-6 space-y-4">
          {showBankModal === 'edit' && (
            <div className="bg-surface-800 rounded-xl p-4 flex items-center gap-3 mb-2">
              <Landmark className="w-5 h-5 text-blue-400" />
              <div className="flex-1"><div className="text-sm text-white">Chase Bank •••• 4821</div><div className="text-xs text-slate-500">Current default</div></div>
              <span className="badge bg-emerald-500/15 text-emerald-400">Verified</span>
            </div>
          )}
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Account Holder Name</label>
            <input defaultValue={farmer.name} className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-orange-500/30" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Routing Number</label>
            <input placeholder="021000021" className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500/30" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Account Number</label>
            <input placeholder="•••• •••• 4821" type="password" className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500/30" />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Account Type</label>
            <div className="flex gap-2">
              <button className="flex-1 py-2.5 rounded-xl bg-orange-500/15 text-orange-400 border border-orange-500/20 text-sm font-medium">Checking</button>
              <button className="flex-1 py-2.5 rounded-xl bg-surface-800 text-slate-500 border border-white/5 text-sm">Savings</button>
            </div>
          </div>
          <button onClick={() => { showToast(showBankModal === 'edit' ? 'Bank account updated!' : 'Bank account added!'); setShowBankModal(null); }}
            className="w-full btn-primary bg-orange-600">{showBankModal === 'edit' ? 'Save Changes' : 'Add Bank Account'}</button>
          <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> Bank-level encryption • PCI DSS compliant</p>
          {showBankModal === 'edit' && (
            <button onClick={() => { showToast('Bank account removed'); setShowBankModal(null); }} className="w-full py-2 text-sm text-red-400/50 hover:text-red-400">Remove this account</button>
          )}
        </div>
      </Modal>

      {/* ===== UPDATE PAYMENT MODAL ===== */}
      <Modal open={showUpdatePayment} onClose={() => setShowUpdatePayment(false)} title="Payment Methods">
        <div className="p-6 space-y-4">
          <button className="w-full text-left bg-surface-800 rounded-xl p-4 flex items-center gap-3 border border-white/5 hover:border-white/10 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><CreditCard className="w-5 h-5 text-blue-400" /></div>
            <div className="flex-1"><div className="text-sm text-white">Visa •••• 4242</div><div className="text-xs text-slate-500">Expires 12/28</div></div>
            <span className="badge bg-blue-500/15 text-blue-400">Default</span>
          </button>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Add New Card</label>
            <input placeholder="Card number" className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono focus:outline-none focus:border-orange-500/30 mb-2" />
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="MM/YY" className="px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-orange-500/30" />
              <input placeholder="CVV" type="password" className="px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-orange-500/30" />
              <input placeholder="ZIP" className="px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-orange-500/30" />
            </div>
          </div>
          <button onClick={() => { showToast('Payment method saved!'); setShowUpdatePayment(false); }}
            className="w-full btn-primary bg-orange-600">Save Card</button>
          <p className="text-[10px] text-slate-600 text-center flex items-center justify-center gap-1"><Shield className="w-3 h-3" /> Encrypted with 256-bit SSL</p>
        </div>
      </Modal>

      {/* ===== CANCEL SUBSCRIPTION MODAL ===== */}
      <Modal open={showCancelSub} onClose={() => setShowCancelSub(false)} variant="dialog" maxWidth="max-w-sm">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Cancel Growth Plan?</h3>
          <p className="text-sm text-slate-400 mb-2">Your subscription will remain active until the end of the current billing period (Apr 26, 2026).</p>
          <div className="bg-surface-800 rounded-xl p-3 mb-4 text-left">
            <div className="text-xs font-bold text-red-400 mb-1">You will lose:</div>
            {['Unlimited products', 'Featured storefront badge', 'Priority search listing', 'AI product descriptions', 'Advanced analytics'].map((f) => (
              <div key={f} className="flex items-center gap-2 text-xs text-slate-400"><X className="w-3 h-3 text-red-400" />{f}</div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowCancelSub(false)} className="flex-1 px-4 py-3 rounded-2xl bg-white/5 text-slate-300 font-medium hover:bg-white/10 transition-all active:scale-[0.97]">Keep Plan</button>
            <button onClick={() => { showToast('Subscription cancelled — active until Apr 26', 'info'); setShowCancelSub(false); }}
              className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-500 transition-all active:scale-[0.97]">Cancel Plan</button>
          </div>
        </div>
      </Modal>

      {/* ===== ADD/EDIT PRODUCT MODAL WITH AI ===== */}
      <Modal open={showAddProduct} onClose={closeModal} title={editingProductId ? 'Edit Product' : 'Add Product'}>
        <div className="p-6 space-y-4">
          {/* Photo Upload with AI */}
          <div>
            <label className="text-xs text-slate-500 mb-2 block flex items-center gap-1.5">
              <Camera className="w-3 h-3" /> Product Photo
              <span className="text-purple-400 ml-1 flex items-center gap-0.5"><Brain className="w-3 h-3" /> AI auto-detect</span>
            </label>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()}
              className={cn('w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden',
                productPhoto ? 'border-emerald-500/30' : 'border-white/10 hover:border-orange-500/30 bg-surface-800/50')}>
              {productPhoto ? (
                <img src={productPhoto} alt="Product" className="w-full h-full object-cover" />
              ) : aiProcessing ? (
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-purple-400">AI analyzing image...</p>
                </div>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">Tap to take photo or upload</p>
                  <p className="text-[10px] text-purple-400 mt-1"><Brain className="w-3 h-3 inline mr-0.5" /> AI will auto-detect product & create description</p>
                </>
              )}
            </button>
          </div>

          {aiDescription && (
            <div className="px-3 py-2 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <div className="flex items-center gap-1.5 mb-1"><Brain className="w-3 h-3 text-purple-400" /><span className="text-[10px] text-purple-400 font-bold">AI GENERATED</span></div>
              <p className="text-xs text-slate-300">{aiDescription}</p>
            </div>
          )}

          {aiRejection && (
            <div className="px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3 h-3 text-red-400" /><span className="text-[10px] text-red-400 font-bold">NOT ALLOWED</span></div>
              <p className="text-xs text-red-300">{aiRejection}</p>
              <p className="text-[10px] text-slate-500 mt-1">Please upload a photo of a natural food product to continue.</p>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Product Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product name"
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-orange-500/30" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-500 mb-1.5 block">Price ($) *</label><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-orange-500/30" /></div>
            <div><label className="text-xs text-slate-500 mb-1.5 block">Quantity *</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="50" className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white focus:outline-none focus:border-orange-500/30" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-slate-500 mb-1.5 block">Unit (US)</label><select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white">{['lb','oz','each','doz','bunch','pint','qt','gal','bushel','flat'].map((u) => <option key={u} value={u}>{u}</option>)}</select></div>
            <div><label className="text-xs text-slate-500 mb-1.5 block">Category</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white">{['Fruits','Vegetables','Dairy','Bakery','Meat','Honey','Herbs','Preserves','Beverages'].map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your product..."
              className="w-full px-4 py-3 bg-surface-800 border border-white/5 rounded-xl text-white resize-none h-24 focus:outline-none focus:border-orange-500/30" />
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 px-1"><Leaf className="w-3 h-3" /> Products must comply with our Natural Food Pledge (no GMO, no pesticides, no chemicals)</div>
          <button onClick={saveProduct} disabled={!form.name || !form.price}
            className="w-full btn-primary bg-orange-600 flex items-center justify-center gap-2 disabled:opacity-30">
            <Zap className="w-4 h-4" /> {editingProductId ? 'Update Product' : 'Publish to Marketplace'}
          </button>
        </div>
      </Modal>

      {/* Payment Modals */}
      <SubscriptionModal open={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} />
      <DriverPayoutModal open={showPayoutModal} onClose={() => setShowPayoutModal(false)} earnings={totalRevenue * 0.85} />
    </AppShell>
  );
}

// ============================================================
// FARMER ANALYTICS DASHBOARD
// ============================================================
function FarmerAnalytics({ farmer, myProducts, myOrders, db, totalRevenue }: { farmer: any; myProducts: any[]; myOrders: any[]; db: any; totalRevenue: number }) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const delivered = myOrders.filter((o: any) => o.status === 'Delivered');
  const pending = myOrders.filter((o: any) => o.status === 'Pending' || o.status === 'Processing');
  const cancelled = myOrders.filter((o: any) => o.status === 'Cancelled');
  const avgOrderValue = totalRevenue / (delivered.length || 1);
  const fulfillmentRate = myOrders.length > 0 ? (delivered.length / myOrders.length) * 100 : 0;
  const cancelRate = myOrders.length > 0 ? (cancelled.length / myOrders.length) * 100 : 0;
  const totalItemsSold = myProducts.reduce((s: number, p: any) => s + p.sales, 0);
  const lowStock = myProducts.filter((p: any) => p.stock > 0 && p.stock <= 5);
  const outOfStock = myProducts.filter((p: any) => p.stock === 0);
  const topProducts = [...myProducts].sort((a, b) => b.sales - a.sales).slice(0, 5);
  const categories = Array.from(new Set(myProducts.map((p: any) => p.category)));
  const reviews = db.reviews.filter((r: any) => myProducts.some((p: any) => p.id === r.productId));
  const avgRating = reviews.length > 0 ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0;

  // Simulated daily data based on period
  const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const chartLabels = period === '7d' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] :
    period === '30d' ? Array.from({length: 4}, (_, i) => `Week ${i+1}`) :
    period === '90d' ? ['Jan','Feb','Mar'] :
    ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const revenueData = chartLabels.map((_, i) => {
    const base = totalRevenue / chartLabels.length;
    return Math.max(0, base + (Math.random() - 0.3) * base * 1.5);
  });
  const ordersData = chartLabels.map((_, i) => {
    const base = myOrders.length / chartLabels.length;
    return Math.max(0, Math.round(base + (Math.random() - 0.3) * base * 2));
  });
  const maxRevenue = Math.max(...revenueData, 1);

  const toggle = (id: string) => setExpandedSection(expandedSection === id ? null : id);

  return (
    <div className="space-y-5 pb-24 lg:pb-4">
      {/* Header + Period Selector */}
      <div className="flex items-center justify-between animate-fade-in">
        <h2 className="text-xl font-display font-bold text-white">Analytics</h2>
        <div className="flex bg-surface-800 rounded-xl p-1 border border-white/5">
          {(['7d','30d','90d','12m'] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-semibold transition-all', period === p ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-white')}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Revenue', value: formatCurrency(totalRevenue), trend: totalRevenue > 0 ? 'Active' : 'No data', up: totalRevenue > 0, icon: DollarSign, color: '#10B981', detail: `${delivered.length} completed orders` },
          { label: 'Orders', value: `${myOrders.length}`, trend: `${pending.length} active`, up: true, icon: ShoppingBag, color: '#EA580C', detail: `${fulfillmentRate.toFixed(0)}% fulfillment rate` },
          { label: 'Avg Order', value: formatCurrency(avgOrderValue), trend: avgOrderValue > 0 ? formatCurrency(avgOrderValue) : 'No data', up: avgOrderValue > 0, icon: TrendingUp, color: '#3B82F6', detail: `${totalItemsSold} total items sold` },
          { label: 'Rating', value: avgRating > 0 ? avgRating.toFixed(1) : (farmer.rating?.toFixed(1) || '–'), trend: `${reviews.length} reviews`, up: true, icon: Star, color: '#F59E0B', detail: `${reviews.filter((r: any) => r.rating >= 4).length} positive` },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <button key={kpi.label} onClick={() => toggle(kpi.label)} className="text-left card-glow bg-surface-800/50 border border-white/5 rounded-2xl p-4 animate-fade-in-up transition-all hover:border-white/10 active:scale-[0.98]" style={{ animationDelay: `${i * 60}ms`, color: kpi.color }}>
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                <span className={cn('text-[10px] font-semibold flex items-center gap-0.5', kpi.up ? 'text-emerald-400' : 'text-red-400')}>
                  {kpi.up ? <ArrowRight className="w-2.5 h-2.5 rotate-[-45deg]" /> : null}{kpi.trend}
                </span>
              </div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-[10px] text-slate-500 mt-1">{kpi.label}</div>
              {expandedSection === kpi.label && (
                <div className="mt-2 pt-2 border-t border-white/5 text-xs text-slate-400 animate-fade-in">{kpi.detail}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
        <button onClick={() => toggle('revenue')} className="w-full flex items-center justify-between mb-4 text-left">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue Overview</div>
            <div className="text-lg font-bold text-white mt-0.5">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded">{totalRevenue > 0 ? 'Active' : 'No data'}</span>
            <ChevronRight className={cn('w-4 h-4 text-slate-500 transition-transform', expandedSection === 'revenue' && 'rotate-90')} />
          </div>
        </button>
        <div className="flex items-end gap-1.5" style={{ height: 140 }}>
          {chartLabels.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-slate-500 font-mono">{formatCurrency(revenueData[i]).replace('$','')}</span>
              <div className="w-full relative rounded-t-md overflow-hidden bg-white/5" style={{ height: 100 }}>
                <div className="absolute bottom-0 left-0 right-0 rounded-t-md transition-all duration-700" style={{ height: `${(revenueData[i] / maxRevenue) * 100}%`, backgroundColor: '#EA580C', opacity: 0.7, animationDelay: `${i * 60}ms` }} />
              </div>
              <span className="text-[9px] text-slate-600">{label}</span>
            </div>
          ))}
        </div>
        {expandedSection === 'revenue' && (
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-3 animate-fade-in">
            {[
              { label: 'Platform Fees Paid', value: formatCurrency(totalRevenue * (db.settings.platformFeePercent / 100)) },
              { label: 'Net After Fees', value: formatCurrency(totalRevenue * (1 - db.settings.platformFeePercent / 100)) },
              { label: 'Avg Daily Revenue', value: formatCurrency(totalRevenue / periodDays) },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-sm font-bold text-white">{s.value}</div>
                <div className="text-[10px] text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Orders Breakdown */}
      <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <button onClick={() => toggle('orders')} className="w-full flex items-center justify-between mb-4 text-left">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order Breakdown</div>
          <ChevronRight className={cn('w-4 h-4 text-slate-500 transition-transform', expandedSection === 'orders' && 'rotate-90')} />
        </button>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Delivered', count: delivered.length, color: '#10B981', pct: myOrders.length > 0 ? (delivered.length / myOrders.length * 100) : 0 },
            { label: 'Active', count: pending.length, color: '#F59E0B', pct: myOrders.length > 0 ? (pending.length / myOrders.length * 100) : 0 },
            { label: 'Cancelled', count: cancelled.length, color: '#EF4444', pct: cancelRate },
            { label: 'Total', count: myOrders.length, color: '#EA580C', pct: 100 },
          ].map((s) => (
            <button key={s.label} onClick={() => toggle('orders')} className="bg-surface-800 rounded-xl p-3 text-center hover:bg-surface-800/80 transition-all active:scale-[0.97]">
              <div className="text-lg font-bold text-white">{s.count}</div>
              <div className="text-[10px] text-slate-500">{s.label}</div>
              <div className="w-full h-1 rounded-full bg-white/5 mt-2">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
              </div>
            </button>
          ))}
        </div>
        {expandedSection === 'orders' && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2 animate-fade-in">
            <div className="flex justify-between text-xs"><span className="text-slate-400">Fulfillment Rate</span><span className="text-white font-bold">{fulfillmentRate.toFixed(1)}%</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400">Cancel Rate</span><span className={cn('font-bold', cancelRate > 10 ? 'text-red-400' : 'text-white')}>{cancelRate.toFixed(1)}%</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400">Avg Fulfillment Time</span><span className="text-white font-bold">~24 min</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400">Repeat Customer Rate</span><span className="text-emerald-400 font-bold">67%</span></div>
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '450ms' }}>
        <button onClick={() => toggle('products')} className="w-full flex items-center justify-between mb-4 text-left">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top Products</div>
          <ChevronRight className={cn('w-4 h-4 text-slate-500 transition-transform', expandedSection === 'products' && 'rotate-90')} />
        </button>
        {topProducts.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No products yet</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((p: any, i: number) => {
              const maxSales = topProducts[0]?.sales || 1;
              return (
                <div key={p.id} className="flex items-center gap-3 group">
                  <span className="text-xs text-slate-600 w-4 font-mono font-bold">{i + 1}</span>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-800 flex items-center justify-center">
                    {p.image?.startsWith?.('data:') ? <img src={p.image} className="w-full h-full object-cover" /> : <span className="text-lg">{p.image}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{p.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">{p.sales} sold</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-orange-400 font-semibold">{formatCurrency(p.price)}/{p.unit}</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-white/5 mt-1.5">
                      <div className="h-full rounded-full bg-orange-500/60 transition-all duration-700" style={{ width: `${(p.sales / maxSales) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-white">{formatCurrency(p.price * p.sales)}</div>
                    <div className="flex items-center justify-end gap-0.5 mt-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs text-slate-400">{p.rating || '–'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {expandedSection === 'products' && myProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Sales by Category</div>
            <div className="space-y-2">
              {categories.map((cat: string) => {
                const catProducts = myProducts.filter((p: any) => p.category === cat);
                const catSales = catProducts.reduce((s: number, p: any) => s + p.sales, 0);
                const catRevenue = catProducts.reduce((s: number, p: any) => s + p.price * p.sales, 0);
                return (
                  <div key={cat} className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 w-20">{cat}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-orange-500/50 transition-all duration-700" style={{ width: `${totalItemsSold > 0 ? (catSales / totalItemsSold) * 100 : 0}%` }} />
                    </div>
                    <span className="text-xs text-white font-mono w-16 text-right">{formatCurrency(catRevenue)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Inventory Health */}
      <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '550ms' }}>
        <button onClick={() => toggle('inventory')} className="w-full flex items-center justify-between mb-4 text-left">
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Inventory Health</div>
            {(lowStock.length > 0 || outOfStock.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </div>
          <ChevronRight className={cn('w-4 h-4 text-slate-500 transition-transform', expandedSection === 'inventory' && 'rotate-90')} />
        </button>
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => toggle('inventory')} className="bg-surface-800 rounded-xl p-3 text-center hover:bg-surface-800/80 transition-all active:scale-[0.97]">
            <div className="text-lg font-bold text-emerald-400">{myProducts.filter((p: any) => p.stock > 5).length}</div>
            <div className="text-[10px] text-slate-500">In Stock</div>
          </button>
          <button onClick={() => toggle('inventory')} className="bg-surface-800 rounded-xl p-3 text-center hover:bg-surface-800/80 transition-all active:scale-[0.97]">
            <div className={cn('text-lg font-bold', lowStock.length > 0 ? 'text-amber-400' : 'text-white')}>{lowStock.length}</div>
            <div className="text-[10px] text-slate-500">Low Stock</div>
          </button>
          <button onClick={() => toggle('inventory')} className="bg-surface-800 rounded-xl p-3 text-center hover:bg-surface-800/80 transition-all active:scale-[0.97]">
            <div className={cn('text-lg font-bold', outOfStock.length > 0 ? 'text-red-400' : 'text-white')}>{outOfStock.length}</div>
            <div className="text-[10px] text-slate-500">Out of Stock</div>
          </button>
        </div>
        {expandedSection === 'inventory' && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2 animate-fade-in">
            {outOfStock.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-slate-300 flex-1">{p.name}</span><span className="text-red-400 font-bold">OUT OF STOCK</span></div>
            ))}
            {lowStock.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 text-xs"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-slate-300 flex-1">{p.name}</span><span className="text-amber-400 font-bold">{p.stock} left</span></div>
            ))}
            {outOfStock.length === 0 && lowStock.length === 0 && <p className="text-xs text-emerald-400 text-center">✓ All products well-stocked</p>}
          </div>
        )}
      </div>

      {/* Customer Insights */}
      <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '650ms' }}>
        <button onClick={() => toggle('customers')} className="w-full flex items-center justify-between mb-4 text-left">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Insights</div>
          <ChevronRight className={cn('w-4 h-4 text-slate-500 transition-transform', expandedSection === 'customers' && 'rotate-90')} />
        </button>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Unique Customers', value: Array.from(new Set(myOrders.map((o: any) => o.customerId))).length, icon: '👥' },
            { label: 'Repeat Orders', value: `${myOrders.length > 0 ? Math.round((myOrders.length - Array.from(new Set(myOrders.map((o: any) => o.customerId))).length) / myOrders.length * 100) : 0}%`, icon: '🔄' },
            { label: 'Avg Rating', value: avgRating > 0 ? `★ ${avgRating.toFixed(1)}` : '★ –', icon: '⭐' },
            { label: 'Reviews', value: reviews.length, icon: '💬' },
          ].map((s) => (
            <button key={s.label} onClick={() => toggle('customers')} className="bg-surface-800 rounded-xl p-3 flex items-center gap-3 hover:bg-surface-800/80 transition-all active:scale-[0.97]">
              <span className="text-xl">{s.icon}</span>
              <div className="text-left">
                <div className="text-sm font-bold text-white">{s.value}</div>
                <div className="text-[10px] text-slate-500">{s.label}</div>
              </div>
            </button>
          ))}
        </div>
        {expandedSection === 'customers' && reviews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Rating Distribution</div>
            {[5,4,3,2,1].map((stars) => {
              const count = reviews.filter((r: any) => r.rating === stars).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-slate-400 w-8">{stars}★</span>
                  <div className="flex-1 h-2 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-amber-500/60 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
                </div>
              );
            })}
            <div className="mt-3 space-y-2">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">Latest Reviews</div>
              {reviews.slice(0, 3).map((r: any) => (
                <div key={r.id} className="bg-surface-900 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{r.customerName}</span>
                    <div className="flex gap-0.5">{Array.from({length: 5}).map((_, j) => <Star key={j} className={cn('w-2.5 h-2.5', j < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700')} />)}</div>
                  </div>
                  <p className="text-xs text-slate-400">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="card p-5 animate-fade-in-up" style={{ animationDelay: '750ms' }}>
        <button onClick={() => toggle('performance')} className="w-full flex items-center justify-between mb-4 text-left">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Performance Scorecard</div>
          <ChevronRight className={cn('w-4 h-4 text-slate-500 transition-transform', expandedSection === 'performance' && 'rotate-90')} />
        </button>
        <div className="space-y-4">
          {[
            { label: 'Fulfillment Rate', value: fulfillmentRate, target: 95, color: fulfillmentRate >= 90 ? '#10B981' : '#F59E0B', icon: '📦' },
            { label: 'Customer Rating', value: (avgRating || farmer.rating || 0) * 20, target: 90, color: (avgRating || farmer.rating || 0) >= 4.5 ? '#10B981' : '#F59E0B', icon: '⭐', display: `${(avgRating || farmer.rating || 0).toFixed(1)}/5.0` },
            { label: 'Response Time', value: 85, target: 90, color: '#3B82F6', icon: '⚡', display: '~12 min avg' },
            { label: 'Stock Health', value: myProducts.length > 0 ? ((myProducts.length - outOfStock.length) / myProducts.length) * 100 : 100, target: 95, color: outOfStock.length > 0 ? '#F59E0B' : '#10B981', icon: '📊' },
          ].map((metric) => (
            <button key={metric.label} onClick={() => toggle('performance')} className="w-full text-left hover:bg-white/[0.02] rounded-lg p-1 transition-all">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-300 flex items-center gap-1.5"><span>{metric.icon}</span>{metric.label}</span>
                <span className="text-xs font-bold text-white">{metric.display || `${metric.value.toFixed(0)}%`}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5">
                <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${Math.min(metric.value, 100)}%`, backgroundColor: metric.color }}>
                  {metric.target && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/30 rounded-full" style={{ right: `${100 - (metric.target / Math.max(metric.value, metric.target)) * 100}%` }} />
                  )}
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-slate-600">0%</span>
                <span className="text-[9px] text-slate-600">Target: {metric.target}%</span>
              </div>
            </button>
          ))}
        </div>
        {expandedSection === 'performance' && (
          <div className="mt-4 pt-4 border-t border-white/5 animate-fade-in">
            <div className="bg-surface-800 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">{fulfillmentRate >= 90 && (avgRating || farmer.rating || 0) >= 4.5 ? '🏆' : fulfillmentRate >= 75 ? '🥈' : '📈'}</div>
              <div className="text-sm font-bold text-white">{fulfillmentRate >= 90 ? 'Excellent Performance' : fulfillmentRate >= 75 ? 'Good — Room for Growth' : 'Needs Improvement'}</div>
              <p className="text-xs text-slate-400 mt-1">
                {fulfillmentRate >= 90 ? 'Your farm is performing above average! Keep it up.' : 'Focus on fulfillment rate and stock availability to improve your score.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
