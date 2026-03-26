'use client';

import { useAppStore } from '@/lib/app-store';
import { UserRole } from '@/lib/store';
import { ShoppingCart, Truck, Store, Shield, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const roles: {
  id: UserRole;
  label: string;
  icon: React.ReactNode;
  emoji: string;
  color: string;
  bg: string;
  description: string;
}[] = [
  {
    id: 'customer',
    label: 'Consumer',
    emoji: '🛒',
    icon: <ShoppingCart className="w-7 h-7" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/15',
    description: 'Shop fresh local produce',
  },
  {
    id: 'driver',
    label: 'Driver',
    emoji: '🚗',
    icon: <Truck className="w-7 h-7" />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/15',
    description: 'Deliver orders and earn',
  },
  {
    id: 'farmer',
    label: 'Farmer American Hero',
    emoji: '🌾',
    icon: <Store className="w-7 h-7" />,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40 hover:bg-orange-500/15',
    description: 'Sell your natural farm products 🇺🇸',
  },
];

export function RoleSelection() {
  const { setRole, db } = useAppStore();
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  return (
    <div className="min-h-dvh bg-surface-950 relative overflow-hidden flex items-center justify-center">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw] rounded-full bg-blue-600/[0.03] blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-orange-600/[0.02] blur-[80px]" />
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6 py-12">
        {/* Logo */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <span className="text-4xl">🥬</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-white tracking-tight">
            FarmFresh
          </h1>
          <p className="font-display text-5xl font-bold text-emerald-400 tracking-tight -mt-1">
            Hub
          </p>
          <p className="text-slate-500 mt-4 text-sm tracking-wide uppercase">
            Florida&apos;s premier decentralized food network
          </p>
        </div>

        {/* Role Cards */}
        <div className="space-y-3">
          {roles.map((role, i) => (
            <button
              key={role.id}
              onClick={() => setRole(role.id)}
              onMouseEnter={() => setHoveredRole(role.id)}
              onMouseLeave={() => setHoveredRole(null)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group',
                role.bg
              )}
              style={{
                animationDelay: `${i * 80}ms`,
                animation: 'slideUp 0.5s ease-out both',
              }}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300',
                  role.color,
                  hoveredRole === role.id && 'scale-110'
                )}
              >
                <span className="text-3xl">{role.emoji}</span>
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-white text-lg">
                  {role.label}
                </div>
                <div className="text-sm text-slate-500">{role.description}</div>
              </div>
              <div className="text-slate-600 group-hover:text-slate-400 transition-colors text-2xl font-light">
                ›
              </div>
            </button>
          ))}
        </div>

        {/* God Mode */}
        <button
          onClick={() => setRole('owner')}
          className="w-full mt-8 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border border-dashed border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/5 transition-all duration-300 group"
        >
          <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            God Mode
          </span>
        </button>

        {/* Status Bar */}
        <div className="mt-12 flex items-center justify-center gap-4 px-5 py-3 rounded-xl bg-surface-800/50 border border-white/5">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'status-dot',
                db.settings.maintenanceMode
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-emerald-500'
              )}
            />
            <span className="text-xs text-slate-500">
              {db.settings.maintenanceMode ? 'LOCKED' : 'ONLINE'}
            </span>
          </div>
          <div className="w-px h-3 bg-slate-700" />
          <span className="text-xs text-slate-500">
            Fee: {db.settings.platformFeePercent}%
          </span>
          <div className="w-px h-3 bg-slate-700" />
          <span className="text-xs text-slate-500">
            {db.users.length} users
          </span>
        </div>
      </div>
    </div>
  );
}
