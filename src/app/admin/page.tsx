'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/app-store';
import {
  LayoutDashboard, Brain, TrendingUp, Radio, Users, Settings,
  ChevronLeft, ChevronRight, Zap, Shield, ArrowLeft,
} from 'lucide-react';
import { CommandDashboard } from '@/components/mission-control/command-dashboard';
import { AIAgent } from '@/components/mission-control/ai-agent';
import { FinanceDashboard } from '@/components/mission-control/finance-dashboard';
import { OperationsCenter } from '@/components/mission-control/operations-center';
import { UserManagement } from '@/components/mission-control/user-management';
import { PlatformSettings } from '@/components/mission-control/platform-settings';

const modules = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard, color: '#DC2626' },
  { id: 'ai', label: 'AI Agent', icon: Brain, color: '#8B5CF6' },
  { id: 'finance', label: 'Finance', icon: TrendingUp, color: '#10B981' },
  { id: 'operations', label: 'Operations', icon: Radio, color: '#3B82F6' },
  { id: 'users', label: 'Users', icon: Users, color: '#F59E0B' },
  { id: 'settings', label: 'Settings', icon: Settings, color: '#6B7280' },
];

export default function AdminPage() {
  const { db } = useAppStore();
  const [mod, setMod] = useState('command');
  const [collapsed, setCollapsed] = useState(false);
  const online = db.users.filter((u) => u.role === 'driver' && u.online).length;
  const pending = db.orders.filter((o) => o.status === 'Pending').length;

  return (
    <div className="flex min-h-dvh bg-[#020617]">
      {/* Sidebar */}
      <aside className={`hidden lg:flex flex-col border-r border-white/[0.04] bg-[#030712] transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-5 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/20 flex items-center justify-center flex-shrink-0"><Shield className="w-5 h-5 text-red-400" /></div>
            {!collapsed && <div><div className="font-bold text-white text-sm">MISSION</div><div className="font-bold text-red-400 text-sm -mt-0.5">CONTROL</div></div>}
          </div>
        </div>
        {!collapsed && (
          <div className="px-5 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[10px] text-emerald-400 font-mono font-bold">SYNCED WITH APP</span></div>
            <div className="flex gap-3 mt-2"><span className="text-[10px] text-slate-500 font-mono">{online} DRV</span><span className="text-[10px] text-slate-500 font-mono">{pending} PND</span><span className="text-[10px] text-slate-500 font-mono">Fee {db.settings.platformFeePercent}%</span></div>
          </div>
        )}
        <nav className="flex-1 py-3 px-3 space-y-1">
          {modules.map((m) => { const Icon = m.icon; const active = mod === m.id; return (
            <button key={m.id} onClick={() => setMod(m.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'text-white' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'}`} style={active ? { backgroundColor: m.color + '12', color: m.color } : undefined}>
              <Icon className="w-5 h-5 flex-shrink-0" />{!collapsed && <span>{m.label}</span>}{active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />}
            </button>
          )})}
        </nav>
        <div className="p-3 border-t border-white/[0.04] space-y-1">
          <a href="/" className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-600 hover:text-slate-400 hover:bg-white/[0.02] text-xs"><ArrowLeft className="w-4 h-4" />{!collapsed && 'Back to App'}</a>
          <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-600 hover:text-slate-400 hover:bg-white/[0.02] text-xs">{collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /> Collapse</>}</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-dvh overflow-hidden">
        <header className="h-14 border-b border-white/[0.04] flex items-center justify-between px-6 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <a href="/" className="lg:hidden flex items-center gap-2 mr-3"><ArrowLeft className="w-4 h-4 text-slate-400" /></a>
            <div className="lg:hidden"><Shield className="w-5 h-5 text-red-400" /></div>
            <h1 className="font-bold text-white text-lg">{modules.find((m) => m.id === mod)?.label}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /><span className="text-[10px] text-emerald-400 font-mono">LIVE SYNC</span></div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]"><Zap className="w-3 h-3 text-amber-400" /><span className="text-xs font-mono text-slate-400">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span></div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          {mod === 'command' && <CommandDashboard />}
          {mod === 'ai' && <AIAgent />}
          {mod === 'finance' && <FinanceDashboard />}
          {mod === 'operations' && <OperationsCenter />}
          {mod === 'users' && <UserManagement />}
          {mod === 'settings' && <PlatformSettings />}
        </div>
        {/* Mobile nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#030712]/95 backdrop-blur-xl border-t border-white/[0.04] z-20 safe-bottom">
          <div className="flex justify-around py-2 px-1">
            {modules.map((m) => { const Icon = m.icon; return (
              <button key={m.id} onClick={() => setMod(m.id)} className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-xl min-w-[48px] ${mod === m.id ? 'text-white' : 'text-slate-600'}`} style={mod === m.id ? { color: m.color } : undefined}>
                <Icon className="w-5 h-5" /><span className="text-[9px] font-medium">{m.label.split(' ')[0]}</span>
              </button>
            )})}
          </div>
        </nav>
      </main>
    </div>
  );
}
