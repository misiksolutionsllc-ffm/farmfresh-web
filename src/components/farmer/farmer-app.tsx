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
} from 'lucide-react';

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
  { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
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
                      <button onClick={() => { setUploadedDocs((prev) => ({ ...prev, [doc.id]: true })); showToast(`${doc.name} uploaded`); }}
                        className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0',
                          uploadedDocs[doc.id] ? 'text-emerald-400 bg-emerald-500/10' : 'text-orange-400 bg-orange-500/10 hover:bg-orange-500/20')}>
                        {uploadedDocs[doc.id] ? '✓ Done' : 'Upload'}
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
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
  const [aiProcessing, setAiProcessing] = useState(false);
  const [productPhoto, setProductPhoto] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState('');
  const [form, setForm] = useState({ name: '', price: '', unit: 'lb', category: 'Vegetables', stock: '', description: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const farmer = db.users.find((u) => u.id === currentUserId);
  const myProducts = db.products.filter((p) => p.farmerId === currentUserId);
  const myOrders = db.orders.filter((o) => o.merchantId === currentUserId);
  const totalRevenue = myOrders.filter((o) => o.status === 'Delivered').reduce((sum, o) => sum + o.fees.subtotal, 0);

  // Simulate AI photo recognition
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProductPhoto(ev.target?.result as string);
      // Simulate AI processing
      setAiProcessing(true);
      setTimeout(() => {
        // AI generates product info based on "detected" item
        const aiProducts = [
          { name: 'Organic Roma Tomatoes', desc: 'Vine-ripened Roma tomatoes, naturally grown without pesticides. Perfect for sauces, salads, and cooking. Rich in lycopene and vitamins.', cat: 'Vegetables', unit: 'lb', price: '3.99' },
          { name: 'Fresh Honeycrisp Apples', desc: 'Crisp and sweet Honeycrisp apples, hand-picked at peak ripeness. No wax coating, no pesticides — just pure natural goodness.', cat: 'Fruits', unit: 'lb', price: '4.49' },
          { name: 'Free-Range Farm Eggs', desc: 'Pasture-raised eggs from free-roaming hens fed an all-natural diet. Rich, golden yolks with superior nutrition and taste.', cat: 'Dairy', unit: 'doz', price: '6.99' },
        ];
        const picked = aiProducts[Math.floor(Math.random() * aiProducts.length)];
        setForm((prev) => ({ ...prev, name: picked.name, description: picked.desc, category: picked.cat, unit: picked.unit, price: picked.price }));
        setAiDescription(picked.desc);
        setAiProcessing(false);
        showToast('AI detected product and generated description!');
      }, 2000);
    };
    reader.readAsDataURL(file);
  };

  const saveProduct = () => {
    if (!form.name || !form.price) return;
    dispatch({
      type: 'ADD_PRODUCT',
      payload: { farmerId: currentUserId!, name: form.name, price: parseFloat(form.price), unit: form.unit, category: form.category, stock: parseInt(form.stock) || 50, description: form.description },
    });
    showToast('Product published to marketplace! 🎉');
    setShowAddProduct(false);
    setForm({ name: '', price: '', unit: 'lb', category: 'Vegetables', stock: '', description: '' });
    setProductPhoto(null);
    setAiDescription('');
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
            myOrders.map((order, i) => (
              <div key={order.id} className={cn('bg-surface-800/50 border rounded-2xl p-5 transition-all animate-fade-in-up', order.status === 'Pending' ? 'border-amber-500/20' : 'border-white/5')} style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                  <span className={cn('badge', getStatusColor(order.status))}>{order.status}</span>
                </div>
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm mb-1"><span className="text-slate-300">{item.image} {item.name} × {item.qty}</span><span className="text-slate-400">{formatCurrency(item.price * item.qty)}</span></div>
                ))}
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5">
                  <span className="font-bold text-white">{formatCurrency(order.fees.subtotal)}</span>
                  {order.status === 'Pending' && <button onClick={() => { dispatch({ type: 'UPDATE_ORDER', payload: { id: order.id, status: 'Processing' } }); showToast('Accepted'); }} className="btn-primary bg-orange-600 text-sm py-2">Accept</button>}
                  {order.status === 'Processing' && <button onClick={() => { dispatch({ type: 'MARK_READY', id: order.id }); showToast('Ready!'); }} className="btn-primary bg-emerald-600 text-sm py-2"><CheckCircle2 className="w-4 h-4 inline mr-1" />Mark Ready</button>}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== PRODUCTS ===== */}
      {activeTab === 'products' && (
        <div className="space-y-4 pb-24 lg:pb-4">
          <div className="flex items-center justify-between animate-fade-in">
            <h2 className="text-xl font-display font-bold text-white">My Products ({myProducts.length})</h2>
            <button onClick={() => setShowAddProduct(true)} className="btn-primary bg-orange-600 text-sm py-2.5 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
          {myProducts.map((p, i) => (
            <div key={p.id} className="bg-surface-800/50 border border-white/5 rounded-2xl p-4 flex items-center gap-4 card-hover animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-14 h-14 bg-surface-800 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">{p.image}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate">{p.name}</h3>
                <span className="text-sm font-bold text-orange-400">{formatCurrency(p.price)}/{p.unit}</span>
                <span className="text-xs text-slate-500 ml-2">• {p.stock} in stock • {p.sales} sold</span>
              </div>
              <button onClick={() => { dispatch({ type: 'DELETE_PRODUCT', id: p.id }); showToast('Removed'); }} className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/5"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}

      {/* ===== ANALYTICS ===== */}
      {activeTab === 'analytics' && (
        <div className="space-y-4 pb-24 lg:pb-4 animate-fade-in">
          <h2 className="text-xl font-display font-bold text-white">Analytics</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Revenue', value: formatCurrency(totalRevenue), color: '#10B981', icon: DollarSign },
              { label: 'Orders', value: `${myOrders.length}`, color: '#EA580C', icon: ShoppingBag },
              { label: 'Products', value: `${myProducts.length}`, color: '#3B82F6', icon: Package },
              { label: 'Rating', value: farmer.rating?.toFixed(1) || '–', color: '#F59E0B', icon: Star },
            ].map((s) => { const Icon = s.icon; return (
              <div key={s.label} className="card-glow bg-surface-800/50 border border-white/5 rounded-2xl p-4" style={{ color: s.color }}>
                <Icon className="w-4 h-4 mb-2" style={{ color: s.color }} />
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ); })}
          </div>
        </div>
      )}

      {/* ===== PROFILE ===== */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 lg:pb-4 animate-fade-in">
          <div className="text-center bg-gradient-to-br from-orange-600/10 to-surface-800/30 border border-white/5 rounded-3xl p-8">
            <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🌾</span>
            </div>
            <h2 className="text-xl font-bold text-white">{farmer.businessName || farmer.name}</h2>
            <p className="text-sm text-slate-400">{farmer.name}</p>
            <p className="text-sm text-slate-500 mt-1">{farmer.email}</p>
            {farmer.address && <p className="text-xs text-slate-500 mt-2"><MapPin className="w-3 h-3 inline mr-1" />{farmer.address.street}, {farmer.address.city}, {farmer.address.state}</p>}
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold">Verified Farmer American Hero</span>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && <div className="pb-24"><h2 className="text-xl font-display font-bold text-white mb-4">Notifications</h2><p className="text-slate-400 text-center py-12">No notifications</p></div>}

      {/* ===== ADD PRODUCT MODAL WITH AI ===== */}
      <Modal open={showAddProduct} onClose={() => { setShowAddProduct(false); setProductPhoto(null); setAiDescription(''); }} title="Add Product">
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
            <Zap className="w-4 h-4" /> Publish to Marketplace
          </button>
        </div>
      </Modal>
    </AppShell>
  );
}
