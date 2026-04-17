'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// Role-specific welcome slides shown AFTER auth, BEFORE entering the app
// Purpose: contextual intro for each role's workflow

interface RoleSlide {
  emoji: string;
  title: string;
  desc: string;
  accent: string;
}

const CONSUMER_SLIDES: RoleSlide[] = [
  { emoji: '🛒', title: 'Shop Local', desc: 'Browse fresh produce, dairy, meat, eggs and more — all from farms in your region.', accent: '#10B981' },
  { emoji: '📦', title: 'Track Delivery', desc: 'Follow your driver in real-time from pickup to your door with live GPS.', accent: '#10B981' },
  { emoji: '⭐', title: 'Rate & Review', desc: 'Share your experience and help the community find the best farmers.', accent: '#10B981' },
];

const DRIVER_SLIDES: RoleSlide[] = [
  { emoji: '🚗', title: 'Accept Deliveries', desc: 'See nearby orders, accept jobs, and earn money on your own schedule.', accent: '#3B82F6' },
  { emoji: '🗺️', title: 'Navigate with Ease', desc: 'One-tap Google Maps or Apple Maps navigation from pickup to drop-off.', accent: '#3B82F6' },
  { emoji: '💰', title: 'Get Paid Fast', desc: 'Instant payouts to your bank via Stripe. Track earnings in real-time.', accent: '#3B82F6' },
];

const FARMER_SLIDES: RoleSlide[] = [
  { emoji: '🌾', title: 'Sell Direct', desc: 'List your products and reach thousands of local consumers without a middleman.', accent: '#F97316' },
  { emoji: '📸', title: 'AI Product Photos', desc: 'Snap a photo — our AI writes compelling descriptions automatically.', accent: '#F97316' },
  { emoji: '📊', title: 'Grow Your Farm', desc: 'Track orders, manage inventory, and analyze sales with powerful tools.', accent: '#F97316' },
];

function RoleWelcome({ slides, onComplete, accentColor }: { slides: RoleSlide[]; onComplete: () => void; accentColor: string }) {
  const [page, setPage] = useState(0);
  const s = slides[page];
  const isLast = page === slides.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#0a0f1e', zIndex: 9999, overflow: 'hidden' }}>
      {/* Ambient gradient */}
      <div style={{ position: 'absolute', top: '-30%', left: '-20%', width: '60vw', height: '60vw', borderRadius: '50%', background: `${accentColor}15`, filter: 'blur(120px)' }} />

      {/* Skip */}
      <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 10 }}>
        <button onClick={onComplete} style={{ color: '#64748b', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'system-ui' }}>Skip</button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 96, marginBottom: 32 }}>{s.emoji}</div>
        <h1 style={{ color: '#fff', fontSize: 26, fontWeight: 700, margin: '0 0 12px', fontFamily: 'system-ui', maxWidth: 320 }}>{s.title}</h1>
        <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 320, fontFamily: 'system-ui' }}>{s.desc}</p>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24, position: 'relative', zIndex: 10 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => setPage(i)} style={{
            width: i === page ? 28 : 8, height: 8, borderRadius: 4, border: 'none',
            background: i === page ? accentColor : 'rgba(255,255,255,0.15)',
            cursor: 'pointer', transition: 'all 0.3s',
          }} />
        ))}
      </div>

      {/* Button */}
      <div style={{ padding: '0 24px 36px', position: 'relative', zIndex: 10 }}>
        <button
          onClick={() => isLast ? onComplete() : setPage(page + 1)}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 16, fontSize: 16, fontWeight: 600, fontFamily: 'system-ui',
            background: accentColor, color: '#fff', border: 'none', cursor: 'pointer',
          }}
        >
          {isLast ? "Let's Go →" : 'Next'}
        </button>
      </div>
    </div>
  );
}

export function ConsumerWelcome({ onComplete }: { onComplete: () => void }) {
  return <RoleWelcome slides={CONSUMER_SLIDES} onComplete={onComplete} accentColor="#10B981" />;
}

export function DriverWelcome({ onComplete }: { onComplete: () => void }) {
  return <RoleWelcome slides={DRIVER_SLIDES} onComplete={onComplete} accentColor="#3B82F6" />;
}

export function FarmerWelcome({ onComplete }: { onComplete: () => void }) {
  return <RoleWelcome slides={FARMER_SLIDES} onComplete={onComplete} accentColor="#F97316" />;
}
